/**
 * Color utilities for activation visualization
 */

/**
 * Convert activation value to color
 * @param {number} activation - Activation value (typically -0.2 to 1.0)
 * @param {number} min - Minimum activation value
 * @param {number} max - Maximum activation value
 * @returns {string} RGB color string
 */
export function activationToColor(activation, min = -0.2, max = 1.0) {
    // Normalize to 0-1 range
    const normalized = Math.max(0, Math.min(1, (activation - min) / (max - min)));

    if (normalized < 0.5) {
        // Low activation: white to light blue
        const intensity = normalized * 2; // 0 to 1
        const r = 255;
        const g = Math.floor(255 - intensity * 50);
        const b = Math.floor(255 - intensity * 80);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // High activation: light blue to dark blue
        const intensity = (normalized - 0.5) * 2; // 0 to 1
        const r = Math.floor(175 - intensity * 144); // 175 to 31
        const g = Math.floor(205 - intensity * 86); // 205 to 119
        const b = Math.floor(255 - intensity * 75); // 255 to 180
        return `rgb(${r}, ${g}, ${b})`;
    }
}

/**
 * Get opacity based on activation strength
 * @param {number} activation - Activation value
 * @param {number} min - Minimum activation value
 * @param {number} max - Maximum activation value
 * @returns {number} Opacity value (0-1)
 */
export function activationToOpacity(activation, min = -0.2, max = 1.0) {
    const normalized = Math.max(0, Math.min(1, (activation - min) / (max - min)));
    return 0.3 + normalized * 0.7; // Range from 0.3 to 1.0
}

/**
 * Get text color (black or white) based on background activation
 * @param {number} activation - Activation value
 * @param {number} min - Minimum activation value
 * @param {number} max - Maximum activation value
 * @returns {string} 'black' or 'white'
 */
export function getContrastColor(activation, min = -0.2, max = 1.0) {
    const normalized = (activation - min) / (max - min);
    return normalized > 0.6 ? 'white' : 'black';
}
