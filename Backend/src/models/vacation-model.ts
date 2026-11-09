export interface IVacation {
    vacationId?: number;
    destination: string;
    description: string;
    startDate: string;
    endDate: string;
    price: number;
    imageName: string;
    likesCount?: number;
    isLiked?: boolean;
}

export type VacationFilter = 'all' | 'liked' | 'active' | 'upcoming';