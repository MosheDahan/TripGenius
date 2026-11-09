import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { vacationsService } from '../services/VacationsService';
import { notify } from '../utils/Notify';
import { appConfig } from '../utils/AppConfig';
import './VacationForm.css';

interface VacationEditFormData {
    destination: string;
    description: string;
    startDate: string;
    endDate: string;
    price: number;
    image?: FileList;
}

export const EditVacation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const vacationId = Number(id);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VacationEditFormData>();
    const [existingImage, setExistingImage] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();

    const startDateValue = watch('startDate');

    useEffect(() => {
        vacationsService.getVacationById(vacationId)
            .then(vacation => {
                setValue('destination', vacation.destination);
                setValue('description', vacation.description);
                setValue('startDate', vacation.startDate);
                setValue('endDate', vacation.endDate);
                setValue('price', vacation.price);
                setExistingImage(vacation.imageName);
            })
            .catch(err => {
                notify.error(err);
                navigate('/');
            });
    }, [vacationId, setValue, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const onSubmit = async (data: VacationEditFormData) => {
        try {
            const formData = new FormData();
            formData.append('destination', data.destination);
            formData.append('description', data.description);
            formData.append('startDate', data.startDate);
            formData.append('endDate', data.endDate);
            formData.append('price', data.price.toString());

            if (data.image && data.image[0]) {
                formData.append('image', data.image[0]);
            }

            await vacationsService.updateVacation(vacationId, formData);
            notify.success('החופשה עודכנה בהצלחה!');
            navigate('/');
        } catch (err: any) {
            notify.error(err);
        }
    };

    return (
        <div className="form-container">
            <form className="vacation-form-card" onSubmit={handleSubmit(onSubmit)}>
                <h2>עריכת חופשה</h2>

                <div className="form-group">
                    <label>יעד</label>
                    <input 
                        type="text" 
                        {...register('destination', { required: 'נא להזין יעד' })} 
                    />
                    {errors.destination && <span className="error">{errors.destination.message}</span>}
                </div>

                <div className="form-group">
                    <label>תיאור</label>
                    <textarea 
                        rows={4}
                        {...register('description', { required: 'נא להזין תיאור' })} 
                    />
                    {errors.description && <span className="error">{errors.description.message}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>תאריך התחלה</label>
                        <input 
                            type="date" 
                            {...register('startDate', { required: 'נא לבחור תאריך התחלה' })} 
                        />
                        {errors.startDate && <span className="error">{errors.startDate.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>תאריך סיום</label>
                        <input 
                            type="date" 
                            min={startDateValue}
                            {...register('endDate', { 
                                required: 'נא לבחור תאריך סיום',
                                validate: val => !startDateValue || val >= startDateValue || 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה'
                            })} 
                        />
                        {errors.endDate && <span className="error">{errors.endDate.message}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label>מחיר ($)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        {...register('price', { 
                            required: 'נא להזין מחיר',
                            min: { value: 0, message: 'מחיר לא יכול להיות שלילי' },
                            max: { value: 10000, message: 'מחיר מקסימלי הוא 10,000$' }
                        })} 
                    />
                    {errors.price && <span className="error">{errors.price.message}</span>}
                </div>

                <div className="form-group">
                    <label>החלפת תמונה (אופציונלי)</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        {...register('image', { onChange: handleImageChange })} 
                    />
                </div>

                <div className="preview-wrapper">
                    <label>תמונה נוכחית / חדשה:</label>
                    <img 
                        src={imagePreview || `${appConfig.vacationImagesUrl}${existingImage}`} 
                        alt="תצוגה מקדימה" 
                        className="image-preview" 
                    />
                </div>

                <div className="form-buttons">
                    <button type="submit" className="save-btn">עדכן חופשה</button>
                    <button type="button" className="cancel-btn" onClick={() => navigate('/')}>ביטול</button>
                </div>
            </form>
        </div>
    );
};