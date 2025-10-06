import React from 'react';
import { activationToColor, getContrastColor } from '../utils/colors.js';
import ActivationChart from './ActivationChart.jsx';
import './LetterPool.css';

/**
 * Displays a single letter pool (26 letters at one position)
 */
export default function LetterPool({ position, activations, showValues = false, showChart = false, onToggleChart, chartData, chartSettings, onChartSettingsChange, onSaveChartToGallery }) {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

    return (
        <div className="letter-pool-container">
            <div className="letter-pool">
                <div className="pool-header">
                    <span>Position {position + 1}</span>
                    {onToggleChart && (
                        <div className="pool-header-buttons">
                            <button
                                className={`chart-toggle-btn ${showChart ? 'active' : ''}`}
                                onClick={onToggleChart}
                                title="Toggle chart visibility"
                            >
                                📈
                            </button>
                        </div>
                    )}
                </div>
                <div className="letter-grid">
                    {letters.map((letter, idx) => {
                        const activation = activations[idx];
                        const bgColor = activationToColor(activation);
                        const textColor = getContrastColor(activation);

                        return (
                            <div
                                key={letter}
                                className="letter-cell"
                                style={{ backgroundColor: bgColor, color: textColor }}
                                title={`${letter.toUpperCase()}: ${activation.toFixed(3)}`}
                            >
                                <span className="letter-label">{letter.toUpperCase()}</span>
                                {showValues && (
                                    <span className="activation-value">
                                        {activation.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            {showChart && (
                <div className="letter-chart-container">
                    {chartData ? (
                        <ActivationChart
                            experimentData={chartData}
                            settings={chartSettings}
                            onSettingsChange={onChartSettingsChange}
                            settingsType="letter"
                            onSaveToGallery={onSaveChartToGallery}
                        />
                    ) : (
                        <div className="chart-placeholder">
                            <p>Waiting for data...</p>
                            <small>Run the simulation to see activations</small>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
