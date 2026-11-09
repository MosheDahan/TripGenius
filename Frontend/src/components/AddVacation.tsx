import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { vacationsService } from '../services/VacationsService';
import { notify } from '../utils/Notify';
import './VacationForm.css';

interface VacationFormData {
    destination: string;
    description: string;
    startDate: string;
    endDate: string;
    price: number;
    image: FileList;
}

export const AddVacation: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<VacationFormData>();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();

    const startDateValue = watch('startDate');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const onSubmit = async (data: VacationFormData) => {
        try {
            const formData = new FormData();
            formData.append('destination', data.destination);
            formData.append('description', data.description);
            formData.append('startDate', data.startDate);
            formData.append('endDate', data.endDate);
            formData.append('price', data.price.toString());
            formData.append('image', data.image[0]);

            await vacationsService.addVacation(formData);
            notify.success('החופשה נוספה בהצלחה!');
            navigate('/');
        } catch (err: any) {
            notify.error(err);
        }
    };

    return (
        <div className="form-container">
            <form className="vacation-form-card" onSubmit={handleSubmit(onSubmit)}>
                <h2>הוספת חופשה חדשה</h2>

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
                            min={today}
                            {...register('startDate', { 
                                required: 'נא לבחור תאריך התחלה',
                                validate: val => val >= today || 'תאריך ההתחלה לא יכול להיות בעבר'
                            })} 
                        />
                        {errors.startDate && <span className="error">{errors.startDate.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>תאריך סיום</label>
                        <input 
                            type="date" 
                            min={startDateValue || today}
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
                    <label>תמונת החופשה</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        {...register('image', { 
                            required: 'חובה להעלות תמונה',
                            onChange: handleImageChange 
                        })} 
                    />
                    {errors.image && <span className="error">{errors.image.message}</span>}
                </div>

                {imagePreview && (
                    <div className="preview-wrapper">
                        <img src={imagePreview} alt="תצוגה מקדימה" className="image-preview" />
                    </div>
                )}

                <div className="form-buttons">
                    <button type="submit" className="save-btn">שמור חופשה</button>
                    <button type="button" className="cancel-btn" onClick={() => navigate('/')}>ביטול</button>
                </div>
            </form>
        </div>
    );
};