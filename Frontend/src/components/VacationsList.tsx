import React, { useEffect, useState, useCallback } from 'react';
import { VacationModel, VacationFilterType } from '../models/VacationModel';
import { vacationsService } from '../services/VacationsService';
import { VacationCard } from './VacationCard';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/Notify';
import './VacationsList.css';

export const VacationsList: React.FC = () => {
    const { isAdmin } = useAuth();
    const [vacations, setVacations] = useState<VacationModel[]>([]);
    const [filter, setFilter] = useState<VacationFilterType>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const pageSize = 9;
    const totalPages = Math.ceil(totalCount / pageSize);

    const loadVacations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await vacationsService.getAllVacations(currentPage, filter);
            setVacations(data.vacations);
            setTotalCount(data.totalCount);
        } catch (err: any) {
            notify.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filter]);

    useEffect(() => {
        loadVacations();
    }, [loadVacations]);

    const handleFilterChange = (newFilter: VacationFilterType) => {
        setFilter(newFilter);
        setCurrentPage(1); // חזרה לעמוד ראשון בעת שינוי סינון
    };

    const handleLikeToggle = async (vacationId: number, currentLiked: boolean) => {
        try {
            if (currentLiked) {
                await vacationsService.removeLike(vacationId);
            } else {
                await vacationsService.addLike(vacationId);
            }

            // עדכון מיידי של ה-State ללא צורך בריענון מחדש
            setVacations(prev => prev.map(v => {
                if (v.vacationId === vacationId) {
                    return {
                        ...v,
                        isLiked: !currentLiked,
                        likesCount: currentLiked ? v.likesCount - 1 : v.likesCount + 1
                    };
                }
                return v;
            }));
        } catch (err: any) {
            notify.error(err);
        }
    };

    const handleDelete = async (vacationId: number) => {
        const confirmDelete = window.confirm('האם אתה בטוח שברצונך למחוק חופשה זו?');
        if (!confirmDelete) return;

        try {
            await vacationsService.deleteVacation(vacationId);
            notify.success('החופשה נמחקה בהצלחה');
            loadVacations();
        } catch (err: any) {
            notify.error(err);
        }
    };

    return (
        <div className="vacations-container">
            {/* סרגל סינון (מוצג למשתמשים רגילים בלבד לפי דרישות האפיון) */}
            {!isAdmin && (
                <div className="filters-bar">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        כל החופשות
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'liked' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('liked')}
                    >
                        החופשות שאהבתי ❤️
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        פעילות כעת 🏖️
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('upcoming')}
                    >
                        עתידיות ✈️
                    </button>
                </div>
            )}

            {/* תוכן המסך */}
            {isLoading ? (
                <div className="loading-state">טוען חופשות...</div>
            ) : vacations.length === 0 ? (
                <div className="empty-state">לא נמצאו חופשות התואמות לבחירה.</div>
            ) : (
                <div className="vacations-grid">
                    {vacations.map(vacation => (
                        <VacationCard 
                            key={vacation.vacationId} 
                            vacation={vacation} 
                            onLikeToggle={handleLikeToggle}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* רכיב פגינציה */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="page-btn"
                    >
                        קודם
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="page-btn"
                    >
                        הבא
                    </button>
                </div>
            )}
        </div>
    );
};