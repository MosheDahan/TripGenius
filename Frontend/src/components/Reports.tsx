import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { vacationsService } from '../services/VacationsService';
import { notify } from '../utils/Notify';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Reports: React.FC = () => {
    const [chartData, setChartData] = useState<{ destination: string; likesCount: number }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        vacationsService.getReportsData()
            .then(data => setChartData(data))
            .catch(err => notify.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDownloadCsv = async () => {
        try {
            await vacationsService.downloadCsv();
            notify.success('קובץ CSV הורד בהצלחה');
        } catch (err: any) {
            notify.error(err);
        }
    };

    const data = {
        labels: chartData.map(item => item.destination),
        datasets: [
            {
                label: 'מספר לייקים',
                data: chartData.map(item => item.likesCount),
                backgroundColor: 'rgba(2, 132, 199, 0.7)',
                borderColor: 'rgb(2, 132, 199)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'התפלגות לייקים לפי יעד חופשה',
                font: { size: 16 }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h2>דוחות חופשות ולייקים</h2>
                <button className="csv-btn" onClick={handleDownloadCsv}>
                    📥 הורד דוח CSV
                </button>
            </div>

            {isLoading ? (
                <div className="loading-state">טוען נתוני דוח...</div>
            ) : chartData.length === 0 ? (
                <div className="empty-state">אין נתונים להצגה</div>
            ) : (
                <div className="chart-wrapper">
                    <Bar options={options} data={data} />
                </div>
            )}
        </div>
    );
};