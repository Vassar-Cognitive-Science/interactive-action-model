/**
 * Interactive Activation Pool
 *
 * Represents a pool of processing units that interact through excitatory
 * and inhibitory connections. Each pool maintains activation states and
 * updates them based on incoming signals.
 */
export class IAPool {
    /**
     * @param {number} size - Number of units in the pool
     * @param {Array<Array<Array<number>>>|null} weights - Input weight matrices
     * @param {number} decayRate - Rate of decay toward resting state
     * @param {number|Array<number>} restingState - Resting activation level(s)
     * @param {number} maxValue - Maximum activation value
     * @param {number} minValue - Minimum activation value
     * @param {number} inhibitionStrength - Strength of lateral inhibition
     */
    constructor(
        size,
        weights = null,
        decayRate = 0.1,
        restingState = 0.0,
        maxValue = 1.0,
        minValue = -1.0,
        inhibitionStrength = 1.0
    ) {
        this.size = size;
        this.decayRate = decayRate;
        this.maxValue = maxValue;
        this.minValue = minValue;
        this.inhibitionStrength = inhibitionStrength;
        this.weights = weights;

        // Handle scalar or array resting state
        if (typeof restingState === 'number') {
            this.restingState = Array(size).fill(restingState);
        } else {
            this.restingState = restingState;
        }

        // Initialize lateral inhibitory weights
        this.inhibitoryWeights = this.createInhibitoryWeights();

        // Initialize current state to resting state
        this.state = [...this.restingState];
    }

    /**
     * Create lateral inhibitory weight matrix
     * Each unit inhibits all other units but not itself
     */
    createInhibitoryWeights() {
        const weights = Array(this.size).fill().map(() =>
            Array(this.size).fill(-this.inhibitionStrength)
        );

        // No self-inhibition
        for (let i = 0; i < this.size; i++) {
            weights[i][i] = 0;
        }

        return weights;
    }

    /**
     * Reset pool to resting state
     */
    reset() {
        this.state = [...this.restingState];
    }

    /**
     * Compute net input from external sources and lateral inhibition
     * @param {Array<Array<number>>} inputs - Array of input signals
     * @returns {Array<number>} Net input to each unit
     */
    computeNetInput(inputs) {
        // Calculate excitatory input from external sources
        const inputSignal = Array(this.size).fill(0);

        for (let i = 0; i < inputs.length; i++) {
            // Only positive activations contribute to excitation
            const clippedInput = inputs[i].map(v => Math.max(0, v));

            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < clippedInput.length; k++) {
                    inputSignal[j] += clippedInput[k] * this.weights[i][k][j];
                }
            }
        }

        // Calculate lateral inhibitory input
        const clippedState = this.state.map(v => Math.max(0, v));
        const inhibitorySignal = this.inhibitoryWeights.map(row =>
            row.reduce((sum, weight, i) => sum + weight * clippedState[i], 0)
        );

        // Combine excitatory and inhibitory inputs
        return inputSignal.map((val, i) => val + inhibitorySignal[i]);
    }

    /**
     * Compute effect of net input on activation
     * Uses asymmetric update rule based on current activation
     * @param {Array<number>} netInput - Net input to each unit
     * @returns {Array<number>} Effect on activation
     */
    computeEffect(netInput) {
        return netInput.map((input, i) => {
            if (input > 0) {
                // Excitatory input: effect proportional to distance from max
                return input * (this.maxValue - this.state[i]);
            } else {
                // Inhibitory input: effect proportional to distance from min
                return input * (this.state[i] - this.minValue);
            }
        });
    }

    /**
     * Compute new activation levels
     * Combines decay toward resting state with effects of net input
     * @param {Array<number>} effect - Effect of net input
     * @returns {Array<number>} New activation levels
     */
    computeActivation(effect) {
        const decay = this.state.map((s, i) =>
            this.decayRate * (s - this.restingState[i])
        );

        return this.state.map((s, i) => {
            const newActivation = s - decay[i] + effect[i];
            // Clip to min/max bounds
            return Math.max(this.minValue, Math.min(this.maxValue, newActivation));
        });
    }

    /**
     * Perform one step of activation update
     * @param {Array<Array<number>>} inputs - Array of input signals
     * @returns {Array<number>} New activation state
     */
    step(inputs) {
        if (!this.weights) {
            throw new Error("Weights cannot be null");
        }
        if (inputs.length !== this.weights.length) {
            throw new Error(`Input count (${inputs.length}) must match weight count (${this.weights.length})`);
        }

        const netInput = this.computeNetInput(inputs);
        const effect = this.computeEffect(netInput);
        this.state = this.computeActivation(effect);

        return this.state;
    }

    /**
     * Get current activation state
     * @returns {Array<number>} Current activation levels
     */
    getState() {
        return [...this.state];
    }

    /**
     * Get top N most active units
     * @param {number} n - Number of top units to return
     * @returns {Array<{index: number, activation: number}>}
     */
    getTopN(n) {
        return this.state
            .map((activation, index) => ({ index, activation }))
            .sort((a, b) => b.activation - a.activation)
            .slice(0, n);
    }
}
