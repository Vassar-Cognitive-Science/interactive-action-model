import React from 'react';
import './LetterGlyph.css';

/**
 * Renders a letter using its visual features
 * Features correspond to line segments that make up the letter
 */
export default function LetterGlyph({ features, size = 40 }) {
    const featureNames = [
        'top-horizontal',           // 0 (Feature 1)
        'left-middle-horizontal',   // 1 (Feature 2)
        'right-middle-horizontal',  // 2 (Feature 3)
        'bottom-horizontal',        // 3 (Feature 4)
        'upper-left-vertical',      // 4 (Feature 5)
        'upper-center-vertical',    // 5 (Feature 6)
        'upper-right-vertical',     // 6 (Feature 7)
        'lower-left-vertical',      // 7 (Feature 8)
        'lower-center-vertical',    // 8 (Feature 9)
        'lower-right-vertical',     // 9 (Feature 10)
        'top-left-diagonal',        // 10 (Feature 11)
        'top-right-diagonal',       // 11 (Feature 12)
        'bottom-left-diagonal',     // 12 (Feature 13)
        'bottom-right-diagonal'     // 13 (Feature 14)
    ];

    // Define SVG paths for each feature based on the IAM diagram
    // Using a coordinate system where the letter fits in a box from (0,0) to (100,100)
    const renderFeature = (index, isActive) => {
        if (!isActive) return null;

        const strokeWidth = 6;
        const color = '#e74c3c'; // Red for active features

        // Feature positions based on the diagram
        switch (index) {
            case 0: // Feature 1: Top horizontal
                return <line key={index} x1="20" y1="10" x2="80" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 1: // Feature 2: Left middle horizontal
                return <line key={index} x1="10" y1="50" x2="40" y2="50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 2: // Feature 3: Right middle horizontal
                return <line key={index} x1="60" y1="50" x2="90" y2="50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 3: // Feature 4: Bottom horizontal
                return <line key={index} x1="20" y1="90" x2="80" y2="90" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 4: // Feature 5: Upper left vertical
                return <line key={index} x1="10" y1="10" x2="10" y2="40" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 5: // Feature 6: Center vertical (upper part)
                return <line key={index} x1="50" y1="10" x2="50" y2="40" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 6: // Feature 7: Upper right vertical
                return <line key={index} x1="90" y1="10" x2="90" y2="40" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 7: // Feature 8: Lower left vertical
                return <line key={index} x1="10" y1="60" x2="10" y2="90" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 8: // Feature 9: Center vertical (lower part)
                return <line key={index} x1="50" y1="60" x2="50" y2="90" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 9: // Feature 10: Lower right vertical
                return <line key={index} x1="90" y1="60" x2="90" y2="90" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 10: // Feature 11: Top-left to center diagonal
                return <line key={index} x1="10" y1="10" x2="50" y2="50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 11: // Feature 12: Top-right to center diagonal
                return <line key={index} x1="90" y1="10" x2="50" y2="50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 12: // Feature 13: Bottom-left to center diagonal
                return <line key={index} x1="10" y1="90" x2="50" y2="50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            case 13: // Feature 14: Bottom-right to center diagonal
                return <line key={index} x1="90" y1="90" x2="50" y2="50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;

            default:
                return null;
        }
    };

    return (
        <svg
            className="letter-glyph"
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{ display: 'block' }}
        >
            {/* Background */}
            <rect width="100" height="100" fill="#f8f8f8" />

            {/* Render all active features */}
            {features.map((isActive, index) => renderFeature(index, isActive > 0))}
        </svg>
    );
}
