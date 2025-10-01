import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function ActivationChart({ experimentData }) {
    if (!experimentData) {
        return <div>No data to display</div>;
    }

    const colors = [
        'rgb(31, 119, 180)',
        'rgb(255, 127, 14)',
        'rgb(44, 160, 44)',
        'rgb(214, 39, 40)',
        'rgb(148, 103, 189)',
        'rgb(140, 86, 75)'
    ];

    const chartData = {
        labels: experimentData.timePoints,
        datasets: experimentData.data.map((series, idx) => ({
            label: series.label,
            data: series.values,
            borderColor: colors[idx % colors.length],
            backgroundColor: colors[idx % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 2,
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: experimentData.title,
                font: {
                    size: 16
                }
            },
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Activation'
                },
                min: -0.3,
                max: 1.0
            },
            x: {
                title: {
                    display: true,
                    text: 'Time Steps'
                }
            }
        }
    };

    return (
        <div style={{ height: '400px', marginBottom: '2rem' }}>
            <Line data={chartData} options={options} />
            {experimentData.description && (
                <p style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderLeft: '4px solid #2c3e50',
                    fontStyle: 'italic'
                }}>
                    {experimentData.description}
                </p>
            )}
        </div>
    );
}
