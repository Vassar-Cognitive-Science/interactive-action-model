import React from 'react';
import './ChartSettings.css';

/**
 * Chart visualization settings panel
 */
export default function ChartSettings({ settings, onSettingsChange }) {
    const updateSetting = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="chart-settings">
            <h3>Chart Settings</h3>

            <div className="setting-group">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.showTopWords}
                        onChange={(e) => updateSetting('showTopWords', e.target.checked)}
                    />
                    Show Top 5 Words
                </label>
            </div>

            <div className="setting-group">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.showTrackedWords}
                        onChange={(e) => updateSetting('showTrackedWords', e.target.checked)}
                    />
                    Show Tracked Words
                </label>
            </div>

            <div className="setting-group">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.showLetters}
                        onChange={(e) => updateSetting('showLetters', e.target.checked)}
                    />
                    Show Letter Units
                </label>
            </div>

            {settings.showLetters && (
                <div className="setting-subgroup">
                    <label htmlFor="letter-position">Position:</label>
                    <select
                        id="letter-position"
                        value={settings.letterPosition}
                        onChange={(e) => updateSetting('letterPosition', parseInt(e.target.value))}
                    >
                        <option value={0}>Position 1</option>
                        <option value={1}>Position 2</option>
                        <option value={2}>Position 3</option>
                        <option value={3}>Position 4</option>
                    </select>

                    <label htmlFor="letter-filter">Letters:</label>
                    <input
                        id="letter-filter"
                        type="text"
                        value={settings.letterFilter}
                        onChange={(e) => updateSetting('letterFilter', e.target.value.toLowerCase())}
                        placeholder="e.g., work"
                        maxLength={10}
                        title="Enter letters to track (e.g., 'work' tracks W, O, R, K)"
                    />
                </div>
            )}

            <div className="setting-group">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.autoScale}
                        onChange={(e) => updateSetting('autoScale', e.target.checked)}
                    />
                    Auto-scale Y-axis
                </label>
            </div>

            <div className="setting-group">
                <label>
                    <input
                        type="checkbox"
                        checked={settings.showLegend}
                        onChange={(e) => updateSetting('showLegend', e.target.checked)}
                    />
                    Show Legend
                </label>
            </div>
        </div>
    );
}
