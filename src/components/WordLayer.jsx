import React, { useState } from 'react';
import { activationToColor, getContrastColor } from '../utils/colors.js';
import './WordLayer.css';

/**
 * Displays the top N most active words
 */
export default function WordLayer({ words, topN = 15, showValues = true, trackedWords = [], onTrackedWordsChange }) {
    // Get top N words sorted by activation
    const topWords = words
        .map((wordObj, index) => ({ word: wordObj.word, activation: wordObj.activation, index }))
        .sort((a, b) => b.activation - a.activation)
        .slice(0, topN);

    // Find max activation for scaling
    const maxActivation = Math.max(...topWords.map(w => w.activation), 0.1);

    const [showTrackingUI, setShowTrackingUI] = useState(false);
    const [trackInput, setTrackInput] = useState('');

    const handleAddTrackedWord = () => {
        const word = trackInput.trim().toLowerCase();
        if (word && !trackedWords.includes(word) && onTrackedWordsChange) {
            onTrackedWordsChange([...trackedWords, word]);
            setTrackInput('');
        }
    };

    const handleRemoveTrackedWord = (word) => {
        if (onTrackedWordsChange) {
            onTrackedWordsChange(trackedWords.filter(w => w !== word));
        }
    };

    const toggleWordTracking = (word) => {
        if (trackedWords.includes(word)) {
            handleRemoveTrackedWord(word);
        } else {
            if (onTrackedWordsChange) {
                onTrackedWordsChange([...trackedWords, word]);
            }
        }
    };

    return (
        <div className="word-layer">
            <div className="layer-header">
                <span>Word Layer</span>
                {onTrackedWordsChange && (
                    <button
                        className="track-toggle-btn"
                        onClick={() => setShowTrackingUI(!showTrackingUI)}
                        title="Track specific words"
                    >
                        📊 Track
                    </button>
                )}
            </div>

            {showTrackingUI && onTrackedWordsChange && (
                <div className="tracking-controls">
                    <div className="track-input-group">
                        <input
                            type="text"
                            value={trackInput}
                            onChange={(e) => setTrackInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTrackedWord()}
                            placeholder="Enter word to track..."
                            maxLength={4}
                        />
                        <button onClick={handleAddTrackedWord}>Add</button>
                    </div>
                    {trackedWords.length > 0 && (
                        <div className="tracked-words-list">
                            <span>Tracked:</span>
                            {trackedWords.map(word => (
                                <span key={word} className="tracked-word-tag">
                                    {word.toUpperCase()}
                                    <button onClick={() => handleRemoveTrackedWord(word)}>×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="word-grid">
                {topWords.map(({ word, activation, index }) => {
                    const bgColor = activationToColor(activation);
                    const textColor = getContrastColor(activation);
                    const isTracked = trackedWords.includes(word);

                    return (
                        <div
                            key={index}
                            className={`word-cell ${isTracked ? 'tracked' : ''}`}
                            style={{
                                backgroundColor: bgColor,
                                color: textColor
                            }}
                            title={`${word}: ${activation.toFixed(4)}`}
                            onClick={() => onTrackedWordsChange && toggleWordTracking(word)}
                        >
                            <span className="word-text">{word.toUpperCase()}</span>
                            {showValues && (
                                <span className="word-value">{activation.toFixed(2)}</span>
                            )}
                            {isTracked && <span className="tracked-indicator">📌</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
