export interface VacationModel {
    vacationId: number;
    destination: string;
    description: string;
    startDate: string;
    endDate: string;
    price: number;
    imageName: string;
    likesCount: number;
    isLiked: boolean;
}

export type VacationFilterType = 'all' | 'liked' | 'active' | 'upcoming';