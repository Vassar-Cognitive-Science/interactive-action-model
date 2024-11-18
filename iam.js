class IAPool {
    constructor(size, weights = null, decayRate = 0.1, restingState = 0.0, maxValue = 1.0, minValue = -1.0, inhibitionStrength = 1.0) {
        this.size = size;
        this.decayRate = decayRate;
        this.maxValue = maxValue;
        this.minValue = minValue;
        this.inhibitionStrength = inhibitionStrength;
        this.weights = weights;

        this.restingState = Array.isArray(restingState) ? restingState : Array(size).fill(restingState);
        this.inhibitoryWeights = Array(size).fill().map(() => 
            Array(size).fill(-inhibitionStrength).map((val, i, arr) => i === arr.indexOf(val) ? 0 : val)
        );

        this.state = [...this.restingState];
    }

    reset() {
        this.state = [...this.restingState];
    }

    computeNetInput(inputs) {
        if (!Array.isArray(inputs) || !Array.isArray(this.weights) || 
            inputs.length !== this.weights.length) {
            console.error("Invalid inputs or weights", {inputs, weights: this.weights});
            return new Array(this.size).fill(0);
        }
    
        const inputSignal = new Array(this.size).fill(0);
        
        // Process each input source
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const weights = this.weights[i];
            
            if (!Array.isArray(input) || !Array.isArray(weights)) {
                console.error(`Invalid input or weight matrix at index ${i}`);
                continue;
            }
    
            // Clip negative inputs to 0
            const clippedInput = input.map(v => Math.max(0, v));
            
            // Compute dot product for this input source
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < clippedInput.length; k++) {
                    if (weights[k] && typeof weights[k][j] === 'number') {
                        inputSignal[j] += clippedInput[k] * weights[k][j];
                    }
                }
            }
        }
    
        // Compute inhibitory signal within the pool
        const clippedState = this.state.map(v => Math.max(0, v));
        const inhibitorySignal = this.inhibitoryWeights.map((row, i) => 
            row.reduce((sum, weight, j) => sum + weight * clippedState[j], 0)
        );
    
        return inputSignal.map((val, i) => val + inhibitorySignal[i]);
    }

    computeEffect(netInput) {
        return netInput.map((input, i) => {
            const currentState = this.state[i];
            if (input > 0) {
                // Enhanced excitation for positive inputs
                return input * (this.maxValue - currentState) * 1.5;
            } else {
                // Enhanced inhibition for negative inputs
                return input * (currentState - this.minValue) * 2.0;
            }
        });
    }

    computeActivation(effect) {
        const decay = this.state.map((s, i) => this.decayRate * (s - this.restingState[i]));
        return this.state.map((s, i) => 
            Math.min(this.maxValue, Math.max(this.minValue, s - decay[i] + effect[i]))
        );
    }

    step(inputs) {
        if (!this.weights) {
            throw new Error("Weights cannot be null");
        }
        if (inputs.length !== this.weights.length) {
            console.error("Inputs:", inputs);
            console.error("Weights length:", this.weights.length);
            throw new Error(`Inputs must have the same number of top-level items as weights (${inputs.length} vs ${this.weights.length})`);
        }
    
        const netInput = this.computeNetInput(inputs);
        const effect = this.computeEffect(netInput);
        this.state = this.computeActivation(effect);
    
        return this.state;
    }
}

// Model setup
const letters = [
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], // A
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0], // B
    [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], // C
    [1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0], // D
    [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], // E
    [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], // F
    [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0], // G
    [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], // H
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], // I
    [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0], // J
    [0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], // K
    [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], // L
    [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0], // M
    [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0], // N
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // O
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0], // P
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // Q
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1], // R
    [1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0], // S
    [1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], // T
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // U
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1], // V
    [0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0], // W
    [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1], // X
    [0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1], // Y
    [1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1]  // Z
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const letterToIndex = Object.fromEntries([
    ...alphabet.split('').map((letter, index) => [letter, index]),
    ...alphabet.toLowerCase().split('').map((letter, index) => [letter, index])
]);

let wordList = [];
let wordFrequencies = [];

// Initialize model components
let lettersLayer = [];
let wordsLayer;

function getParameters() {
    return {
        FEATURE_LETTER_EXCITATION: parseFloat(document.getElementById('feature-letter-excitation').value),
        FEATURE_LETTER_INHIBITION: parseFloat(document.getElementById('feature-letter-inhibition').value),
        LETTER_WORD_EXCITATION: parseFloat(document.getElementById('letter-word-excitation').value),
        LETTER_WORD_INHIBITION: parseFloat(document.getElementById('letter-word-inhibition').value),
        WORD_LETTER_EXCITATION: parseFloat(document.getElementById('word-letter-excitation').value),
        WORD_LETTER_INHIBITION: parseFloat(document.getElementById('word-letter-inhibition').value),
        WORD_WORD_INHIBITION: parseFloat(document.getElementById('word-word-inhibition').value),
        LETTER_LETTER_INHIBITION: parseFloat(document.getElementById('letter-letter-inhibition').value),
        MIN_ACTIVATION: parseFloat(document.getElementById('min-activation').value),
        DECAY_RATE: parseFloat(document.getElementById('decay-rate').value),
        REST_GAIN: parseFloat(document.getElementById('rest-gain').value)
    };
}

/*
async function fetchWordList() {
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://docs.google.com/spreadsheets/d/e/2PACX-1vRFeSK1vBTykGB_YxxYxbZOvaSZZRgyWMPCXZ938PqhjvW8luo3dVW2wvyLlfqdJoiaskMNP86SL-LJ/pub?gid=0&single=true&output=csv');
    const data = await response.text();
    const rows = data.split('\n').slice(1); // Skip header row
    wordList = [];
    wordFrequencies = [];
    rows.forEach(row => {
        const [word, frequency] = row.split(',');
        wordList.push(word);
        wordFrequencies.push(parseFloat(frequency));
    });
}
*/

function fetchWordList() {
    // Hardcoded subset of words for testing
    const wordData = [
        ["WORK", -0.3],  // Made more frequent
        ["WORD", -0.35], 
        ["WEAK", -0.45],
        ["WEAR", -0.45],
        ["MADE", -0.55],
        ["MAKE", -0.5],
        ["TAKE", -0.45],
        ["TIME", -0.4],
        ["COME", -0.5],
        ["SOME", -0.55]
    ];
    
    wordList = wordData.map(([word, _]) => word);
    wordFrequencies = wordData.map(([_, freq]) => freq);
    console.log("Fetched word list:", wordList);
    console.log("Fetched word frequencies:", wordFrequencies);
}

function createWeightMatrix(fromSize, toSize, excitation, inhibition) {
    return Array(fromSize).fill().map(() => 
        Array(toSize).fill(inhibition)
    );
}

function initializeModel(params) {
    console.log("Initializing model with params:", params);
    
    // Initialize letter layers
    lettersLayer = [];
    for (let i = 0; i < 4; i++) {
        // Create the letter pool
        const letterPool = new IAPool(26, null, params.DECAY_RATE, 0, 1, params.MIN_ACTIVATION, params.LETTER_LETTER_INHIBITION);
        
        // Create feature-to-letter weight matrices
        const featurePresentWeights = Array(14).fill().map(() => Array(26).fill(0));
        const featureAbsentWeights = Array(14).fill().map(() => Array(26).fill(0));
        
        // Fill in the feature weights
        letters.forEach((letterFeatures, letterIdx) => {
            letterFeatures.forEach((feature, featureIdx) => {
                featurePresentWeights[featureIdx][letterIdx] = feature ? 
                    params.FEATURE_LETTER_EXCITATION : -params.FEATURE_LETTER_INHIBITION;
                featureAbsentWeights[featureIdx][letterIdx] = feature ? 
                    -params.FEATURE_LETTER_INHIBITION : params.FEATURE_LETTER_EXCITATION;
            });
        });

        // Create word-to-letter weight matrix for this position
        const wordToLetterWeights = Array(wordList.length).fill().map(() => Array(26).fill(-params.WORD_LETTER_INHIBITION));
        
        // Set excitatory connections from words to letters
        wordList.forEach((word, wordIdx) => {
            if (word[i]) {
                const letterIdx = letterToIndex[word[i].toUpperCase()];
                if (letterIdx !== undefined) {
                    wordToLetterWeights[wordIdx][letterIdx] = params.WORD_LETTER_EXCITATION;
                }
            }
        });

        letterPool.weights = [featurePresentWeights, featureAbsentWeights, wordToLetterWeights];
        lettersLayer.push(letterPool);
    }

    // Initialize word layer with resting states
    const restingState = wordFrequencies.map(freq => freq * params.REST_GAIN);
    wordsLayer = new IAPool(wordList.length, null, params.DECAY_RATE, restingState, 1, 
        params.MIN_ACTIVATION, params.WORD_WORD_INHIBITION);

    // Create letter-to-word weight matrices
    const letterToWordWeights = Array(4).fill().map(() => 
        Array(26).fill().map(() => Array(wordList.length).fill(-params.LETTER_WORD_INHIBITION))
    );

    // Set excitatory connections from letters to words
    wordList.forEach((word, wordIdx) => {
        word.toUpperCase().split('').forEach((letter, pos) => {
            if (pos < 4) {
                const letterIdx = letterToIndex[letter];
                if (letterIdx !== undefined) {
                    letterToWordWeights[pos][letterIdx][wordIdx] = params.LETTER_WORD_EXCITATION;
                }
            }
        });
    });

    wordsLayer.weights = letterToWordWeights;

    console.log("Model initialization complete");
}

function runSimulation(inputWord) {
    console.log("Starting simulation with input:", inputWord);
    
    // Re-initialize model
    const params = getParameters();
    initializeModel(params);
    
    const activations = {
        letters: Array(4).fill().map(() => []),
        words: []
    };

    // Create input features for each position
    const inputFeatures = inputWord.toUpperCase().padEnd(4, ' ').split('').map((char, pos) => {
        const features = new Array(14).fill(0);
        if (char === '?') {
            // Ambiguous R/K input
            [1, 4, 7].forEach(idx => features[idx] = 1); // Common features
        } else if (char !== ' ') {
            const letterIdx = letterToIndex[char];
            if (letterIdx !== undefined) {
                letters[letterIdx].forEach((val, idx) => features[idx] = val);
            }
        }
        return features;
    });

    // Create absence features
    const absenceFeatures = inputFeatures.map(features => 
        features.map(f => 1 - f)
    );

    // Reset all layers before running simulation
    lettersLayer.forEach(layer => layer.reset());
    wordsLayer.reset();

    // Run 40 cycles
    for (let cycle = 0; cycle < 40; cycle++) {
        const letterStates = lettersLayer.map(layer => [...layer.state]);
        const wordState = [...wordsLayer.state];

        lettersLayer.forEach((layer, pos) => {
            layer.step([inputFeatures[pos], absenceFeatures[pos], wordState]);
            activations.letters[pos].push([...layer.state]);
        });

        wordsLayer.step(letterStates);
        activations.words.push([...wordsLayer.state]);
    }

    return activations;
}

document.getElementById('run-simulation').addEventListener('click', () => {
    const inputWord = document.getElementById('input-word').value;
    if (!wordList || wordList.length === 0) {
        console.error("Word list not loaded yet");
        alert("Please wait for word list to load");
        return;
    }
    try {
        const activations = runSimulation(inputWord);
        updateChart(activations);
    } catch (error) {
        console.error("Error running simulation:", error);
        alert("Error running simulation. Please check console for details.");
    }
});

// Chart initialization and update
let chart;

function initializeChart() {
    const ctx = document.getElementById('activation-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(40).fill().map((_, i) => i),
            datasets: []
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Word Activations'
                },
                legend: {
                    position: 'right'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Processing Cycles'
                    },
                    min: 0,
                    max: 40,
                    ticks: {
                        stepSize: 10
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Activation'
                    },
                    min: -0.4,
                    max: 0.8,
                    ticks: {
                        stepSize: 0.2
                    }
                }
            }
        }
    });
}

function updateChart(activations) {
  const wordsToShow = ['WORK', 'WORD', 'WEAK', 'WEAR'];
  const colors = ['#CBC3E3', '#ff0000', '#ADD8E6', '#013220'];
  const styles = ['solid', 'dashed', 'solid', 'solid'];

  chart.data.datasets = wordsToShow.map((word, index) => ({
    label: word,
    data: activations.words.map(state => state[wordList.indexOf(word)]),
    borderColor: colors[index],
    borderDash: styles[index] === 'dashed' ? [5, 5] : [],
    borderWidth: 2,
    fill: false,
    tension: 0.3
  }));

  chart.update();
}

window.addEventListener('load', () => {
    fetchWordList(); 
    initializeModel(getParameters()); 
    initializeChart(); 
});