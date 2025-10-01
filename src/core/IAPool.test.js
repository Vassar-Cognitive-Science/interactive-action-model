import { describe, it, expect, beforeEach } from 'vitest';
import { IAPool } from './IAPool.js';

describe('IAPool', () => {
    describe('constructor', () => {
        it('should initialize with correct size', () => {
            const pool = new IAPool(10);
            expect(pool.size).toBe(10);
            expect(pool.state.length).toBe(10);
        });

        it('should initialize with scalar resting state', () => {
            const pool = new IAPool(5, null, 0.1, 0.5);
            expect(pool.restingState).toEqual([0.5, 0.5, 0.5, 0.5, 0.5]);
            expect(pool.state).toEqual([0.5, 0.5, 0.5, 0.5, 0.5]);
        });

        it('should initialize with array resting state', () => {
            const resting = [0.1, 0.2, 0.3];
            const pool = new IAPool(3, null, 0.1, resting);
            expect(pool.restingState).toEqual(resting);
            expect(pool.state).toEqual(resting);
        });

        it('should create inhibitory weights with no self-inhibition', () => {
            const pool = new IAPool(3, null, 0.1, 0.0, 1.0, -1.0, 0.5);
            expect(pool.inhibitoryWeights[0][0]).toBe(0);
            expect(pool.inhibitoryWeights[1][1]).toBe(0);
            expect(pool.inhibitoryWeights[2][2]).toBe(0);
            expect(pool.inhibitoryWeights[0][1]).toBe(-0.5);
            expect(pool.inhibitoryWeights[1][0]).toBe(-0.5);
        });
    });

    describe('reset', () => {
        it('should reset state to resting state', () => {
            const pool = new IAPool(3, null, 0.1, 0.0);
            pool.state = [0.5, 0.6, 0.7];
            pool.reset();
            expect(pool.state).toEqual([0.0, 0.0, 0.0]);
        });
    });

    describe('computeEffect', () => {
        it('should compute positive effect correctly', () => {
            const pool = new IAPool(2, null, 0.1, 0.0, 1.0, -1.0);
            pool.state = [0.5, 0.5];
            const netInput = [0.2, 0.3];
            const effect = pool.computeEffect(netInput);
            // Positive input: effect = input * (max - state)
            expect(effect[0]).toBeCloseTo(0.2 * (1.0 - 0.5));
            expect(effect[1]).toBeCloseTo(0.3 * (1.0 - 0.5));
        });

        it('should compute negative effect correctly', () => {
            const pool = new IAPool(2, null, 0.1, 0.0, 1.0, -1.0);
            pool.state = [0.5, 0.5];
            const netInput = [-0.2, -0.3];
            const effect = pool.computeEffect(netInput);
            // Negative input: effect = input * (state - min)
            expect(effect[0]).toBeCloseTo(-0.2 * (0.5 - (-1.0)));
            expect(effect[1]).toBeCloseTo(-0.3 * (0.5 - (-1.0)));
        });
    });

    describe('computeActivation', () => {
        it('should apply decay toward resting state', () => {
            const pool = new IAPool(2, null, 0.1, 0.0);
            pool.state = [0.5, -0.3];
            const effect = [0, 0]; // No external input
            const newState = pool.computeActivation(effect);
            // New = state - decay * (state - resting) + effect
            // decay = 0.1 * (0.5 - 0) = 0.05
            expect(newState[0]).toBeCloseTo(0.5 - 0.05);
            expect(newState[1]).toBeCloseTo(-0.3 - 0.1 * (-0.3));
        });

        it('should clip activation to bounds', () => {
            const pool = new IAPool(2, null, 0.0, 0.0, 1.0, -1.0);
            pool.state = [0.9, -0.9];
            const effect = [0.5, -0.5];
            const newState = pool.computeActivation(effect);
            expect(newState[0]).toBe(1.0); // Clipped to max
            expect(newState[1]).toBe(-1.0); // Clipped to min
        });
    });

    describe('step', () => {
        it('should throw error if weights are null', () => {
            const pool = new IAPool(2);
            expect(() => pool.step([[0.5, 0.5]])).toThrow('Weights cannot be null');
        });

        it('should throw error if input count does not match weights', () => {
            const weights = [
                [[0.5, 0.5], [0.5, 0.5]]
            ];
            const pool = new IAPool(2, weights);
            expect(() => pool.step([[0.5, 0.5], [0.5, 0.5]])).toThrow();
        });

        it('should update state based on inputs', () => {
            // Simple 2-unit pool with identity-like weights
            const weights = [
                [[1.0, 0.0], [0.0, 1.0]]
            ];
            const pool = new IAPool(2, weights, 0.0, 0.0, 1.0, -1.0, 0.0);
            const input = [[0.5, 0.3]];
            const newState = pool.step(input);
            // With no decay and no inhibition, state should increase
            expect(newState[0]).toBeGreaterThan(0);
            expect(newState[1]).toBeGreaterThan(0);
        });
    });

    describe('getState', () => {
        it('should return copy of current state', () => {
            const pool = new IAPool(3, null, 0.1, 0.0);
            pool.state = [0.1, 0.2, 0.3];
            const state = pool.getState();
            expect(state).toEqual([0.1, 0.2, 0.3]);
            // Verify it's a copy
            state[0] = 0.9;
            expect(pool.state[0]).toBe(0.1);
        });
    });

    describe('getTopN', () => {
        it('should return top N units by activation', () => {
            const pool = new IAPool(5);
            pool.state = [0.1, 0.5, 0.3, 0.9, 0.2];
            const top3 = pool.getTopN(3);
            expect(top3).toHaveLength(3);
            expect(top3[0].index).toBe(3);
            expect(top3[0].activation).toBe(0.9);
            expect(top3[1].index).toBe(1);
            expect(top3[1].activation).toBe(0.5);
            expect(top3[2].index).toBe(2);
            expect(top3[2].activation).toBe(0.3);
        });
    });
});
