import React, { useState, useEffect } from 'react';
import InteractiveGlyph from './InteractiveGlyph.jsx';
import LetterInput from './LetterInput.jsx';
import { letters } from '../core/data.js';
import './FeatureEditor.css';

// Feature states
const FEATURE_STATE = {
    ABSENT: 0,      // Inhibits when feature present
    AMBIGUOUS: 0.5, // No activation (neutral)
    PRESENT: 1      // Excites when feature present
};

/**
 * Interactive feature editor
 * Allows clicking features to toggle them through PRESENT → ABSENT → AMBIGUOUS states
 */
export default function FeatureEditor({ onFeaturesChange }) {
    const [inputWord, setInputWord] = useState('');
    // Initialize 4 positions with features - default to ABSENT
    const [positions, setPositions] = useState(() =>
        Array(4).fill(null).map(() => Array(14).fill(FEATURE_STATE.ABSENT))
    );

    const featureNames = [
        'Top Horizontal',           // 1
        'Left Middle Horizontal',   // 2
        'Right Middle Horizontal',  // 3
        'Bottom Horizontal',        // 4
        'Upper Left Vertical',      // 5
        'Upper Center Vertical',    // 6
        'Upper Right Vertical',     // 7
        'Lower Left Vertical',      // 8
        'Lower Center Vertical',    // 9
        'Lower Right Vertical',     // 10
        'Top-Left Diagonal',        // 11
        'Top-Right Diagonal',       // 12
        'Bottom-Left Diagonal',     // 13
        'Bottom-Right Diagonal'     // 14
    ];

    // Update parent when positions change
    useEffect(() => {
        if (onFeaturesChange) {
            onFeaturesChange(positions);
        }
    }, [positions]);

    // Load letter features when word changes
    useEffect(() => {
        loadWord(inputWord);
    }, [inputWord]);

    const handleWordChange = (word) => {
        setInputWord(word);
    };

    const loadWord = (word) => {
        const normalized = word.toLowerCase().slice(0, 4).padEnd(4, ' ');
        const newPositions = Array.from(normalized).map(char => {
            if (char === '#') {
                // # means mask - combine O and X features (visual noise)
                const oFeatures = letters['o'] || Array(14).fill(0);
                const xFeatures = letters['x'] || Array(14).fill(0);
                // A feature is present if it's in either O or X
                return oFeatures.map((o, i) =>
                    (o || xFeatures[i]) ? FEATURE_STATE.PRESENT : FEATURE_STATE.ABSENT
                );
            }
            if (char === '@') {
                // @ means all features ambiguous
                return Array(14).fill(FEATURE_STATE.AMBIGUOUS);
            }
            if (char === ' ' || !letters[char]) {
                return Array(14).fill(FEATURE_STATE.ABSENT);
            }
            return letters[char].map(f => f ? FEATURE_STATE.PRESENT : FEATURE_STATE.ABSENT);
        });
        setPositions(newPositions);
    };

    const toggleFeature = (posIdx, featIdx) => {
        setPositions(prev => {
            const newPositions = prev.map(pos => [...pos]);
            const current = newPositions[posIdx][featIdx];

            // Cycle: ABSENT → PRESENT → AMBIGUOUS → ABSENT
            if (current === FEATURE_STATE.ABSENT) {
                newPositions[posIdx][featIdx] = FEATURE_STATE.PRESENT;
            } else if (current === FEATURE_STATE.PRESENT) {
                newPositions[posIdx][featIdx] = FEATURE_STATE.AMBIGUOUS;
            } else {
                newPositions[posIdx][featIdx] = FEATURE_STATE.ABSENT;
            }

            return newPositions;
        });
    };

    const clearPosition = (posIdx) => {
        setPositions(prev => {
            const newPositions = [...prev];
            newPositions[posIdx] = Array(14).fill(FEATURE_STATE.ABSENT);
            return newPositions;
        });
    };

    const clearAll = () => {
        setPositions(Array(4).fill(null).map(() => Array(14).fill(FEATURE_STATE.ABSENT)));
    };

    const getFeatureStateClass = (state) => {
        if (state === FEATURE_STATE.PRESENT) return 'present';
        if (state === FEATURE_STATE.ABSENT) return 'absent';
        return 'ambiguous';
    };

    const getFeatureStateColor = (state) => {
        if (state === FEATURE_STATE.PRESENT) return '#27ae60'; // Green
        if (state === FEATURE_STATE.ABSENT) return '#e74c3c'; // Red
        return '#bdc3c7'; // Gray
    };

    return (
        <div className="feature-editor">
            <div className="feature-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
                    <span>FEATURE PRESENT</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#95a5a6' }}></div>
                    <span>FEATURE ABSENT</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#2c3e50' }}></div>
                    <span>AMBIGUOUS</span>
                </div>
            </div>

            <div className="positions-editor">
                {positions.map((posFeatures, posIdx) => (
                    <div key={posIdx} className="position-editor">
                        <div className="position-header">
                            <span className="position-label">Position {posIdx + 1}</span>
                            <button
                                onClick={() => clearPosition(posIdx)}
                                className="clear-pos-btn"
                                title="Clear position"
                            >
                                ×
                            </button>
                        </div>

                        <div className="glyph-interactive">
                            <InteractiveGlyph
                                features={posFeatures}
                                onToggleFeature={(featIdx) => toggleFeature(posIdx, featIdx)}
                                size={120}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="input-section">
                <LetterInput
                    value={inputWord}
                    onChange={handleWordChange}
                />
            </div>
        </div>
    );
}
