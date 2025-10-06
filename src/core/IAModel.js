import { IAPool } from './IAPool.js';
import { letters, letterToIndex } from './data.js';
import { WORD_LIST_WITH_FREQ } from './wordFrequencies.js';
import {
    FEATURE_LETTER_EXCITATION,
    FEATURE_LETTER_INHIBITION,
    LETTER_WORD_EXCITATION,
    LETTER_WORD_INHIBITION,
    WORD_LETTER_EXCITATION,
    WORD_LETTER_INHIBITION,
    WORD_WORD_INHIBITION,
    LETTER_LETTER_INHIBITION,
    MIN_ACTIVATION,
    DECAY_RATE,
    REST_GAIN,
    MASK
} from './constants.js';

/**
 * Interactive Activation Model for Word Recognition
 *
 * Implements the three-layer architecture from Rumelhart & McClelland (1982):
 * - Feature layer: Visual features at each position
 * - Letter layer: Letters at each position
 * - Word layer: Complete words
 */
export class InteractiveActivationModel {
    /**
     * @param {Array<{word: string, frequency: number}>} wordData - Optional custom word list with frequencies
     */
    constructor(wordData = WORD_LIST_WITH_FREQ) {
        this.wordData = wordData;
        this.wordList = wordData.map(d => d.word);
        this.numPositions = 4; // Four-letter words

        // Initialize weight matrices
        this.featureToLetterWeights = this.initializeFeatureToLetterWeights();
        this.featureAbsenceToLetterWeights = this.initializeFeatureAbsenceToLetterWeights();
        this.letterToWordWeights = this.initializeLetterWordWeights();
        this.wordToLetterWeights = this.initializeWordLetterWeights();

        // Initialize letter pools (one for each position)
        this.letterPools = Array(this.numPositions).fill().map((_, i) =>
            new IAPool(
                26, // 26 letters
                [
                    this.featureToLetterWeights,
                    this.featureAbsenceToLetterWeights,
                    this.wordToLetterWeights[i]
                ],
                DECAY_RATE,
                0,
                1.0,
                MIN_ACTIVATION,
                LETTER_LETTER_INHIBITION
            )
        );

        // Initialize word pool
        const restingStates = this.initializeWordRestingStates();
        this.wordPool = new IAPool(
            this.wordList.length,
            this.letterToWordWeights,
            DECAY_RATE,
            restingStates,
            1.0,
            MIN_ACTIVATION,
            WORD_WORD_INHIBITION
        );
    }

    /**
     * Initialize feature-to-letter weight matrix
     * Maps 14 visual features to 26 letters
     * Feature PRESENT (1) -> excitation, ABSENT (0) -> inhibition
     */
    initializeFeatureToLetterWeights(excitation = FEATURE_LETTER_EXCITATION, inhibition = FEATURE_LETTER_INHIBITION) {
        const letterArray = Object.values(letters);
        const weights = Array(14).fill().map(() => Array(26).fill(0));

        for (let i = 0; i < letterArray.length; i++) {
            for (let j = 0; j < 14; j++) {
                weights[j][i] = letterArray[i][j] ?
                    excitation :
                    -inhibition;
            }
        }

        return weights;
    }

    /**
     * Initialize feature-absence-to-letter weight matrix
     * Inverts the binary letter features FIRST, then applies weight mapping
     * This matches Python: w_from_features_to_letters_absence = 1 - w_from_features_to_letters
     */
    initializeFeatureAbsenceToLetterWeights(excitation = FEATURE_LETTER_EXCITATION, inhibition = FEATURE_LETTER_INHIBITION) {
        const letterArray = Object.values(letters);
        const weights = Array(14).fill().map(() => Array(26).fill(0));

        for (let i = 0; i < letterArray.length; i++) {
            for (let j = 0; j < 14; j++) {
                // Invert the binary feature value (1 - value), then map to weights
                weights[j][i] = (1 - letterArray[i][j]) ?
                    excitation :
                    -inhibition;
            }
        }

        return weights;
    }

    /**
     * Initialize letter-to-word weights for all 4 positions
     * Returns array of 4 weight matrices, one per position
     */
    initializeLetterWordWeights(excitation = LETTER_WORD_EXCITATION, inhibition = LETTER_WORD_INHIBITION) {
        const weights = Array(this.numPositions).fill().map(() =>
            Array(26).fill().map(() => Array(this.wordList.length).fill(-inhibition))
        );

        // Set excitatory connections based on word list
        this.wordList.forEach((word, wordIndex) => {
            for (let pos = 0; pos < this.numPositions; pos++) {
                const letterIndex = letterToIndex(word[pos]);
                weights[pos][letterIndex][wordIndex] = excitation;
            }
        });

        return weights;
    }

    /**
     * Initialize word-to-letter weights
     * Returns array of 4 weight matrices, one per position
     */
    initializeWordLetterWeights(excitation = WORD_LETTER_EXCITATION, inhibition = WORD_LETTER_INHIBITION) {
        const weights = Array(this.numPositions).fill().map(() =>
            Array(this.wordList.length).fill().map(() => Array(26).fill(-inhibition))
        );

        // Set excitatory connections based on word list
        this.wordList.forEach((word, wordIndex) => {
            for (let pos = 0; pos < this.numPositions; pos++) {
                const letterIndex = letterToIndex(word[pos]);
                weights[pos][wordIndex][letterIndex] = excitation;
            }
        });

        return weights;
    }

    /**
     * Initialize resting states for words based on frequency
     * More frequent words have higher (less negative) resting states
     * Matches Python: resting_state = frequency * REST_GAIN
     */
    initializeWordRestingStates() {
        return this.wordData.map(d => d.frequency * REST_GAIN);
    }

    /**
     * Perform one step of model processing
     * @param {Array<Array<number>>} inputFeatures - Features for each position (4 x 14)
     * @param {boolean} enableWordLayer - Whether to use word layer
     */
    stepModel(inputFeatures, enableWordLayer = true) {
        const letterStates = this.letterPools.map(pool => [...pool.state]);
        const wordState = enableWordLayer ?
            [...this.wordPool.state] :
            Array(this.wordList.length).fill(0);

        // Update letter pools
        // Compute absence features: 1 - feature_value for each feature
        const absenceFeatures = inputFeatures.map(features =>
            features.map(f => 1 - f)
        );

        this.letterPools.forEach((pool, i) => {
            const input = [
                inputFeatures[i],      // Feature presence
                absenceFeatures[i],    // Feature absence (1 - feature)
                wordState              // Top-down from words
            ];
            pool.step(input);
        });

        // Update word pool if enabled
        if (enableWordLayer) {
            this.wordPool.step(letterStates);
        }
    }

    /**
     * Run a complete trial
     * @param {Array<Array<number>>} stimulus - Initial stimulus features (4 x 14)
     * @param {number} duration - Total duration in time steps
     * @param {Array<{type: string, index: number|Array<number>}>} targets - Tracking targets
     * @param {boolean} enableWordLayer - Whether to use word layer
     * @param {number} stimulusDuration - How long to show stimulus (default 20)
     * @returns {Object} Results with activation traces
     */
    runTrial(stimulus, duration, targets, enableWordLayer = true, stimulusDuration = 20) {
        // Reset all pools
        this.reset();

        // Prepare results storage
        const results = {
            time: Array.from({ length: duration }, (_, i) => i),
            activations: {},
            letterStates: [],
            wordStates: []
        };

        // Initialize activation traces for each target
        targets.forEach(target => {
            results.activations[target.label] = [];
        });

        // Run simulation
        for (let t = 0; t < duration; t++) {
            // Use stimulus for first N steps, then mask
            const input = t < stimulusDuration ?
                stimulus :
                [MASK, MASK, MASK, MASK];

            this.stepModel(input, enableWordLayer);

            // Record target activations
            targets.forEach(target => {
                let activation;
                if (target.type === 'word') {
                    activation = this.wordPool.state[target.index];
                } else if (target.type === 'letter') {
                    activation = this.letterPools[target.position].state[target.index];
                }
                results.activations[target.label].push(activation);
            });

            // Store complete states
            results.letterStates.push(this.letterPools.map(p => [...p.state]));
            results.wordStates.push([...this.wordPool.state]);
        }

        return results;
    }

    /**
     * Reset all pools to resting state
     */
    reset() {
        this.letterPools.forEach(pool => pool.reset());
        this.wordPool.reset();
    }

    /**
     * Get current activation state of all layers
     */
    getState() {
        return {
            letters: this.letterPools.map(pool => pool.getState()),
            words: this.wordPool.getState()
        };
    }

    /**
     * Get top N most active words
     * @param {number} n - Number of words to return
     */
    getTopWords(n = 10) {
        return this.wordPool.getTopN(n).map(({ index, activation }) => ({
            word: this.wordList[index],
            activation
        }));
    }

    /**
     * Get top N most active letters for each position
     * @param {number} n - Number of letters per position
     */
    getTopLetters(n = 5) {
        return this.letterPools.map((pool, position) => ({
            position,
            letters: pool.getTopN(n).map(({ index, activation }) => ({
                letter: String.fromCharCode(index + 'a'.charCodeAt(0)),
                activation
            }))
        }));
    }

    /**
     * Convert text string to feature representation
     * @param {string} text - Four-letter word
     * @returns {Array<Array<number>>} Feature vectors for each position
     */
    textToFeatures(text) {
        const normalized = text.toLowerCase().slice(0, 4).padEnd(4, ' ');
        return Array.from(normalized).map(char => {
            if (char === ' ') return Array(14).fill(0);
            return letters[char] || Array(14).fill(0);
        });
    }
}
