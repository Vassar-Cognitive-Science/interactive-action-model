import { InteractiveActivationModel } from '../core/IAModel.js';
import { letters } from '../core/data.js';

/**
 * Classic word superiority effect experiment
 * Tests whether letters are recognized better in word context
 */
export function runReadVsE() {
    const model = new InteractiveActivationModel();

    // READ word features
    const readFeatures = ['r', 'e', 'a', 'd'].map(c => letters[c]);

    // E alone features (blanks in other positions)
    const blankFeatures = Array(14).fill(0);
    const eAloneFeatures = [blankFeatures, letters['e'], blankFeatures, blankFeatures];

    // Run READ condition - track E in position 1 (index 4 for letter 'e')
    const readResults = model.runTrial(
        readFeatures,
        40,
        [{ type: 'letter', position: 1, index: 4, label: 'E in READ' }],
        true,
        20
    );

    // Reset and run E alone condition
    const eAloneResults = model.runTrial(
        eAloneFeatures,
        40,
        [{ type: 'letter', position: 1, index: 4, label: 'E alone' }],
        false, // No word layer
        20
    );

    return {
        title: 'Word Superiority Effect: E in READ vs E Alone',
        description: 'Letters are recognized better when presented in a word context compared to isolation.',
        data: [
            { label: 'E in READ', values: readResults.activations['E in READ'] },
            { label: 'E alone', values: eAloneResults.activations['E alone'] }
        ],
        timePoints: readResults.time
    };
}

/**
 * Pseudoword superiority effect
 * Tests whether letters are recognized better in pronounceable non-words
 */
export function runMaveVsE() {
    const model = new InteractiveActivationModel();

    // MAVE pseudoword features
    const maveFeatures = ['m', 'a', 'v', 'e'].map(c => letters[c]);

    // E alone features
    const blankFeatures = Array(14).fill(0);
    const eAloneFeatures = [blankFeatures, blankFeatures, blankFeatures, letters['e']];

    // Run MAVE condition - track E in position 3 (index 4)
    const maveResults = model.runTrial(
        maveFeatures,
        40,
        [{ type: 'letter', position: 3, index: 4, label: 'E in MAVE' }],
        true,
        20
    );

    // Run E alone condition
    const eAloneResults = model.runTrial(
        eAloneFeatures,
        40,
        [{ type: 'letter', position: 3, index: 4, label: 'E alone' }],
        false,
        20
    );

    return {
        title: 'Pseudoword Superiority: E in MAVE vs E Alone',
        description: 'Even non-words can facilitate letter recognition through word-layer feedback.',
        data: [
            { label: 'E in MAVE', values: maveResults.activations['E in MAVE'] },
            { label: 'E alone', values: eAloneResults.activations['E alone'] }
        ],
        timePoints: maveResults.time
    };
}

/**
 * Rich get richer effect
 * More frequent words are recognized faster
 */
export function runRichGetRicher() {
    const model = new InteractiveActivationModel();

    // MAVE features (not in word list)
    const maveFeatures = ['m', 'a', 'v', 'e'].map(c => letters[c]);

    // Find word indices for target words
    const wordIndices = ['have', 'gave', 'save'].map(word => ({
        index: model.wordList.indexOf(word),
        word: word.toUpperCase()
    }));

    // Track all three words
    const targets = wordIndices.map(({ index, word }) => ({
        type: 'word',
        index,
        label: word
    }));

    const results = model.runTrial(maveFeatures, 40, targets, true, 20);

    return {
        title: 'Rich Get Richer Effect with MAVE',
        description: 'High-frequency words (HAVE) activate faster than low-frequency words (SAVE) when presented with similar input.',
        data: wordIndices.map(({ word }) => ({
            label: word,
            values: results.activations[word]
        })),
        timePoints: results.time
    };
}

/**
 * Gang effect
 * Words sharing features compete for activation
 */
export function runGangEffect() {
    const model = new InteractiveActivationModel();

    // MAVE features
    const maveFeatures = ['m', 'a', 'v', 'e'].map(c => letters[c]);

    // Find word indices
    const wordIndices = ['male', 'move', 'save'].map(word => ({
        index: model.wordList.indexOf(word),
        word: word.toUpperCase()
    }));

    // Track all three words
    const targets = wordIndices.map(({ index, word }) => ({
        type: 'word',
        index,
        label: word
    }));

    const results = model.runTrial(maveFeatures, 40, targets, true, 20);

    return {
        title: 'Gang Effect with MAVE',
        description: 'SAVE shares more letters with MAVE and receives stronger activation than words with fewer matching letters.',
        data: wordIndices.map(({ word }) => ({
            label: word,
            values: results.activations[word]
        })),
        timePoints: results.time
    };
}

export const EXPERIMENTS = {
    readVsE: {
        name: 'Word Superiority Effect',
        run: runReadVsE
    },
    maveVsE: {
        name: 'Pseudoword Superiority',
        run: runMaveVsE
    },
    richGetRicher: {
        name: 'Rich Get Richer',
        run: runRichGetRicher
    },
    gangEffect: {
        name: 'Gang Effect',
        run: runGangEffect
    }
};
