// Constants for model parameters
const FEATURE_LETTER_EXCITATION = 0.005;
const FEATURE_LETTER_INHIBITION = 0.15;
const LETTER_WORD_EXCITATION = 0.07;
const LETTER_WORD_INHIBITION = 0.04;
const WORD_LETTER_EXCITATION = 0.3;
const WORD_LETTER_INHIBITION = 0.0;
const WORD_WORD_INHIBITION = 0.21;
const LETTER_LETTER_INHIBITION = 0.0;
const MIN_ACTIVATION = -0.2;
const DECAY_RATE = 0.07;
const REST_GAIN = 0.05;

// Mask stimulus (combination of O and X)
const MASK = [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1];

// Letter feature definitions
const letters = {
    'a': [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'b': [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
    'c': [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'd': [1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
    'e': [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'f': [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'g': [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    'h': [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'i': [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    'j': [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'k': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    'l': [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'm': [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0],
    'n': [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
    'o': [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'p': [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    'q': [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1],
    'r': [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    's': [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    't': [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    'u': [0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0],
    'v': [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0],
    'w': [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1],
    'x': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    'y': [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
    'z': [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0]
};

// Helper function to create weight matrices
function createWeightMatrix(inputSize, outputSize, value) {
    return Array(inputSize).fill().map(() => Array(outputSize).fill(value));
}

class IAPool {
    constructor(size, weights = null, decayRate = 0.1, restingState = 0.0, maxValue = 1.0, minValue = -1.0, inhibitionStrength = 1.0) {
        this.size = size;
        this.decayRate = decayRate;
        this.maxValue = maxValue;
        this.minValue = minValue;
        this.inhibitionStrength = inhibitionStrength;
        this.weights = weights;
        
        if (typeof restingState === 'number') {
            this.restingState = Array(size).fill(restingState);
        } else {
            this.restingState = restingState;
        }
        
        // Initialize inhibitory weights
        this.inhibitoryWeights = Array(size).fill().map(() => 
            Array(size).fill(-inhibitionStrength));
        for(let i = 0; i < size; i++) {
            this.inhibitoryWeights[i][i] = 0;
        }
        
        this.state = [...this.restingState];
    }

    reset() {
        this.state = [...this.restingState];
    }

    computeNetInput(inputs) {
        // Calculate excitatory input
        let inputSignal = Array(this.size).fill(0);
        for(let i = 0; i < inputs.length; i++) {
            const clippedInput = inputs[i].map(v => Math.max(0, v));
            for(let j = 0; j < this.size; j++) {
                for(let k = 0; k < clippedInput.length; k++) {
                    inputSignal[j] += clippedInput[k] * this.weights[i][k][j];
                }
            }
        }

        // Calculate inhibitory input
        const clippedState = this.state.map(v => Math.max(0, v));
        const inhibitorySignal = this.inhibitoryWeights.map(row => 
            row.reduce((sum, weight, i) => sum + weight * clippedState[i], 0));

        return inputSignal.map((val, i) => val + inhibitorySignal[i]);
    }

    computeEffect(netInput) {
        return netInput.map((input, i) => {
            if(input > 0) {
                return input * (this.maxValue - this.state[i]);
            } else {
                return input * (this.state[i] - this.minValue);
            }
        });
    }

    computeActivation(effect) {
        const decay = this.state.map((s, i) => 
            this.decayRate * (s - this.restingState[i]));
        
        return this.state.map((s, i) => {
            const newActivation = s - decay[i] + effect[i];
            return Math.max(this.minValue, Math.min(this.maxValue, newActivation));
        });
    }

    step(inputs) {
        if(!this.weights) throw new Error("weights cannot be None");
        if(inputs.length !== this.weights.length) throw new Error("inputs must match weights");

        const netInput = this.computeNetInput(inputs);
        const effect = this.computeEffect(netInput);
        this.state = this.computeActivation(effect);
        return this.state;
    }
}

class InteractiveActivationModel {
    constructor() {
        // Initialize feature-to-letter weights
        this.featureToLetterWeights = this.initializeFeatureToLetterWeights();
        this.letterToWordWeights = this.initializeLetterWordWeights();
        this.wordToLetterWeights = this.initializeWordLetterWeights();
        
        // Initialize letter pools (one for each position)
        this.letterPools = Array(4).fill().map((_, i) => 
            new IAPool(26, [
                this.featureToLetterWeights, 
                this.getAbsenceWeights(this.featureToLetterWeights),
                this.wordToLetterWeights[i]
            ], DECAY_RATE, 0, 1.0, MIN_ACTIVATION, LETTER_LETTER_INHIBITION));
        
        // Initialize word pool with proper resting states
        const restingStates = this.initializeWordRestingStates();
        this.wordPool = new IAPool(
            1179, 
            this.letterToWordWeights, 
            DECAY_RATE, 
            restingStates, 
            1.0, 
            MIN_ACTIVATION, 
            WORD_WORD_INHIBITION
        );
    }

    // Create inverted weights for feature absence
    getAbsenceWeights(weights) {
        return weights.map(row => row.map(w => -w));
    }

    // Initialize feature-to-letter weight matrix
    initializeFeatureToLetterWeights() {
        const letterArray = Object.values(letters);
        const weights = Array(14).fill().map(() => Array(26).fill(0));
        
        for(let i = 0; i < letterArray.length; i++) {
            for(let j = 0; j < 14; j++) {
                weights[j][i] = letterArray[i][j] ? 
                    FEATURE_LETTER_EXCITATION : 
                    -FEATURE_LETTER_INHIBITION;
            }
        }
        return weights;
    }

    // Initialize letter-to-word weights for all 4 positions
    initializeLetterWordWeights() {
        const weights = Array(4).fill().map(() => 
            Array(26).fill().map(() => Array(1179).fill(-LETTER_WORD_INHIBITION))
        );
        
        // Set excitatory connections based on word list
        this.getWordList().forEach((word, wordIndex) => {
            for(let pos = 0; pos < 4; pos++) {
                const letterIndex = this.letterToIndex(word[pos]);
                weights[pos][letterIndex][wordIndex] = LETTER_WORD_EXCITATION;
            }
        });
        
        return weights;
    }

    // Initialize word-to-letter weights
    initializeWordLetterWeights() {
        const weights = Array(4).fill().map(() => 
            Array(1179).fill().map(() => Array(26).fill(-WORD_LETTER_INHIBITION))
        );

        // Set excitatory connections based on word list
        this.getWordList().forEach((word, wordIndex) => {
            for(let pos = 0; pos < 4; pos++) {
                const letterIndex = this.letterToIndex(word[pos]);
                weights[pos][wordIndex][letterIndex] = WORD_LETTER_EXCITATION;
            }
        });

        return weights;
    }

    // Initialize resting states for words based on frequency
    initializeWordRestingStates() {
        // For demo, using placeholder frequencies
        // In real implementation, these would come from word frequency data
        return Array(1179).fill().map(() => 
            -0.1 - Math.random() * 0.4); // Random values between -0.1 and -0.5
    }

    // Helper to convert letter to index
    letterToIndex(letter) {
        return letter.charCodeAt(0) - 'a'.charCodeAt(0);
    }

    // Helper to get word list (placeholder implementation)
    getWordList() {
        return [
            'have', 'gave', 'save', 'male', 'move', 'work', 'word', 'weak', 'wear'
            // ... would contain all 1179 four-letter words
        ];
    }

    stepModel(inputFeatures, wordLayer = true) {
        const letterStates = this.letterPools.map(pool => [...pool.state]);
        const wordState = wordLayer ? [...this.wordPool.state] : Array(1179).fill(0);
        
        // Update letter pools
        this.letterPools.forEach((pool, i) => {
            const input = [
                inputFeatures[i], 
                this.getAbsenceWeights([inputFeatures[i]])[0], 
                wordState
            ];
            pool.step(input);
        });
        
        // Update word pool if enabled
        if(wordLayer) {
            this.wordPool.step(letterStates);
        }
    }

    runTrial(stimulus, maskDuration, targetIndices, enableWordLayer = true) {
        const activations = targetIndices.map(() => []);
        
        // Reset state
        this.letterPools.forEach(pool => pool.reset());
        this.wordPool.reset();
        
        // Run simulation for specified duration
        for(let t = 0; t < maskDuration; t++) {
            if(t < 20) {
                this.stepModel(stimulus, enableWordLayer);
            } else {
                this.stepModel([MASK, MASK, MASK, MASK], enableWordLayer);
            }
            
            targetIndices.forEach((index, i) => {
                activations[i].push(enableWordLayer ? 
                    this.wordPool.state[index] : 
                    this.letterPools[index >> 8].state[index & 0xFF]);
            });
        }
        
        return activations;
    }

    // Core experiment implementations
    runReadVsE() {
        const readFeatures = ['r','e','a','d'].map(c => letters[c]);
        const blankFeatures = Array(14).fill(0);
        
        // Run READ condition
        const eInReadActivation = this.runTrial(
            readFeatures,
            40,
            [0x0104], // E in second position 
            true
        )[0];
        
        // Run E alone condition
        const features = [blankFeatures, letters['e'], blankFeatures, blankFeatures];
        const eAloneActivation = this.runTrial(
            features,
            40,
            [0x0104], // E in second position
            false  
        )[0];

        return {
            data: [eInReadActivation, eAloneActivation],
            labels: ['E in READ', 'E alone']
        };
    }

    runMaveVsE() {
        const maveFeatures = ['m','a','v','e'].map(c => letters[c]);
        const blankFeatures = Array(14).fill(0);
        
        // Run MAVE condition
        const eInMaveActivation = this.runTrial(
            maveFeatures,
            40,
            [0x0304], // E in fourth position
            true
        )[0];
        
        // Run E alone condition
        const features = [blankFeatures, blankFeatures, blankFeatures, letters['e']];
        const eAloneActivation = this.runTrial(
            features,
            40,
            [0x0304], // E in fourth position
            false
        )[0];

        return {
            data: [eInMaveActivation, eAloneActivation],
            labels: ['E in MAVE', 'E alone']
        };
    }

    runRichGetRicher() {
        const maveFeatures = ['m','a','v','e'].map(c => letters[c]);
        const wordIndices = ['have', 'gave', 'save'].map(w => 
            this.getWordList().indexOf(w));
            
        const activations = this.runTrial(
            maveFeatures,
            40,
            wordIndices,
            true
        );

        return {
            data: activations,
            labels: ['HAVE', 'GAVE', 'SAVE']
        };
    }

    runGangEffect() {
        const maveFeatures = ['m','a','v','e'].map(c => letters[c]);
        const wordIndices = ['male', 'move', 'save'].map(w => 
            this.getWordList().indexOf(w));
            
        const activations = this.runTrial(
            maveFeatures,
            40,
            wordIndices,
            true
        );

        return {
            data: activations,
            labels: ['MALE', 'MOVE', 'SAVE']
        };
    }
}