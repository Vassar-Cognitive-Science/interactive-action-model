import { InteractiveActivationModel } from './src/core/IAModel.js';
import { letters } from './src/core/data.js';

const model = new InteractiveActivationModel();

const workFeatures = [
    letters['w'],
    letters['o'],
    letters['r'],
    letters['k']
];

const mask = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const maskInput = [mask, mask, mask, mask];

const workIdx = model.wordList.indexOf('work');
const maskStart = 20;

console.log('=== Testing mask timing (like SimulationRunner) ===\n');

for (let currentStep = 0; currentStep < 25; currentStep++) {
    // This is how SimulationRunner does it
    const input = currentStep < maskStart ? workFeatures : maskInput;

    console.log(`Step ${currentStep}: Using ${currentStep < maskStart ? 'STIMULUS' : 'MASK'}`);

    model.stepModel(input, true);

    const workAct = model.wordPool.state[workIdx];
    console.log(`  After step, WORK activation: ${workAct.toFixed(6)}`);
    console.log(`  This would be recorded at time=${currentStep}`);
    console.log();
}
