import React from 'react';
import { activationToColor, getContrastColor } from '../utils/colors.js';
import './LetterPool.css';

/**
 * Displays a single letter pool (26 letters at one position)
 */
export default function LetterPool({ position, activations, showValues = false }) {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

    return (
        <div className="letter-pool">
            <div className="pool-header">Position {position + 1}</div>
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
    );
}
