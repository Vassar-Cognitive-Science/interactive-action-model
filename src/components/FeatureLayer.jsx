import React from 'react';
import LetterGlyph from './LetterGlyph.jsx';
import './FeatureLayer.css';

/**
 * Displays the feature layer showing visual features for each position
 */
export default function FeatureLayer({ features }) {
    return (
        <div className="feature-layer">
            <div className="layer-header">Feature Layer (Visual Input)</div>
            <div className="feature-positions">
                {features.map((positionFeatures, posIdx) => (
                    <div key={posIdx} className="feature-position">
                        <div className="position-label">Position {posIdx + 1}</div>
                        <LetterGlyph features={positionFeatures} size={80} />
                    </div>
                ))}
            </div>
        </div>
    );
}
