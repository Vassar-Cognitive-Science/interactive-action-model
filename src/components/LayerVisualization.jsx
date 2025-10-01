import React from 'react';
import FeatureLayer from './FeatureLayer.jsx';
import LetterPool from './LetterPool.jsx';
import WordLayer from './WordLayer.jsx';
import FeatureEditor from './FeatureEditor.jsx';
import './LayerVisualization.css';

/**
 * Complete three-layer visualization of the IAM
 * Shows features -> letters -> words with activation levels
 */
export default function LayerVisualization({ modelState, currentStimulus, wordList, onFeaturesChange, trackedWords, onTrackedWordsChange }) {
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
            <div className="layer-section">
                <WordLayer
                    words={wordObjects}
                    topN={15}
                    showValues={true}
                    trackedWords={trackedWords}
                    onTrackedWordsChange={onTrackedWordsChange}
                />
                <div className="layer-arrow">↕ Bidirectional Feedback</div>
            </div>

            {/* Letter Layer (MIDDLE) */}
            <div className="layer-section">
                <div className="letter-layer-container">
                    <div className="layer-title">Letter Layer</div>
                    <div className="letter-pools">
                        {letters.map((activations, position) => (
                            <LetterPool
                                key={position}
                                position={position}
                                activations={activations}
                                showValues={false}
                            />
                        ))}
                    </div>
                </div>
                <div className="layer-arrow">↑ Bottom-up Excitation & Inhibition</div>
            </div>

            {/* Input Editor (BOTTOM) */}
            <div className="layer-section">
                <FeatureEditor onFeaturesChange={onFeaturesChange} />
            </div>
        </div>
    );
}
