import numpy as np
import pandas as pd

# Import the reference implementation
exec(open('iam-python-ref.py').read())

# Load word data
word_data = pd.read_csv('words.csv')
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
letters_layer_first_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[0]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_second_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[1]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_third_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[2]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_fourth_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[3]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)

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
