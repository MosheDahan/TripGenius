import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

class Notify {
    private notification = new Notyf({
        duration: 3500,
        position: { x: 'left', y: 'top' }, // ממוקם בצד שמאל עבור עברית
        ripple: true,
        dismissible: true
    });

    public success(message: string): void {
        this.notification.success(message);
    }

    public error(error: any): void {
        const rawMessage = this.extractMessage(error);
        const hebrewMessage = this.translateError(rawMessage);
        this.notification.error(hebrewMessage);
    }

    private extractMessage(error: any): string {
        if (typeof error === 'string') return error;
        if (error.response?.data?.message) return error.response.data.message;
        if (error.response?.data) return error.response.data;
        if (error.message) return error.message;
        return 'אירעה שגיאה, אנא נסה שוב.';
    }

    // תרגום שגיאות נפוצות מהשרת לעברית
    private translateError(message: string): string {
        const lower = message.toLowerCase();

        if (lower.includes('incorrect email or password')) {
            return 'כתובת האימייל או הסיסמה שגויים';
        }
        if (lower.includes('already registered') || lower.includes('already exists')) {
            return 'כתובת האימייל כבר קיימת במערכת';
        }
        if (lower.includes('network error')) {
            return 'שגיאת תקשורת: שרת ה-Backend אינו זמין';
        }
        if (lower.includes('access denied') || lower.includes('unauthorized')) {
            return 'אין לך הרשאה לבצע פעולה זו';
        }
        if (lower.includes('token expired') || lower.includes('invalid token')) {
            return 'פג תוקף החיבור, נא להתחבר מחדש';
        }

        return message;
    }
}

export const notify = new Notify();