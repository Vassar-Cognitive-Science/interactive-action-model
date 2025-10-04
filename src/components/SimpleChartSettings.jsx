import React from 'react';
import './SimpleChartSettings.css';

/**
 * Simple chart settings for word and letter charts
 */
export default function SimpleChartSettings({ settings, onSettingsChange, type = 'word' }) {
    const updateSetting = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="simple-chart-settings">
            {type === 'word' && (
                <>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.showTopWords}
                                onChange={(e) => updateSetting('showTopWords', e.target.checked)}
                            />
                            Show Top 5 Words
                        </label>
                    </div>

                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.showTrackedWords}
                                onChange={(e) => updateSetting('showTrackedWords', e.target.checked)}
                            />
                            Show Tracked Words
                        </label>
                    </div>
                </>
            )}

            {type === 'letter' && (
                <>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.showTopLetters}
                                onChange={(e) => updateSetting('showTopLetters', e.target.checked)}
                            />
                            Show Top Activated Letters
                        </label>
                    </div>

                    {settings.showTopLetters && (
                        <div className="setting-item" style={{ marginLeft: '1.5rem' }}>
                            <label htmlFor="top-n">Number of letters:</label>
                            <input
                                id="top-n"
                                type="number"
                                min="1"
                                max="10"
                                value={settings.topN || 3}
                                onChange={(e) => updateSetting('topN', parseInt(e.target.value))}
                                style={{ width: '80px' }}
                            />
                        </div>
                    )}

                    <div className="setting-item">
                        <label htmlFor="letter-filter">Filter Specific Letters:</label>
                        <input
                            id="letter-filter"
                            type="text"
                            value={settings.letterFilter}
                            onChange={(e) => updateSetting('letterFilter', e.target.value.toLowerCase())}
                            placeholder="e.g., work"
                            maxLength={10}
                        />
                        <span className="help-text">Overrides top letters if specified</span>
                    </div>
                </>
            )}

            <div className="setting-item">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.autoScale}
                        onChange={(e) => updateSetting('autoScale', e.target.checked)}
                    />
                    Auto-scale Y-axis
                </label>
            </div>
        </div>
    );
}
