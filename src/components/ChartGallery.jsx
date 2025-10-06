import React from 'react';
import { Line } from 'react-chartjs-2';
import './ChartGallery.css';

/**
 * Gallery component for viewing and comparing saved charts
 */
export default function ChartGallery({ savedCharts, onRemoveChart, onClearGallery }) {
    if (savedCharts.length === 0) {
        return (
            <div className="chart-gallery-empty">
                <p>No saved charts yet. Run a simulation and click "💾 Save to Gallery" to save charts here.</p>
            </div>
        );
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
        'rgb(46, 204, 113)',
        'rgb(155, 89, 182)',
        'rgb(230, 126, 34)',
        'rgb(52, 152, 219)',
        'rgb(231, 76, 60)',
        'rgb(26, 188, 156)',
        'rgb(241, 196, 15)',
        'rgb(189, 195, 199)',
        'rgb(142, 68, 173)',
        'rgb(44, 62, 80)'
    ];

    const renderChart = (chartData, index) => {
        const maxSteps = chartData.maxSteps || Math.max(...chartData.timePoints);
        const allTimePoints = Array.from({ length: maxSteps + 1 }, (_, i) => i);

        let wordColorIdx = 0;
        let letterColorIdx = 0;

        const data = {
            labels: allTimePoints,
            datasets: chartData.data.map((series) => {
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
                    display: chartData.showLegend !== false,
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
                    text: chartData.title,
                    font: {
                        size: 14
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
                    min: chartData.autoScale ? undefined : -0.3,
                    max: chartData.autoScale ? undefined : 1.0
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
            <div key={index} className="gallery-chart-card">
                <div className="gallery-chart-header">
                    <span className="gallery-chart-timestamp">{chartData.timestamp}</span>
                    <button
                        onClick={() => onRemoveChart(index)}
                        className="gallery-remove-btn"
                        title="Remove this chart"
                    >
                        ✕
                    </button>
                </div>
                <div className="gallery-chart-container">
                    <Line data={data} options={options} />
                </div>
            </div>
        );
    };

    return (
        <div className="chart-gallery">
            <div className="chart-gallery-header">
                <h3>Chart Gallery ({savedCharts.length})</h3>
                <button
                    onClick={onClearGallery}
                    className="gallery-clear-btn"
                >
                    Clear All
                </button>
            </div>
            <div className="chart-gallery-grid">
                {savedCharts.map((chart, index) => renderChart(chart, index))}
            </div>
        </div>
    );
}
