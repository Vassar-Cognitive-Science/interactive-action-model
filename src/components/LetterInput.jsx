import React, { useRef, useEffect } from 'react';
import './LetterInput.css';

/**
 * PIN-style letter input with 4 separate boxes
 * Auto-advances to next box when a letter is entered
 */
export default function LetterInput({ value = '', onChange, disabled = false }) {
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    // Ensure value is always 4 characters
    const letters = (value + '    ').slice(0, 4).split('');

    const handleChange = (index, newValue) => {
        if (disabled) return;

        // Only allow letters
        const letter = newValue.toLowerCase().replace(/[^a-z]/g, '');

        if (letter) {
            // Update the value
            const newLetters = [...letters];
            newLetters[index] = letter[0];
            onChange(newLetters.join('').trim());

            // Auto-advance to next box
            if (index < 3) {
                inputRefs[index + 1].current?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (disabled) return;

        // Backspace: clear current box and move to previous
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newLetters = [...letters];

            if (letters[index] !== ' ') {
                // Clear current box
                newLetters[index] = ' ';
                onChange(newLetters.join('').trim());
            } else if (index > 0) {
                // Move to previous box and clear it
                newLetters[index - 1] = ' ';
                onChange(newLetters.join('').trim());
                inputRefs[index - 1].current?.focus();
            }
        }
        // Arrow keys for navigation
        else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
        else if (e.key === 'ArrowRight' && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handlePaste = (e) => {
        if (disabled) return;
        e.preventDefault();

        const pastedText = e.clipboardData.getData('text');
        const cleanText = pastedText.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);

        onChange(cleanText);

        // Focus the next empty box or the last box
        const nextIndex = Math.min(cleanText.length, 3);
        inputRefs[nextIndex].current?.focus();
    };

    return (
        <div className="letter-input">
            {[0, 1, 2, 3].map(index => (
                <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={1}
                    value={letters[index] === ' ' ? '' : letters[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="letter-box"
                    placeholder="·"
                />
            ))}
        </div>
    );
}
