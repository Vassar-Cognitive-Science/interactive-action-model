import React from 'react';
import FeatureLayer from './FeatureLayer.jsx';
import LetterPool from './LetterPool.jsx';
import WordLayer from './WordLayer.jsx';
import FeatureEditor from './FeatureEditor.jsx';
import ActivationChart from './ActivationChart.jsx';
import './LayerVisualization.css';

/**
 * Complete three-layer visualization of the IAM
 * Shows features -> letters -> words with activation levels
 */
export default function LayerVisualization({
    modelState,
    currentStimulus,
    wordList,
    onFeaturesChange,
    trackedWords,
    onTrackedWordsChange,
    showWordChart,
    onToggleWordChart,
    wordChartData,
    wordChartSettings,
    onWordChartSettingsChange,
    showLetterCharts,
    onToggleLetterChart,
    prepareLetterChartData,
    letterChartSettings,
    onLetterChartSettingsChange,
    onSaveChartToGallery
}) {
    if (!modelState) {
        return (
            <div className="layer-visualization">
                <div className="no-data">
                    Run an experiment or simulation to see layer activations
                </div>
            </div>
        );
    }

    const { letters, words } = modelState;

    // Convert word activations to word objects
    const wordObjects = words.map((activation, idx) => ({
        word: wordList[idx],
        activation
    }));

    return (
        <div className="layer-visualization">
            {/* Word Layer (TOP) */}
            <div className="layer-section-with-label">
                <div className="layer-label word-label">Word Layer</div>
                <div className="layer-section-content">
                    <div className="word-layer-with-chart">
                        <WordLayer
                            words={wordObjects}
                            topN={15}
                            showValues={true}
                            trackedWords={trackedWords}
                            onTrackedWordsChange={onTrackedWordsChange}
                            showChart={showWordChart}
                            onToggleChart={onToggleWordChart}
                        />
                        {showWordChart && (
                            <div className="word-chart-container">
                                {wordChartData ? (
                                    <ActivationChart
                                        experimentData={wordChartData}
                                        settings={wordChartSettings}
                                        onSettingsChange={onWordChartSettingsChange}
                                        settingsType="word"
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
                    <div className="layer-arrow">↕ Bidirectional Feedback</div>
                </div>
            </div>

            {/* Letter Layer (MIDDLE) */}
            <div className="layer-section-with-label">
                <div className="layer-label letter-label">Letter Layer</div>
                <div className="layer-section-content">
                    <div className="letter-layer-container">
                        <div className="letter-pools">
                        {letters.map((activations, position) => (
                            <LetterPool
                                key={position}
                                position={position}
                                activations={activations}
                                showValues={false}
                                showChart={showLetterCharts[position]}
                                onToggleChart={() => onToggleLetterChart(position)}
                                chartData={prepareLetterChartData(position)}
                                chartSettings={letterChartSettings[position]}
                                onChartSettingsChange={(newSettings) => onLetterChartSettingsChange(position, newSettings)}
                                onSaveChartToGallery={onSaveChartToGallery}
                            />
                        ))}
                        </div>
                    </div>
                    <div className="layer-arrow">↑ Bottom-up Excitation & Inhibition</div>
                </div>
            </div>

            {/* Input Editor (BOTTOM) */}
            <div className="layer-section-with-label">
                <div className="layer-label feature-label">Feature Layer</div>
                <div className="layer-section-content">
                    <FeatureEditor onFeaturesChange={onFeaturesChange} />
                </div>
            </div>
        </div>
    );
}
