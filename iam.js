//Existing IAPool class and model parameters remain the same
class IAPool {
    constructor(size, weights = null, decay_rate = 0.1, resting_state = 0.0, 
                max_value = 1.0, min_value = -1.0, inhibition_strength = 1.0) {
        this.size = size;
        this.decay_rate = decay_rate;
        this.max_value = max_value;
        this.min_value = min_value;
        this.inhibition_strength = inhibition_strength;
        this.weights = weights;

        // Initialize resting state
        if (typeof resting_state === 'number') {
            this.resting_state = new Array(size).fill(resting_state);
        } else {
            this.resting_state = resting_state;
        }

        // Initialize inhibitory weights
        this.inhibitory_weights = Array(size).fill().map(() => 
            Array(size).fill(-inhibition_strength).map((val, i, arr) => 
                i === arr.indexOf(val) ? 0 : val));

        // Initialize state
        this.state = [...this.resting_state];
    }

    // Previous methods remain the same
    reset() {
        this.state = [...this.resting_state];
    }

    computeNetInput(inputs) {
        if (!Array.isArray(inputs) || !Array.isArray(this.weights) || 
            inputs.length !== this.weights.length) {
            console.error("Invalid inputs or weights", {inputs, weights: this.weights});
            return new Array(this.size).fill(0);
        }
    
        const input_signal = new Array(this.size).fill(0);
        
        // Process each input source
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const weights = this.weights[i];
            
            if (!Array.isArray(input) || !Array.isArray(weights)) {
                console.error(`Invalid input or weight matrix at index ${i}`);
                continue;
            }
    
            // Clip negative inputs to 0
            const clipped_input = input.map(v => Math.max(0, v));
            
            // Compute dot product for this input source
            for (let j = 0; j < clipped_input.length; j++) {
                if (weights[j]) {
                    for (let k = 0; k < this.size; k++) {
                        if (typeof weights[j][k] === 'number') {
                            input_signal[k] += clipped_input[j] * weights[j][k];
                        }
                    }
                }
            }
        }
    
        // Compute inhibitory signal
        const clipped_state = this.state.map(v => Math.max(0, v));
        const inhibitory_signal = this.inhibitory_weights.map((row, i) => 
            row.reduce((sum, weight, j) => sum + weight * clipped_state[j], 0)
        );
    
        return input_signal.map((val, i) => val + inhibitory_signal[i]);
    }

    computeEffect(netInput) {
        return netInput.map((input, i) => {
            if (input > 0) {
                return input * (this.max_value - this.state[i]);
            } else {
                return input * (this.state[i] - this.min_value);
            }
        });
    }

    computeActivation(effect) {
        const decay = this.state.map((s, i) => 
            this.decay_rate * (s - this.resting_state[i]));

        return this.state.map((s, i) => {
            const new_activation = s - decay[i] + effect[i];
            return Math.min(this.max_value, Math.max(this.min_value, new_activation));
        });
    }

    step(inputs) {
        if (!this.weights) {
            throw new Error("Weights cannot be null");
        }
        if (inputs.length !== this.weights.length) {
            throw new Error("Inputs must have same number of items as weights");
        }

        const net_input = this.computeNetInput(inputs);
        const effect = this.computeEffect(net_input);
        this.state = this.computeActivation(effect);
        return this.state;
    }
}

// Initialize model and word data
let wordData = null;
let model = null;
let chart = null;

// Fetch and process word list
async function loadWordData() {
    const WORD_LIST_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFeSK1vBTykGB_YxxYxbZOvaSZZRgyWMPCXZ938PqhjvW8luo3dVW2wvyLlfqdJoiaskMNP86SL-LJ/pub?gid=0&single=true&output=csv";
    
    try {
        const response = await fetch(WORD_LIST_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                wordData = results.data;
                document.getElementById('run-simulation').disabled = false;
                initializeModel();
            }
        });
    } catch (error) {
        console.error('Error loading word data:', error);
    }
}

function initializeModel() {
    const params = getParameters();
    // Initialize letter and word layers here...
}

function runExperiment(experimentType, input = null) {
    if (!wordData) {
        console.error("Word data not loaded");
        return;
    }

    let data = [];
    let cycles = 40;

    switch(experimentType) {
        case 'demo':
            return runDemoExperiment();
        case 'single-letter':
            return runLetterWordExperiment();
        case 'gang-effect':
            return runGangEffectExperiment();
        case 'rich-richer':
            return runRichGetRicherExperiment();
        default:
            console.error('Unknown experiment type');
            return null;
    }
}

function runDemoExperiment() {
    // Implementation of WORK demo with ambiguous final letter
    const model = initializeModel();
    const input = 'WOR?';
    // Simulation code...
}

function runLetterWordExperiment() {
    // Implementation of single letter vs letter in word experiment
    const letterInput = 'E';
    const wordInput = 'READ';
    // Simulation code...
}

function runGangEffectExperiment() {
    // Implementation of gang effect with MAVE input
    const input = 'MAVE';
    // Simulation code...
}

function runRichGetRicherExperiment() {
    // Implementation of rich-get-richer effect
    const input = 'MAVE';
    // Simulation code...
}

// UI Event Handlers
document.getElementById('run-simulation').addEventListener('click', () => {
    const experimentType = document.getElementById('experiment-select').value;
    const results = runExperiment(experimentType);
    updateVisualization(results);
});

// Initialization
window.addEventListener('load', () => {
    loadWordData();
    initializeChart();
});

function initializeChart() {
    const ctx = document.getElementById('activation-chart');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: []
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Processing Cycles'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Activation'
                    },
                    min: -0.4,
                    max: 0.8
                }
            }
        }
    });
}

function updateVisualization(data) {
    // Update chart with new data
    if (!data || !chart) return;

    chart.data.labels = Array(data[0].activations.length).fill().map((_, i) => i);
    chart.data.datasets = data.map(series => ({
        label: series.label,
        data: series.activations,
        borderColor: series.color,
        fill: false
    }));
    
    chart.update();
}