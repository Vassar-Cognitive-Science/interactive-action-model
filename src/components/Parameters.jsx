import React from 'react';
import './Parameters.css';

/**
 * Controls for all model parameters including weights, mask timing, and timesteps
 */
export default function Parameters({
    parameters,
    onParametersChange,
    maskStart,
    onMaskStartChange,
    maxSteps,
    onMaxStepsChange
}) {
    const handleWeightChange = (param, value) => {
        onParametersChange({
            ...parameters,
            [param]: parseFloat(value)
        });
    };

    return (
        <div className="parameters-panel">
            <div className="parameters-header">
                <h3>Model Parameters</h3>
            </div>

            <div className="parameters-grid">
                {/* Feature-Letter Connections */}
                <div className="param-section">
                    <h4>Feature → Letter</h4>
                    <div className="param-group">
                        <label>
                            <span>Excitation</span>
                            <input
                                type="number"
                                step="0.001"
                                value={parameters.FEATURE_LETTER_EXCITATION}
                                onChange={(e) => handleWeightChange('FEATURE_LETTER_EXCITATION', e.target.value)}
                            />
                        </label>
                        <label>
                            <span>Inhibition</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.FEATURE_LETTER_INHIBITION}
                                onChange={(e) => handleWeightChange('FEATURE_LETTER_INHIBITION', e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                {/* Letter-Word Connections */}
                <div className="param-section">
                    <h4>Letter ↔ Word</h4>
                    <div className="param-group">
                        <label>
                            <span>Letter → Word Excitation</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.LETTER_WORD_EXCITATION}
                                onChange={(e) => handleWeightChange('LETTER_WORD_EXCITATION', e.target.value)}
                            />
                        </label>
                        <label>
                            <span>Letter → Word Inhibition</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.LETTER_WORD_INHIBITION}
                                onChange={(e) => handleWeightChange('LETTER_WORD_INHIBITION', e.target.value)}
                            />
                        </label>
                        <label>
                            <span>Word → Letter Excitation</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.WORD_LETTER_EXCITATION}
                                onChange={(e) => handleWeightChange('WORD_LETTER_EXCITATION', e.target.value)}
                            />
                        </label>
                        <label>
                            <span>Word → Letter Inhibition</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.WORD_LETTER_INHIBITION}
                                onChange={(e) => handleWeightChange('WORD_LETTER_INHIBITION', e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                {/* Within-Layer Inhibition */}
                <div className="param-section">
                    <h4>Within-Layer Inhibition</h4>
                    <div className="param-group">
                        <label>
                            <span>Word-Word Inhibition</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.WORD_WORD_INHIBITION}
                                onChange={(e) => handleWeightChange('WORD_WORD_INHIBITION', e.target.value)}
                            />
                        </label>
                        <label>
                            <span>Letter-Letter Inhibition</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.LETTER_LETTER_INHIBITION}
                                onChange={(e) => handleWeightChange('LETTER_LETTER_INHIBITION', e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                {/* General Parameters */}
                <div className="param-section">
                    <h4>General</h4>
                    <div className="param-group">
                        <label>
                            <span>Decay Rate</span>
                            <input
                                type="number"
                                step="0.01"
                                value={parameters.DECAY_RATE}
                                onChange={(e) => handleWeightChange('DECAY_RATE', e.target.value)}
                            />
                        </label>
                        <label>
                            <span>Min Activation</span>
                            <input
                                type="number"
                                step="0.1"
                                value={parameters.MIN_ACTIVATION}
                                onChange={(e) => handleWeightChange('MIN_ACTIVATION', e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                {/* Timing Parameters */}
                <div className="param-section">
                    <h4>Timing</h4>
                    <div className="param-group">
                        <label>
                            <span>Max Steps</span>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                max="200"
                                value={maxSteps}
                                onChange={(e) => onMaxStepsChange(parseInt(e.target.value))}
                            />
                        </label>
                        <label>
                            <span>Mask Start (step)</span>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                max={maxSteps}
                                value={maskStart}
                                onChange={(e) => onMaskStartChange(parseInt(e.target.value))}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
