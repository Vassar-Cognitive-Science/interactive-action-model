import { describe, it, expect } from 'vitest';
import { InteractiveActivationModel } from './IAModel.js';
import { letterToIndex } from './data.js';

describe('InteractiveActivationModel', () => {
    describe('constructor', () => {
        it('should initialize with default word list', () => {
            const model = new InteractiveActivationModel();
            expect(model.wordList.length).toBeGreaterThan(0);
            expect(model.letterPools.length).toBe(4);
            expect(model.wordPool).toBeDefined();
        });

        it('should initialize letter pools with correct size', () => {
            const model = new InteractiveActivationModel();
            model.letterPools.forEach(pool => {
                expect(pool.size).toBe(26);
            });
        });

        it('should initialize word pool with correct size', () => {
            const model = new InteractiveActivationModel();
            expect(model.wordPool.size).toBe(model.wordList.length);
        });
    });

    describe('weight initialization', () => {
        it('should create feature-to-letter weights', () => {
            const model = new InteractiveActivationModel();
            expect(model.featureToLetterWeights.length).toBe(14);
            expect(model.featureToLetterWeights[0].length).toBe(26);
        });

        it('should create letter-to-word weights for each position', () => {
            const model = new InteractiveActivationModel();
            expect(model.letterToWordWeights.length).toBe(4);
            model.letterToWordWeights.forEach(weights => {
                expect(weights.length).toBe(26);
                expect(weights[0].length).toBe(model.wordList.length);
            });
        });

        it('should create word-to-letter weights for each position', () => {
            const model = new InteractiveActivationModel();
            expect(model.wordToLetterWeights.length).toBe(4);
            model.wordToLetterWeights.forEach(weights => {
                expect(weights.length).toBe(model.wordList.length);
                expect(weights[0].length).toBe(26);
            });
        });

        it('should set correct excitatory connections for known words', () => {
            const model = new InteractiveActivationModel(['test']);
            // Check that 't' at position 0 excites 'test'
            const tIndex = letterToIndex('t');
            expect(model.letterToWordWeights[0][tIndex][0]).toBeGreaterThan(0);
        });
    });

    describe('reset', () => {
        it('should reset all pools to resting state', () => {
            const model = new InteractiveActivationModel();

            // Modify states
            model.letterPools[0].state = Array(26).fill(0.5);
            model.wordPool.state = Array(model.wordList.length).fill(0.5);

            // Reset
            model.reset();

            // Check reset worked
            expect(model.letterPools[0].state).toEqual(model.letterPools[0].restingState);
            expect(model.wordPool.state).toEqual(model.wordPool.restingState);
        });
    });

    describe('textToFeatures', () => {
        it('should convert text to feature vectors', () => {
            const model = new InteractiveActivationModel();
            const features = model.textToFeatures('test');
            expect(features.length).toBe(4);
            features.forEach(featureVec => {
                expect(featureVec.length).toBe(14);
            });
        });

        it('should handle short words by padding', () => {
            const model = new InteractiveActivationModel();
            const features = model.textToFeatures('hi');
            expect(features.length).toBe(4);
            expect(features[2]).toEqual(Array(14).fill(0)); // Blank
            expect(features[3]).toEqual(Array(14).fill(0)); // Blank
        });
    });

    describe('getTopWords', () => {
        it('should return top N active words', () => {
            const model = new InteractiveActivationModel();
            model.wordPool.state[0] = 0.8;
            model.wordPool.state[1] = 0.5;
            model.wordPool.state[2] = 0.3;

            const topWords = model.getTopWords(2);
            expect(topWords.length).toBe(2);
            expect(topWords[0].activation).toBe(0.8);
            expect(topWords[0].word).toBe(model.wordList[0]);
        });
    });

    describe('runTrial', () => {
        it('should run simulation for specified duration', () => {
            const model = new InteractiveActivationModel();
            const stimulus = model.textToFeatures('have');

            const results = model.runTrial(
                stimulus,
                10,
                [{ type: 'word', index: model.wordList.indexOf('have'), label: 'HAVE' }],
                true
            );

            expect(results.time.length).toBe(10);
            expect(results.activations['HAVE'].length).toBe(10);
        });

        it('should show word activation increases over time', () => {
            const model = new InteractiveActivationModel();
            const stimulus = model.textToFeatures('have');
            const haveIndex = model.wordList.indexOf('have');

            const results = model.runTrial(
                stimulus,
                30,
                [{ type: 'word', index: haveIndex, label: 'HAVE' }],
                true
            );

            const activations = results.activations['HAVE'];
            // Activation should generally increase
            expect(activations[29]).toBeGreaterThan(activations[0]);
        });
    });
});
