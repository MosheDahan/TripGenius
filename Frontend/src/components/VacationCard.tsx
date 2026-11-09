import React from 'react';
import { VacationModel } from '../models/VacationModel';
import { appConfig } from '../utils/AppConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './VacationCard.css';

interface VacationCardProps {
    vacation: VacationModel;
    onLikeToggle: (vacationId: number, isLiked: boolean) => void;
    onDelete: (vacationId: number) => void;
}

export const VacationCard: React.FC<VacationCardProps> = ({ vacation, onLikeToggle, onDelete }) => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    // עיצוב תאריך נוח לקריאה (DD/MM/YYYY)
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('he-IL');
    };

    return (
        <div className="vacation-card">
            <div className="card-image-wrapper">
                <img
                    src={`${appConfig.vacationImagesUrl}${vacation.imageName || (vacation as any).image_name}`}
                    alt={vacation.destination}
                    className="card-image"
                    onError={(e) => {
                        console.error('Image load failed for URL:', e.currentTarget.src);
                    }}
                />

                {/* פעולות מנהל על גבי התמונה */}
                {isAdmin ? (
                    <div className="admin-actions">
                        <button
                            className="edit-btn"
                            title="ערוך חופשה"
                            onClick={() => navigate(`/edit-vacation/${vacation.vacationId}`)}
                        >
                            ✏️
                        </button>
                        <button
                            className="delete-btn"
                            title="מחק חופשה"
                            onClick={() => onDelete(vacation.vacationId)}
                        >
                            🗑️
                        </button>
                    </div>
                ) : (
                    /* כפתור לייק למשתמש רגיל */
                    <button
                        className={`like-btn ${vacation.isLiked ? 'liked' : ''}`}
                        onClick={() => onLikeToggle(vacation.vacationId, vacation.isLiked)}
                    >
                        <span className="heart-icon">{vacation.isLiked ? '❤️' : '🤍'}</span>
                        <span className="likes-count">{vacation.likesCount}</span>
                    </button>
                )}
            </div>

            <div className="card-content">
                <div className="card-header-row">
                    <h3 className="card-destination">{vacation.destination}</h3>
                    <span className="card-price">${vacation.price}</span>
                </div>

                <div className="card-dates">
                    📅 {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}
                </div>

                <p className="card-description">{vacation.description}</p>
            </div>
        </div>
    );
};