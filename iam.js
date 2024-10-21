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
        let inputSignal = new Array(this.size).fill(0);
        
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i] || !this.weights[i]) {
                console.error(`Invalid input or weight at index ${i}`);
                console.error('Input:', inputs[i]);
                console.error('Weight:', this.weights[i]);
                continue;
            }
            const clippedInput = inputs[i].map(v => Math.max(0, v));
            for (let j = 0; j < this.size; j++) {
                if (!this.weights[i][j]) {
                    console.error(`Invalid weight at index [${i}][${j}]`);
                    continue;
                }
                for (let k = 0; k < clippedInput.length; k++) {
                    if (this.weights[i][j][k] === undefined) {
                        console.error(`Invalid weight at index [${i}][${j}][${k}]`);
                        continue;
                    }
                    inputSignal[j] += clippedInput[k] * this.weights[i][j][k];
                }
            }
        }
    
        const clippedState = this.state.map(v => Math.max(0, v));
        const inhibitorySignal = this.inhibitoryWeights.map(row => 
            row.reduce((sum, weight, i) => sum + weight * clippedState[i], 0)
        );
    
        return inputSignal.map((val, i) => val + inhibitorySignal[i]);
    }

    computeEffect(netInput) {
        return netInput.map((input, i) => {
            if (input > 0) {
                return input * (this.maxValue - this.state[i]);
            } else {
                return input * (this.state[i] - this.minValue);
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
        ["WORK", -0.5],
        ["WORD", -0.6],
        ["WEAK", -0.7],
        ["WEAR", -0.65],
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
    console.log("Word list:", wordList);
    console.log("Word frequencies:", wordFrequencies);

    // Initialize letter layers
    lettersLayer = [];
    for (let i = 0; i < 4; i++) {
        const letterPool = new IAPool(26, null, params.DECAY_RATE, 0, 1, params.MIN_ACTIVATION, params.LETTER_LETTER_INHIBITION);
        letterPool.weights = [
            letters.map(l => l.map(f => f ? params.FEATURE_LETTER_EXCITATION : -params.FEATURE_LETTER_INHIBITION)),
            letters.map(l => l.map(f => f ? -params.FEATURE_LETTER_INHIBITION : params.FEATURE_LETTER_EXCITATION))
        ];
        lettersLayer.push(letterPool);
    }

    // Initialize word layer
    if (wordList.length === 0 || wordFrequencies.length === 0) {
        console.error("Word list or frequencies are empty. Make sure fetchWordList() is called before initializeModel().");
        return;
    }

    const restingState = wordFrequencies.map(freq => freq * params.REST_GAIN);
    wordsLayer = new IAPool(wordList.length, null, params.DECAY_RATE, restingState, 1, params.MIN_ACTIVATION, params.WORD_WORD_INHIBITION);

    // Create weight matrices
    const letterToWordWeights = createWeightMatrix(26, wordList.length, params.LETTER_WORD_EXCITATION, -params.LETTER_WORD_INHIBITION);
    const wordToLetterWeights = createWeightMatrix(wordList.length, 26, params.WORD_LETTER_EXCITATION, -params.WORD_LETTER_INHIBITION);

    // Set excitatory connections
    wordList.forEach((word, wordIndex) => {
        word.split('').forEach((letter, position) => {
            const letterIndex = letterToIndex[letter];
            if (letterIndex === undefined) {
                console.error(`Unknown letter "${letter}" in word "${word}"`);
                return;
            }
            letterToWordWeights[letterIndex][wordIndex] = params.LETTER_WORD_EXCITATION;
            wordToLetterWeights[wordIndex][letterIndex] = params.WORD_LETTER_EXCITATION;
        });
    });

    wordsLayer.weights = [letterToWordWeights];

    console.log("Model initialization complete");
    console.log("Letter layer weights:", lettersLayer.map(l => l.weights));
    console.log("Word layer weights:", wordsLayer.weights);
}

function runSimulation(inputWord) {
    console.log("Starting simulation with input:", inputWord);
    const params = getParameters();
    fetchWordList();  // Ensure this is called before initializeModel
    initializeModel(params);

    const activations = {
        letters: Array(4).fill().map(() => []),
        words: []
    };

    // Prepare input
    const input = inputWord.toUpperCase().padEnd(4, ' ').slice(0, 4).split('').map(char => {
        if (char === '?') {
            return [0,1,0,0,1,0,0,1,0,0,0,0,0,1]; // ambiguous R or K
        } else if (char === ' ') {
            return new Array(14).fill(0);
        } else {
            return letters[letterToIndex[char]] || new Array(14).fill(0);
        }
    });

    const inputAbsence = input.map(features => features.map(f => 1 - f));

    // Run simulation for 40 cycles
    for (let cycle = 0; cycle < 40; cycle++) {
        // Step through letter layers
        const letterStates = lettersLayer.map((layer, i) => 
            layer.step([input[i], inputAbsence[i]])
        );

        // Step through word layer
        const wordState = wordsLayer.step([letterStates.flat()]);

        // Record activations
        letterStates.forEach((state, i) => activations.letters[i].push(state));
        activations.words.push(wordState);
    }

    console.log("Simulation complete");
    return activations;
}

// UI Interaction
document.getElementById('run-simulation').addEventListener('click', async () => {
    const inputWord = document.getElementById('input-word').value;
    const activations = await runSimulation(inputWord);
    updateChart(activations);
});

// Chart initialization and update
let chart;

function initializeChart() {
    const ctx = document.getElementById('activation-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(40).fill().map((_, i) => i + 1),
            datasets: []
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Word Activations'
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Cycle'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Activation'
                    },
                    min: -0.2,
                    max: 1
                }
            }
        }
    });
}

function updateChart(activations) {
    const wordsToShow = ['WORK', 'WORD', 'WEAK', 'WEAR'];
    const colors = ['red', 'blue', 'green', 'purple'];

    chart.data.datasets = wordsToShow.map((word, index) => ({
        label: word,
        data: activations.words.map(state => state[wordList.indexOf(word)]),
        borderColor: colors[index],
        fill: false
    }));

    chart.update();
}

// Initialize the model and chart when the page loads
window.addEventListener('load', () => {
    initializeChart();
});