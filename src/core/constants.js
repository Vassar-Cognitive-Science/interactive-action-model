// Model parameters for Interactive Activation Model
// Loaded from model-config.json in project root
import config from '../../model-config.json';

export const FEATURE_LETTER_EXCITATION = config.parameters.featureLetterExcitation;
export const FEATURE_LETTER_INHIBITION = config.parameters.featureLetterInhibition;
export const LETTER_WORD_EXCITATION = config.parameters.letterWordExcitation;
export const LETTER_WORD_INHIBITION = config.parameters.letterWordInhibition;
export const WORD_LETTER_EXCITATION = config.parameters.wordLetterExcitation;
export const WORD_LETTER_INHIBITION = config.parameters.wordLetterInhibition;
export const WORD_WORD_INHIBITION = config.parameters.wordWordInhibition;
export const LETTER_LETTER_INHIBITION = config.parameters.letterLetterInhibition;
export const MIN_ACTIVATION = config.parameters.minActivation;
export const DECAY_RATE = config.parameters.decayRate;
export const REST_GAIN = config.parameters.restGain;

// Simulation defaults
export const DEFAULT_MAX_STEPS = config.simulation.maxSteps;
export const DEFAULT_MASK_ENABLED = config.simulation.maskEnabled;
export const DEFAULT_MASK_START = config.simulation.maskStart;
export const DEFAULT_SPEED = config.simulation.defaultSpeed;

// Mask stimulus (combination of O and X)
export const MASK = config.mask.features;
