import React, { useState } from 'react';
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
import SimpleChartSettings from './SimpleChartSettings.jsx';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function ActivationChart({ experimentData, settings, onSettingsChange, settingsType = 'word', onSaveToGallery }) {
    const [showSettings, setShowSettings] = useState(false);
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
        'rgb(46, 204, 113)',  // Green
        'rgb(155, 89, 182)',  // Purple
        'rgb(230, 126, 34)',  // Orange
        'rgb(52, 152, 219)',  // Blue
        'rgb(231, 76, 60)',   // Red
        'rgb(26, 188, 156)',  // Teal
        'rgb(241, 196, 15)',  // Yellow
        'rgb(189, 195, 199)', // Gray
        'rgb(142, 68, 173)',  // Dark Purple
        'rgb(44, 62, 80)'     // Dark Blue
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
        <div style={{ position: 'relative' }}>
            {(settings && onSettingsChange) || onSaveToGallery ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {onSaveToGallery && (
                        <button
                            onClick={() => onSaveToGallery(experimentData)}
                            style={{
                                padding: '0.35rem 0.75rem',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            💾 Save to Gallery
                        </button>
                    )}
                    {settings && onSettingsChange && (
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            style={{
                                padding: '0.35rem 0.75rem',
                                backgroundColor: showSettings ? '#2980b9' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {showSettings ? '✕ Close' : '⚙ Settings'}
                        </button>
                    )}
                </div>
            ) : null}

            {showSettings && settings && onSettingsChange && (
                <div style={{ marginBottom: '1rem' }}>
                    <SimpleChartSettings
                        settings={settings}
                        onSettingsChange={onSettingsChange}
                        type={settingsType}
                    />
                </div>
            )}

            <div style={{ height: '250px', marginBottom: '0.5rem' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
