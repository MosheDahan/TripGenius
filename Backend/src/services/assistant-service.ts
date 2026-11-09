import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import db from '../dal/db';

export class AssistantServiceError extends Error {
    constructor(public readonly statusCode: number, message: string) {
        super(message);
        this.name = 'AssistantServiceError';
    }
}

interface ChatToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: ChatToolCall[];
    tool_call_id?: string;
}

interface ChatCompletionResponse {
    choices?: Array<{
        message?: ChatMessage;
    }>;
}

interface OpenAiTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

function getToolText(content: unknown): string {
    if (!Array.isArray(content)) return '';
    return content.flatMap((block: unknown) => {
        if (typeof block !== 'object' || block === null || !('type' in block) || !('text' in block)) {
            return [];
        }
        return block.type === 'text' && typeof block.text === 'string' ? [block.text] : [];
    }).join('\n');
}

function getAiSettings(): { apiKey: string; baseUrl: string; model: string } {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
        throw new AssistantServiceError(503, 'AI_API_KEY is not configured on the server.');
    }
    return {
        apiKey,
        baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
        model: process.env.AI_MODEL || 'gpt-4o-mini'
    };
}

async function requestCompletion(
    messages: ChatMessage[],
    tools?: OpenAiTool[]
): Promise<ChatMessage> {
    const { apiKey, baseUrl, model } = getAiSettings();
    let response: Response;
    try {
        response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, messages, ...(tools ? { tools } : {}) }),
            signal: AbortSignal.timeout(60000)
        });
    } catch (error: unknown) {
        console.error('AI provider request failed:', error);
        throw new AssistantServiceError(502, 'The AI provider could not be reached.');
    }

    if (!response.ok) {
        console.error(`AI provider returned HTTP ${response.status}`);
        throw new AssistantServiceError(502, 'The AI provider could not complete the request.');
    }

    const result = await response.json() as ChatCompletionResponse;
    const message = result.choices?.[0]?.message;
    if (!message) {
        throw new AssistantServiceError(502, 'The AI provider returned an invalid response.');
    }
    return message;
}

function createVacationMcpServer(): McpServer {
    const server = new McpServer({ name: 'tripgenius-vacations', version: '1.0.0' });
    const europeanDestinations = [
        'Amsterdam', 'Athens', 'Barcelona', 'Budapest', 'London',
        'Paris', 'Prague', 'Rhodes', 'Rome', 'Vienna'
    ];

    server.tool(
        'get_vacation_statistics',
        'Get total, currently active and upcoming vacation counts and the average vacation price.',
        {},
        async () => {
            const [rows] = await db.query<RowDataPacket[]>(`
                SELECT
                    COUNT(*) AS totalCount,
                    SUM(CASE WHEN CURRENT_DATE() BETWEEN start_date AND end_date THEN 1 ELSE 0 END) AS activeCount,
                    SUM(CASE WHEN start_date > CURRENT_DATE() THEN 1 ELSE 0 END) AS upcomingCount,
                    AVG(price) AS averagePrice
                FROM vacations
            `);
            const row = rows[0];
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        totalCount: Number(row.totalCount),
                        activeCount: Number(row.activeCount),
                        upcomingCount: Number(row.upcomingCount),
                        averagePrice: Number(row.averagePrice)
                    })
                }]
            };
        }
    );

    server.tool(
        'list_upcoming_european_vacations',
        'List upcoming vacations in European destinations included in the catalog.',
        {},
        async () => {
            const placeholders = europeanDestinations.map(() => '?').join(', ');
            const [rows] = await db.query<RowDataPacket[]>(
                `SELECT destination, description, DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
                        DATE_FORMAT(end_date, '%Y-%m-%d') AS endDate, price
                 FROM vacations
                 WHERE start_date > CURRENT_DATE() AND destination IN (${placeholders})
                 ORDER BY start_date ASC`,
                europeanDestinations
            );
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
        }
    );

    server.tool(
        'search_vacations',
        'Search the vacation catalog by status and optional destination text.',
        {
            status: z.enum(['all', 'active', 'upcoming', 'past']),
            destination: z.string().max(100).optional(),
            limit: z.number().int().min(1).max(20).default(10)
        },
        async ({ status, destination, limit }) => {
            const conditions: string[] = [];
            const params: (string | number)[] = [];
            if (status === 'active') conditions.push('CURRENT_DATE() BETWEEN start_date AND end_date');
            if (status === 'upcoming') conditions.push('start_date > CURRENT_DATE()');
            if (status === 'past') conditions.push('end_date < CURRENT_DATE()');
            if (destination) {
                conditions.push('destination LIKE ?');
                params.push(`%${destination}%`);
            }
            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const [rows] = await db.query<RowDataPacket[]>(
                `SELECT destination, description, DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
                        DATE_FORMAT(end_date, '%Y-%m-%d') AS endDate, price
                 FROM vacations ${whereClause}
                 ORDER BY start_date ASC LIMIT ?`,
                [...params, limit]
            );
            return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
        }
    );

    return server;
}

async function withMcpClient<T>(action: (client: Client) => Promise<T>): Promise<T> {
    const server = createVacationMcpServer();
    const client = new Client({ name: 'tripgenius-assistant', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    try {
        await server.connect(serverTransport);
        await client.connect(clientTransport);
        return await action(client);
    } finally {
        await client.close();
        await server.close();
    }
}

export async function getTravelRecommendation(destination: string): Promise<string> {
    const normalizedDestination = destination.trim();
    if (!normalizedDestination || normalizedDestination.length > 100) {
        throw new AssistantServiceError(400, 'Destination must contain 1 to 100 characters.');
    }
    const message = await requestCompletion([
        {
            role: 'system',
            content: 'You are a practical travel guide. Reply in Hebrew with a concise, useful recommendation for the requested destination. Do not invent current opening hours or prices.'
        },
        { role: 'user', content: `המלץ על טיול ליעד: ${normalizedDestination}` }
    ]);
    if (!message.content) {
        throw new AssistantServiceError(502, 'The AI provider returned an empty recommendation.');
    }
    return message.content;
}

export async function answerVacationQuestion(question: string): Promise<string> {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || normalizedQuestion.length > 1000) {
        throw new AssistantServiceError(400, 'Question must contain 1 to 1000 characters.');
    }

    return withMcpClient(async client => {
        const { tools } = await client.listTools();
        const openAiTools: OpenAiTool[] = tools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description || '',
                parameters: tool.inputSchema as Record<string, unknown>
            }
        }));
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: 'Answer in Hebrew using only facts returned by the available TripGenius MCP tools. Call the relevant tool before answering questions about the catalog. Never claim access to data the tools did not return. If the catalog cannot answer a question, say so.'
            },
            { role: 'user', content: normalizedQuestion }
        ];

        for (let turn = 0; turn < 4; turn++) {
            const assistantMessage = await requestCompletion(messages, openAiTools);
            if (!assistantMessage.tool_calls?.length) {
                if (!assistantMessage.content) {
                    throw new AssistantServiceError(502, 'The AI provider returned an empty answer.');
                }
                return assistantMessage.content;
            }
            messages.push(assistantMessage);

            for (const toolCall of assistantMessage.tool_calls) {
                let args: Record<string, unknown>;
                try {
                    const parsed: unknown = JSON.parse(toolCall.function.arguments);
                    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                        throw new Error('Tool arguments must be a JSON object');
                    }
                    args = parsed as Record<string, unknown>;
                } catch {
                    throw new AssistantServiceError(502, 'The AI provider returned invalid tool arguments.');
                }
                const result = await client.callTool({ name: toolCall.function.name, arguments: args });
                const toolText = getToolText(result.content);
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: result.isError ? 'The requested catalog query failed.' : toolText
                });
            }
        }
        throw new AssistantServiceError(502, 'The AI provider exceeded the allowed number of tool calls.');
    });
}
