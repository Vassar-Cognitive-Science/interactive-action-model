import numpy as np
import pandas as pd

# Copy the core functions from iam-python-ref.py
def compute_net_input(list_of_inputs, list_of_excitatory_weights, inhibition_strength, current_activation):
    num_units = len(current_activation)
    input_signal = np.zeros(num_units)

    for i in range(len(list_of_inputs)):
        clipped_input = np.clip(list_of_inputs[i], 0, None)
        input_signal += np.dot(clipped_input, list_of_excitatory_weights[i])

    clipped_state = np.clip(current_activation, 0, None)
    inhibitory_weights = np.full((num_units, num_units), -inhibition_strength)
    np.fill_diagonal(inhibitory_weights, 0)
    inhibitory_signal = np.dot(clipped_state, inhibitory_weights)

    total_input = input_signal + inhibitory_signal
    return total_input

def compute_effect(net_input, current_activation, min_value, max_value):
    input_activity = (
        ((net_input > 0) * (net_input) * (max_value - current_activation)) +
        ((net_input <= 0) * (net_input) * (current_activation - min_value))
    )
    return input_activity

def compute_activation(effect, current_activation, decay_rate, resting_state, min_value, max_value):
    decay = decay_rate * (current_activation - resting_state)
    activation = current_activation - decay + effect
    activation = np.clip(activation, min_value, max_value)
    return activation

class IAPool:
    def __init__(self, size, weights=None, decay_rate=0.1, resting_state=0.0, max_value=1.0, min_value=-1.0, inhibition_strength=1.0):
        self.size = size
        self.decay_rate = decay_rate
        self.max_value = max_value
        self.min_value = min_value
        self.inhibition_strength = inhibition_strength
        self.weights = weights

        if isinstance(resting_state, float):
            self.resting_state = np.full(size, resting_state)
        else:
            self.resting_state = resting_state

        self.state = self.resting_state.copy()

    def reset(self):
        self.state = self.resting_state.copy()

    def compute_net_input(self, inputs):
        return compute_net_input(inputs, self.weights, self.inhibition_strength, self.state)

    def compute_effect(self, net_input):
        return compute_effect(net_input, self.state, self.min_value, self.max_value)

    def compute_activation(self, effect):
        return compute_activation(effect, self.state, self.decay_rate, self.resting_state, self.min_value, self.max_value)

    def step(self, inputs):
        if self.weights is None:
            raise ValueError("weights cannot be None")
        if len(inputs) != len(self.weights):
            raise ValueError("inputs must have the same number of top-level items as weights")

        net_input = self.compute_net_input(inputs)
        effect = self.compute_effect(net_input)
        self.state = self.compute_activation(effect)
        return self.state

# Letter features (from iam-python-ref.py)
letters = np.array([
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], # A
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0], # B
    [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], # C
    [1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0], # D
    [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], # E
    [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], # F
    [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0], # G
    [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], # H
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], # I
    [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0], # J
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1], # K
    [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], # L
    [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0], # M
    [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1], # N
    [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], # O
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0], # P
    [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1], # Q
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1], # R
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0], # S
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], # T
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0], # U
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0], # V
    [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1], # W
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], # X
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0], # Y
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0]  # Z
])

# Parameters
FEATURE_LETTER_EXCITATION = 0.005
FEATURE_LETTER_INHIBITION = 0.15
LETTER_WORD_EXCITATION = 0.07
LETTER_WORD_INHIBITION = 0.04
WORD_LETTER_EXCITATION = 0.3
WORD_LETTER_INHIBITION = 0.0
WORD_WORD_INHIBITION = 0.21
LETTER_LETTER_INHIBITION = 0.0
MIN_ACTIVATION = -0.2
DECAY_RATE = 0.07
REST_GAIN = 0.05

# Build weight matrices
w_from_features_to_letters = letters.transpose()
w_from_features_to_letters_absence = 1 - w_from_features_to_letters
w_from_features_to_letters = np.where(w_from_features_to_letters == 1, FEATURE_LETTER_EXCITATION, -FEATURE_LETTER_INHIBITION)
w_from_features_to_letters_absence = np.where(w_from_features_to_letters_absence == 1, FEATURE_LETTER_EXCITATION, -FEATURE_LETTER_INHIBITION)

# Load word data
word_data = pd.read_csv('words.csv')
word_data = word_data.dropna()  # Remove any NaN rows
words = word_data['word'].str.lower().tolist()
resting = word_data['frequency'].values

# Create letter-to-index mapping
alphabet = 'abcdefghijklmnopqrstuvwxyz'
letter_to_index = {letter: index for index, letter in enumerate(alphabet)}

# Create one-hot encoded representations for letter-to-word weights
w_from_letters_to_words = np.zeros((4, 26, len(words)))
for i, word in enumerate(words):
    for j, letter in enumerate(word):
        index = letter_to_index[letter]
        w_from_letters_to_words[j, index, i] = 1

w_from_words_to_letters = w_from_letters_to_words.transpose(0, 2, 1)

# Apply weight mapping
w_from_letters_to_words = np.where(w_from_letters_to_words==1, LETTER_WORD_EXCITATION, -LETTER_WORD_INHIBITION)
w_from_words_to_letters = np.where(w_from_words_to_letters==1, WORD_LETTER_EXCITATION, -WORD_LETTER_INHIBITION)

# Create layers
letters_layer_first_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[0]], decay_rate=DECAY_RATE, min_value=MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_second_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[1]], decay_rate=DECAY_RATE, min_value=MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_third_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[2]], decay_rate=DECAY_RATE, min_value=MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_fourth_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[3]], decay_rate=DECAY_RATE, min_value=MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)

words_layer = IAPool(len(words), weights=w_from_letters_to_words, decay_rate=DECAY_RATE, min_value=MIN_ACTIVATION, inhibition_strength=WORD_WORD_INHIBITION, resting_state=resting*REST_GAIN)

# Test with WORK
input_present = [
    letters[letter_to_index["w"]],
    letters[letter_to_index["o"]],
    letters[letter_to_index["r"]],
    letters[letter_to_index["k"]]
]

input_absence = [
    1 - letters[letter_to_index["w"]],
    1 - letters[letter_to_index["o"]],
    1 - letters[letter_to_index["r"]],
    1 - letters[letter_to_index["k"]]
]

# Reset all layers
letters_layer_first_letter.reset()
letters_layer_second_letter.reset()
letters_layer_third_letter.reset()
letters_layer_fourth_letter.reset()
words_layer.reset()

print("=== Python Reference Model - WORK activation ===")
print(f"Initial resting state for WORK: {words_layer.resting_state[words.index('work')]:.6f}")
print(f"Initial resting state for WORD: {words_layer.resting_state[words.index('word')]:.6f}")
print(f"Initial resting state for WEAK: {words_layer.resting_state[words.index('weak')]:.6f}")
print()

# Run for 20 cycles
for i in range(20):
    # Save states
    l_0_s = letters_layer_first_letter.state.copy()
    l_1_s = letters_layer_second_letter.state.copy()
    l_2_s = letters_layer_third_letter.state.copy()
    l_3_s = letters_layer_fourth_letter.state.copy()
    w_s = words_layer.state.copy()

    # Update letter layers
    letters_layer_first_letter.step([input_present[0], input_absence[0], w_s])
    letters_layer_second_letter.step([input_present[1], input_absence[1], w_s])
    letters_layer_third_letter.step([input_present[2], input_absence[2], w_s])
    letters_layer_fourth_letter.step([input_present[3], input_absence[3], w_s])

    # Update word layer
    words_layer.step([l_0_s, l_1_s, l_2_s, l_3_s])

    # Print activation for key words
    work_act = words_layer.state[words.index('work')]
    word_act = words_layer.state[words.index('word')]
    weak_act = words_layer.state[words.index('weak')]

    print(f"Step {i}: WORK={work_act:.6f}, WORD={word_act:.6f}, WEAK={weak_act:.6f}")

print("\n=== Letter activations at step 10 ===")
letters_layer_first_letter.reset()
letters_layer_second_letter.reset()
letters_layer_third_letter.reset()
letters_layer_fourth_letter.reset()
words_layer.reset()

for i in range(10):
    l_0_s = letters_layer_first_letter.state.copy()
    l_1_s = letters_layer_second_letter.state.copy()
    l_2_s = letters_layer_third_letter.state.copy()
    l_3_s = letters_layer_fourth_letter.state.copy()
    w_s = words_layer.state.copy()

    letters_layer_first_letter.step([input_present[0], input_absence[0], w_s])
    letters_layer_second_letter.step([input_present[1], input_absence[1], w_s])
    letters_layer_third_letter.step([input_present[2], input_absence[2], w_s])
    letters_layer_fourth_letter.step([input_present[3], input_absence[3], w_s])
    words_layer.step([l_0_s, l_1_s, l_2_s, l_3_s])

print(f"Position 0 - W: {letters_layer_first_letter.state[letter_to_index['w']]:.6f}")
print(f"Position 1 - O: {letters_layer_second_letter.state[letter_to_index['o']]:.6f}")
print(f"Position 2 - R: {letters_layer_third_letter.state[letter_to_index['r']]:.6f}")
print(f"Position 3 - K: {letters_layer_fourth_letter.state[letter_to_index['k']]:.6f}")
