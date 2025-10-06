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

        // Allow letters, #, and @
        const char = newValue.toLowerCase().replace(/[^a-z#@]/g, '');

        if (char) {
            // Update the value - always use the last character typed (replace mode)
            const newLetters = [...letters];
            newLetters[index] = char[char.length - 1];

            // Convert to string, trimming only trailing spaces but preserving structure
            let result = newLetters.join('');
            // Find the last non-space character
            let lastIndex = -1;
            for (let i = 3; i >= 0; i--) {
                if (newLetters[i] !== ' ') {
                    lastIndex = i;
                    break;
                }
            }
            // Only include up to the last non-space character
            if (lastIndex >= 0) {
                result = result.substring(0, lastIndex + 1);
            } else {
                result = '';
            }

            onChange(result);

            // Auto-advance to next box
            if (index < 3) {
                inputRefs[index + 1].current?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (disabled) return;

        // If it's a letter key, #, or @ and the box already has content, prevent default and handle replacement
        if (e.key.length === 1 && /[a-zA-Z#@]/.test(e.key)) {
            e.preventDefault(); // Prevent the default input behavior

            // Directly set the new letter, #, or @
            const newLetters = [...letters];
            newLetters[index] = e.key.toLowerCase();

            // Convert to string, preserving positions
            let result = newLetters.join('');
            let lastIndex = -1;
            for (let i = 3; i >= 0; i--) {
                if (newLetters[i] !== ' ') {
                    lastIndex = i;
                    break;
                }
            }
            if (lastIndex >= 0) {
                result = result.substring(0, lastIndex + 1);
            } else {
                result = '';
            }

            onChange(result);

            // Auto-advance to next box
            if (index < 3) {
                inputRefs[index + 1].current?.focus();
            }
            return;
        }

        // Backspace: clear current box and move to previous
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newLetters = [...letters];

            if (letters[index] !== ' ') {
                // Clear current box
                newLetters[index] = ' ';

                let result = newLetters.join('');
                let lastIndex = -1;
                for (let i = 3; i >= 0; i--) {
                    if (newLetters[i] !== ' ') {
                        lastIndex = i;
                        break;
                    }
                }
                if (lastIndex >= 0) {
                    result = result.substring(0, lastIndex + 1);
                } else {
                    result = '';
                }

                onChange(result);
            } else if (index > 0) {
                // Move to previous box and clear it
                newLetters[index - 1] = ' ';

                let result = newLetters.join('');
                let lastIndex = -1;
                for (let i = 3; i >= 0; i--) {
                    if (newLetters[i] !== ' ') {
                        lastIndex = i;
                        break;
                    }
                }
                if (lastIndex >= 0) {
                    result = result.substring(0, lastIndex + 1);
                } else {
                    result = '';
                }

                onChange(result);
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
        const cleanText = pastedText.toLowerCase().replace(/[^a-z#@]/g, '').slice(0, 4);

        onChange(cleanText);

        // Focus the next empty box or the last box
        const nextIndex = Math.min(cleanText.length, 3);
        inputRefs[nextIndex].current?.focus();
    };

    const handleFocus = (index, e) => {
        // Select all text when focusing (makes replacement easier)
        e.target.select();
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
                    onFocus={(e) => handleFocus(index, e)}
                    disabled={disabled}
                    className="letter-box"
                    placeholder="·"
                />
            ))}
        </div>
    );
}
