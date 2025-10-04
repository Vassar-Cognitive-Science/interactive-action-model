import React, { useState } from 'react';
import { activationToColor, getContrastColor } from '../utils/colors.js';
import './WordLayer.css';

/**
 * Displays the top N most active words plus any tracked words
 */
export default function WordLayer({ words, topN = 15, showValues = true, trackedWords = [], onTrackedWordsChange, showChart = false, onToggleChart }) {
    // Get all words with their data
    const allWords = words.map((wordObj, index) => ({
        word: wordObj.word,
        activation: wordObj.activation,
        index
    }));

    // Get top N words sorted by activation
    const topWords = [...allWords]
        .sort((a, b) => b.activation - a.activation)
        .slice(0, topN);

    // Add tracked words that aren't already in top N
    const trackedWordData = trackedWords
        .map(word => allWords.find(w => w.word === word))
        .filter(w => w && !topWords.find(tw => tw.word === w.word));

    // Combine and sort: tracked words first, then top words by activation
    const displayWords = [...trackedWordData, ...topWords]
        .sort((a, b) => {
            const aTracked = trackedWords.includes(a.word);
            const bTracked = trackedWords.includes(b.word);
            if (aTracked && !bTracked) return -1;
            if (!aTracked && bTracked) return 1;
            return b.activation - a.activation;
        });

    // Find max activation for scaling
    const maxActivation = Math.max(...displayWords.map(w => w.activation), 0.1);

    const [showTrackingUI, setShowTrackingUI] = useState(false);
    const [trackInput, setTrackInput] = useState('');
    const [error, setError] = useState('');

    const handleAddTrackedWord = () => {
        const word = trackInput.trim().toLowerCase();
        if (!word) return;

        // Check if word exists in vocabulary
        const wordExists = allWords.some(w => w.word === word);
        if (!wordExists) {
            setError(`"${word.toUpperCase()}" not in vocabulary`);
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (!trackedWords.includes(word) && onTrackedWordsChange) {
            onTrackedWordsChange([...trackedWords, word]);
            setTrackInput('');
            setError('');
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
                <div className="layer-header-buttons">
                    {onToggleChart && (
                        <button
                            className={`chart-toggle-btn ${showChart ? 'active' : ''}`}
                            onClick={onToggleChart}
                            title="Toggle chart visibility"
                        >
                            📈
                        </button>
                    )}
                </div>
            </div>

            {onTrackedWordsChange && (
                <div className="tracked-words-section">
                    {trackedWords.map(word => (
                        <span key={word} className="tracked-word-tag">
                            {word.toUpperCase()}
                            <button onClick={() => handleRemoveTrackedWord(word)}>×</button>
                        </span>
                    ))}
                    <button
                        className="add-track-btn"
                        onClick={() => setShowTrackingUI(!showTrackingUI)}
                        title="Add word to track"
                    >
                        {showTrackingUI ? '×' : '+'}
                    </button>
                    {showTrackingUI && (
                        <input
                            type="text"
                            className="track-input-inline"
                            value={trackInput}
                            onChange={(e) => setTrackInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTrackedWord()}
                            onBlur={() => {
                                if (trackInput.trim()) {
                                    handleAddTrackedWord();
                                }
                                setShowTrackingUI(false);
                            }}
                            placeholder="word..."
                            maxLength={4}
                            autoFocus
                        />
                    )}
                    {error && <span className="track-error">{error}</span>}
                </div>
            )}

            <div className="word-grid">
                {displayWords.map(({ word, activation, index }) => {
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
