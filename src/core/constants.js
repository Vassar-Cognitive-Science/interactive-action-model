// Model parameters for Interactive Activation Model
export const FEATURE_LETTER_EXCITATION = 0.005;
export const FEATURE_LETTER_INHIBITION = 0.15;
export const LETTER_WORD_EXCITATION = 0.07;
export const LETTER_WORD_INHIBITION = 0.04;
export const WORD_LETTER_EXCITATION = 0.3;
export const WORD_LETTER_INHIBITION = 0.0;
export const WORD_WORD_INHIBITION = 0.21;
export const LETTER_LETTER_INHIBITION = 0.0;
export const MIN_ACTIVATION = -0.2;
export const DECAY_RATE = 0.07;
export const REST_GAIN = 0.05;

// Mask stimulus (combination of O and X)
export const MASK = [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1];
