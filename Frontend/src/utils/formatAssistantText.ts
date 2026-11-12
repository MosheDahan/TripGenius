export function formatAssistantText(text: string): string {
    return text
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(line => line
            .replace(/^(\s*)[-*]\s+/, '$1• ')
            .replace(/\*/g, ''))
        .join('\n');
}
