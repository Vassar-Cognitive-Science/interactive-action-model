import { describe, test, expect } from 'vitest';
import { InteractiveActivationModel } from './IAModel.js';
import { letters } from './data.js';

describe('WORK activation comparison', () => {
    test('trace WORK activation for 20 steps', () => {
        const model = new InteractiveActivationModel();

        // Convert WORK to features
        const workFeatures = [
            letters['w'],
            letters['o'],
            letters['r'],
            letters['k']
        ];

        console.log('\n=== JavaScript Model - WORK activation ===');

        // Get initial resting states
        const workIdx = model.wordList.indexOf('work');
        const wordIdx = model.wordList.indexOf('word');
        const weakIdx = model.wordList.indexOf('weak');

        console.log(`Initial resting state for WORK: ${model.wordPool.restingState[workIdx].toFixed(6)}`);
        console.log(`Initial resting state for WORD: ${model.wordPool.restingState[wordIdx].toFixed(6)}`);
        console.log(`Initial resting state for WEAK: ${model.wordPool.restingState[weakIdx].toFixed(6)}`);
        console.log('');

        // Run for 20 steps
        for (let i = 0; i < 20; i++) {
            model.stepModel(workFeatures, true);

            const workAct = model.wordPool.state[workIdx];
            const wordAct = model.wordPool.state[wordIdx];
            const weakAct = model.wordPool.state[weakIdx];

            console.log(`Step ${i}: WORK=${workAct.toFixed(6)}, WORD=${wordAct.toFixed(6)}, WEAK=${weakAct.toFixed(6)}`);
        }

        // Check letter activations at step 10
        model.reset();
        console.log('\n=== Letter activations at step 10 ===');

        for (let i = 0; i < 10; i++) {
            model.stepModel(workFeatures, true);
        }

        const wIdx = 'w'.charCodeAt(0) - 'a'.charCodeAt(0);
        const oIdx = 'o'.charCodeAt(0) - 'a'.charCodeAt(0);
        const rIdx = 'r'.charCodeAt(0) - 'a'.charCodeAt(0);
        const kIdx = 'k'.charCodeAt(0) - 'a'.charCodeAt(0);

        console.log(`Position 0 - W: ${model.letterPools[0].state[wIdx].toFixed(6)}`);
        console.log(`Position 1 - O: ${model.letterPools[1].state[oIdx].toFixed(6)}`);
        console.log(`Position 2 - R: ${model.letterPools[2].state[rIdx].toFixed(6)}`);
        console.log(`Position 3 - K: ${model.letterPools[3].state[kIdx].toFixed(6)}`);

        // Basic sanity checks
        expect(model.wordPool.state[workIdx]).toBeGreaterThan(0);
    });

    test('compare net input computation', () => {
        const model = new InteractiveActivationModel();

        // Test first step of letter pool computation
        const workFeatures = [
            letters['w'],
            letters['o'],
            letters['r'],
            letters['k']
        ];

        model.reset();

        // Manually compute what the first step should be
        const pos0Features = workFeatures[0];
        const pos0Absence = pos0Features.map(f => 1 - f);
        const zeroWords = Array(model.wordList.length).fill(0);

        console.log('\n=== Step-by-step computation for position 0 ===');
        console.log('Features for W:', pos0Features);
        console.log('Absence features:', pos0Absence);
        console.log('Initial letter state:', model.letterPools[0].state.slice(0, 5));

        // Step the model
        model.letterPools[0].step([pos0Features, pos0Absence, zeroWords]);

        console.log('After step letter state:', model.letterPools[0].state.slice(0, 5));
        console.log('W activation (index 22):', model.letterPools[0].state[22]);

        expect(model.letterPools[0].state[22]).not.toBe(0);
    });
});
