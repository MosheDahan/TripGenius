import { formatAssistantText } from './formatAssistantText';

test('removes Markdown asterisks and formats list markers as bullets', () => {
    expect(formatAssistantText('**Example**\n* **Visit:** take the *boat*'))
        .toBe('Example\n• Visit: take the boat');
});
