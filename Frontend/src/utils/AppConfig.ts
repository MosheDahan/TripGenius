class AppConfig {
    public readonly apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
    public readonly registerUrl = `${this.apiUrl}/auth/register`;
    public readonly loginUrl = `${this.apiUrl}/auth/login`;
    public readonly vacationsUrl = `${this.apiUrl}/vacations`;
    public readonly vacationImagesUrl = `${this.apiUrl}/vacations/images/`;
    public readonly reportsUrl = `${this.apiUrl}/vacations/reports/likes`;
    public readonly csvReportUrl = `${this.apiUrl}/vacations/reports/csv`;
    public readonly recommendationUrl = `${this.apiUrl}/ai/recommendations`;
    public readonly mcpQueryUrl = `${this.apiUrl}/mcp/query`;
}

export const appConfig = new AppConfig();