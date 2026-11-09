import axios from 'axios';
import { appConfig } from '../utils/AppConfig';
import { VacationFilterType, VacationModel } from '../models/VacationModel';

interface VacationsResponse {
    vacations: VacationModel[];
    totalCount: number;
}

class VacationsService {
    // קבלת הגדרת ה-Authorization Header עם ה-Token
    private getHeaders() {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    // שליפת חופשות לפי עמוד וסינון
    public async getAllVacations(page: number = 1, filter: VacationFilterType = 'all'): Promise<VacationsResponse> {
        const response = await axios.get<VacationsResponse>(
            `${appConfig.vacationsUrl}?page=${page}&filter=${filter}`,
            this.getHeaders()
        );
        return response.data;
    }

    // הוספת לייק
    public async addLike(vacationId: number): Promise<void> {
        await axios.post(`${appConfig.vacationsUrl}/${vacationId}/like`, {}, this.getHeaders());
    }

    // הסרת לייק
    public async removeLike(vacationId: number): Promise<void> {
        await axios.delete(`${appConfig.vacationsUrl}/${vacationId}/like`, this.getHeaders());
    }

    // מחיקת חופשה (Admin בלבד)
    public async deleteVacation(vacationId: number): Promise<void> {
        await axios.delete(`${appConfig.vacationsUrl}/${vacationId}`, this.getHeaders());
    }

    // שליפת חופשה בודדת לפי מזהה (לטובת דף עריכה)
    public async getVacationById(vacationId: number): Promise<VacationModel> {
        const response = await axios.get<VacationModel>(
            `${appConfig.vacationsUrl}/${vacationId}`,
            this.getHeaders()
        );
        return response.data;
    }

    // הוספת חופשה חדשה (שליחת FormData עם קובץ)
    public async addVacation(formData: FormData): Promise<void> {
        await axios.post(appConfig.vacationsUrl, formData, this.getHeaders());
    }

    // עריכת חופשה קיימת
    public async updateVacation(vacationId: number, formData: FormData): Promise<void> {
        await axios.put(`${appConfig.vacationsUrl}/${vacationId}`, formData, this.getHeaders());
    }

    // שליפת נתוני דוח הלייקים לתרשים
    public async getReportsData(): Promise<{ destination: string; likesCount: number }[]> {
        const response = await axios.get<{ destination: string; likesCount: number }[]>(
            appConfig.reportsUrl,
            this.getHeaders()
        );
        return response.data;
    }

    // הורדת קובץ CSV
    public async downloadCsv(): Promise<void> {
        const response = await axios.get(appConfig.csvReportUrl, {
            ...this.getHeaders(),
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'vacations_report.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}

export const vacationsService = new VacationsService();