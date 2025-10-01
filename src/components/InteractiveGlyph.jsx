import React from 'react';
import './InteractiveGlyph.css';

/**
 * Interactive letter glyph where features can be clicked to toggle
 */
export default function InteractiveGlyph({ features, onToggleFeature, size = 100 }) {
    const getFeatureColor = (value) => {
        if (value === 1) return '#27ae60'; // Green - PRESENT
        if (value === 0.5) return '#2c3e50'; // Dark/Black - AMBIGUOUS
        return '#95a5a6'; // Gray for ABSENT (faded)
    };

    const getFeatureOpacity = (value) => {
        if (value === 1) return 1.0; // Full opacity for PRESENT
        if (value === 0.5) return 1.0; // Full opacity for AMBIGUOUS
        return 0.2; // Very faded for ABSENT
    };

    // Define interactive feature paths with click areas
    const renderFeature = (index) => {
        const isActive = features[index];
        const color = getFeatureColor(isActive);
        const opacity = getFeatureOpacity(isActive);
        const strokeWidth = 8;

        const handleClick = (e) => {
            e.stopPropagation();
            if (onToggleFeature) {
                onToggleFeature(index);
            }
        };

        // Each feature is a group with visible line and larger invisible click target
        const featureDefs = {
            0: { // Top horizontal
                line: <line x1="20" y1="10" x2="80" y2="10" />,
                hitArea: <rect x="15" y="5" width="70" height="10" fillOpacity="0" />
            },
            1: { // Left middle horizontal
                line: <line x1="10" y1="50" x2="40" y2="50" />,
                hitArea: <rect x="5" y="45" width="40" height="10" fillOpacity="0" />
            },
            2: { // Right middle horizontal
                line: <line x1="60" y1="50" x2="90" y2="50" />,
                hitArea: <rect x="55" y="45" width="40" height="10" fillOpacity="0" />
            },
            3: { // Bottom horizontal
                line: <line x1="20" y1="90" x2="80" y2="90" />,
                hitArea: <rect x="15" y="85" width="70" height="10" fillOpacity="0" />
            },
            4: { // Upper left vertical
                line: <line x1="10" y1="10" x2="10" y2="40" />,
                hitArea: <rect x="5" y="5" width="10" height="40" fillOpacity="0" />
            },
            5: { // Upper center vertical
                line: <line x1="50" y1="10" x2="50" y2="40" />,
                hitArea: <rect x="45" y="5" width="10" height="40" fillOpacity="0" />
            },
            6: { // Upper right vertical
                line: <line x1="90" y1="10" x2="90" y2="40" />,
                hitArea: <rect x="85" y="5" width="10" height="40" fillOpacity="0" />
            },
            7: { // Lower left vertical
                line: <line x1="10" y1="60" x2="10" y2="90" />,
                hitArea: <rect x="5" y="55" width="10" height="40" fillOpacity="0" />
            },
            8: { // Lower center vertical
                line: <line x1="50" y1="60" x2="50" y2="90" />,
                hitArea: <rect x="45" y="55" width="10" height="40" fillOpacity="0" />
            },
            9: { // Lower right vertical
                line: <line x1="90" y1="60" x2="90" y2="90" />,
                hitArea: <rect x="85" y="55" width="10" height="40" fillOpacity="0" />
            },
            10: { // Top-left diagonal
                line: <line x1="10" y1="10" x2="50" y2="50" />,
                hitArea: <polygon points="5,5 15,15 50,50 45,55" fillOpacity="0" />
            },
            11: { // Top-right diagonal
                line: <line x1="90" y1="10" x2="50" y2="50" />,
                hitArea: <polygon points="95,5 85,15 50,50 55,55" fillOpacity="0" />
            },
            12: { // Bottom-left diagonal
                line: <line x1="10" y1="90" x2="50" y2="50" />,
                hitArea: <polygon points="5,95 15,85 50,50 45,45" fillOpacity="0" />
            },
            13: { // Bottom-right diagonal
                line: <line x1="90" y1="90" x2="50" y2="50" />,
                hitArea: <polygon points="95,95 85,85 50,50 55,45" fillOpacity="0" />
            }
        };

        const def = featureDefs[index];
        if (!def) return null;

        return (
            <g
                key={index}
                className="interactive-feature"
                onClick={handleClick}
                style={{ cursor: onToggleFeature ? 'pointer' : 'default' }}
            >
                {/* Visible line */}
                {React.cloneElement(def.line, {
                    stroke: color,
                    strokeWidth,
                    strokeLinecap: 'round',
                    opacity
                })}
                {/* Invisible larger hit area for easier clicking */}
                {onToggleFeature && React.cloneElement(def.hitArea, {
                    className: 'feature-hit-area'
                })}
            </g>
        );
    };

    return (
        <svg
            className="interactive-glyph"
            width={size}
            height={size}
            viewBox="0 0 100 100"
        >
            {/* Background */}
            <rect width="100" height="100" fill="#f8f8f8" rx="4" />

            {/* Render all features */}
            {features.map((_, index) => renderFeature(index))}
        </svg>
    );
}
