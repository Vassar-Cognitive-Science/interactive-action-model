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

    const wordColors = [
        'rgb(31, 119, 180)',
        'rgb(255, 127, 14)',
        'rgb(44, 160, 44)',
        'rgb(214, 39, 40)',
        'rgb(148, 103, 189)',
        'rgb(140, 86, 75)',
        'rgb(23, 190, 207)',
        'rgb(188, 189, 34)',
        'rgb(227, 119, 194)'
    ];

    const letterColors = [
        'rgb(127, 127, 127)',
        'rgb(189, 189, 189)',
        'rgb(89, 89, 89)'
    ];

    // Generate x-axis labels from 0 to maxSteps
    const maxSteps = experimentData.maxSteps || Math.max(...experimentData.timePoints);
    const allTimePoints = Array.from({ length: maxSteps + 1 }, (_, i) => i);

    let wordColorIdx = 0;
    let letterColorIdx = 0;

    const chartData = {
        labels: allTimePoints,
        datasets: experimentData.data.map((series) => {
            const isLetter = series.type === 'letter';
            const isTracked = series.isTracked;

            let color;
            if (isLetter) {
                color = letterColors[letterColorIdx % letterColors.length];
                letterColorIdx++;
            } else {
                color = wordColors[wordColorIdx % wordColors.length];
                wordColorIdx++;
            }

            return {
                label: series.label,
                data: series.values,
                borderColor: color,
                backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
                tension: 0.1,
                pointRadius: 0,
                borderWidth: isTracked ? 3 : 2,
                borderDash: isLetter ? [5, 5] : [],
                spanGaps: true
            };
        })
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: experimentData.showLegend !== false,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 10,
                    font: {
                        size: 11
                    }
                }
            },
            title: {
                display: true,
                text: experimentData.title,
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return value !== null ? `${label}: ${value.toFixed(3)}` : null;
                    }
                }
            }
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Activation'
                },
                min: experimentData.autoScale ? undefined : -0.3,
                max: experimentData.autoScale ? undefined : 1.0
            },
            x: {
                title: {
                    display: true,
                    text: 'Time Steps'
                },
                min: 0,
                max: maxSteps
            }
        }
    };

    return (
        <div style={{ height: '450px', marginBottom: '2rem' }}>
            <Line data={chartData} options={options} />
            <div style={{
                marginTop: '1rem',
                padding: '0.5rem',
                fontSize: '0.85rem',
                color: '#6c757d',
                textAlign: 'center'
            }}>
                <span style={{ marginRight: '1rem' }}>
                    <strong>Solid lines:</strong> Words
                </span>
                <span style={{ marginRight: '1rem' }}>
                    <strong>Dashed lines:</strong> Letters
                </span>
                <span>
                    <strong>Thicker lines:</strong> Tracked words
                </span>
            </div>
        </div>
    );
}
