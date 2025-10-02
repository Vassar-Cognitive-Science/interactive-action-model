def compute_net_input(list_of_inputs, list_of_excitatory_weights, inhibition_strength, current_activation):
  num_units = len(current_activation)

  # create a variable to store the total input signal.
  # we need this because we may have multiple different inputs (bottom-up
  # & top-down) to this layer, so we have to get the total input
  # across all of them
  input_signal = np.zeros(num_units)

  # loop through each input...
  for i in range(len(list_of_inputs)):
    # if any of the incoming signals are negative, we use this function
    # to set them to 0. this reflects the fact that nodes with <=0 activation
    # are considered inactive in this simulation.
    clipped_input = np.clip(list_of_inputs[i], 0, None)

    # calculate the contribution to the input_signal from this input, using
    # the weights that correspond to this input.
    input_signal += np.dot(clipped_input, list_of_excitatory_weights[i])

  # next step is to compute the inhibitory input from the rest of the
  # nodes in this layer. the same rule about signals <= 0 applies here,
  # so we start by creating a clipped version of the state of this layer.
  clipped_state = np.clip(current_activation, 0, None)

  # now we can use the clipped state and the weights to get the total
  # inhibitory_signal for this layer
  inhibitory_weights = np.full((num_units, num_units), -inhibition_strength)
  np.fill_diagonal(inhibitory_weights, 0)
  inhibitory_signal = np.dot(clipped_state, inhibitory_weights)

  # the input is all of the inputs to the layer plus the layer's own
  # inhibition. total_input will be a vector of length self.size.
  total_input = input_signal + inhibitory_signal

  return total_input

def compute_effect(net_input, current_activation, min_value, max_value):
  # this next step is basically the activation function.
  # the idea is to scale the input activation so that if we are close
  # to the maximum or minimum value of the neuron then the activation is
  # lessend. the difficult part of this step is that we have two different
  # forumlas to follow: one when the input signal for a node is positive
  # and one when it is negative.
  # this is a tricky way to do this: basically we create two arrays and add
  # them together. one of the arrays follows the rule for positive
  # net_input and the other follows the rule for negative net_input.
  # we use the `net_input > 0` to create a "mask" - this will produce an
  # array with 1s in all of the spots that net_input > 0, and 0s
  # everywhere else. by multiplying the computed values times this mask,
  # we zero out everything that doesn't match. then we add this to the
  # other array, which has the opposite mask.
  input_activity = (
    ((net_input > 0) * (net_input) * (max_value - current_activation)) +
    ((net_input <= 0) * (net_input) * (current_activation - min_value))
  )

  return input_activity

def compute_activation(effect, current_activation, decay_rate, resting_state, min_value, max_value):
   # we can compute the amount of decay in the state following
    # the formula given in the paper. this formula creates more decay when
    # we are further from the resting_state.
    decay = decay_rate * (current_activation - resting_state)

    # update the state by subtracting the decay and adding the input_activity
    activation = current_activation - decay + effect

    # make sure the state does not exceed the min and max values.
    activation = np.clip(activation, min_value, max_value)

    return activation

    #raise NotImplementedError("Implement this")

class IAPool:
  # the __init__ function is a special python constructor function. it is what is
  # called when you create a new instance of a class
  def __init__(self, size, weights=None, decay_rate=0.1, resting_state=0.0, max_value=1.0, min_value = -1.0, inhibition_strength=1.0):
    # the number of units in this layer/pool
    self.size = size

    # the rate of decay back to the resting state
    self.decay_rate = decay_rate

    # the maximum possible activation
    self.max_value = max_value

    # the minimum possible activation
    self.min_value = min_value

    # the self-inhibition strength between all nodes in this pool
    self.inhibition_strength = inhibition_strength

    # a list of weights. the weights are given as a list to allow
    # for inputs from more than one pool. when .step() is called
    # the inputs will be a list with the same number of items in this list.
    # therefore the order of the weights should be the same as the order
    # of the inputs in .step()
    self.weights = weights

    # the resting state for each node. if a single number is given
    # the value is used for all nodes. if an array is given the
    # resting state can be customized per node.
    if isinstance(resting_state, float):
        self.resting_state = np.full(size, resting_state)
    else:
        self.resting_state = resting_state

    # initializing the state of the network to be the resting state.
    self.state = self.resting_state

  # this resets the layer to its initial state
  def reset(self):
    self.state = self.resting_state

  def compute_net_input(self, inputs):

    return compute_net_input(inputs, self.weights, self.inhibition_strength, self.state)

  def compute_effect(self, net_input):

    return compute_effect(net_input, self.state, self.min_value, self.max_value)

  def compute_activation(self, effect):

    return compute_activation(effect, self.state, self.decay_rate, self.resting_state, self.min_value, self.max_value)

  # the step function takes a set of inputs, applies the rules for updating
  # the state of the network, and stores the resulting state.
  def step(self, inputs):
    # these two if() statements just check to make sure that the weights
    # and inputs have the right kind of shape before trying to compute
    # the signal
    if(self.weights is None):
      raise ValueError("weights cannot be None")
    if(len(inputs) != len(self.weights)):
      raise ValueError("inputs must have the same number of top-level items as weights")

    net_input = self.compute_net_input(inputs)
    #print(net_input)
    effect = self.compute_effect(net_input)
    #print(effect)
    self.state = self.compute_activation(effect)

    return self.state
  
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

w_from_features_to_letters = letters.transpose()

w_from_features_to_letters_absence = 1 - w_from_features_to_letters

FEATURE_LETTER_EXCITATION = 0.005
FEATURE_LETTER_INHIBITION = 0.15

LETTER_WORD_EXCITATION = 0.07
LETTER_WORD_INHIBITION = 0.04

WORD_LETTER_EXCITATION = 0.3
WORD_LETTER_INHIBITION = 0.0 # None in the initial models in the paper

WORD_WORD_INHIBITION = 0.21
LETTER_LETTER_INHIBITION = 0.0

MIN_ACTIVATION = -0.2
DECAY_RATE = 0.07

# we use this value to scale the resting states. the resting data is in the range
# 0 to -1. we multiply those values by this gain factor to get the resting state.
# making this larger will increase the impact that word frequency has in the model.
REST_GAIN = 0.05


w_from_features_to_letters = np.where(w_from_features_to_letters == 1, FEATURE_LETTER_EXCITATION, -FEATURE_LETTER_INHIBITION)
w_from_features_to_letters_absence = np.where(w_from_features_to_letters_absence == 1, FEATURE_LETTER_EXCITATION, -FEATURE_LETTER_INHIBITION)
w_from_letters_to_words = np.where(w_from_letters_to_words==1, LETTER_WORD_EXCITATION, -LETTER_WORD_INHIBITION)
w_from_words_to_letters = np.where(w_from_words_to_letters==1, WORD_LETTER_EXCITATION, -WORD_LETTER_INHIBITION)


letters_layer_first_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[0]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_second_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[1]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_third_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[2]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)
letters_layer_fourth_letter = IAPool(26, weights=[w_from_features_to_letters, w_from_features_to_letters_absence, w_from_words_to_letters[3]], decay_rate=DECAY_RATE, min_value = MIN_ACTIVATION, inhibition_strength=LETTER_LETTER_INHIBITION)

words_layer = IAPool(len(words), weights=w_from_letters_to_words, decay_rate=DECAY_RATE, min_value=MIN_ACTIVATION, inhibition_strength=WORD_WORD_INHIBITION, resting_state=resting*REST_GAIN)


# define the input
input_present = [
    letters[letter_to_index["w"]],
    letters[letter_to_index["o"]],
    letters[letter_to_index["r"]],
    np.array([0,1,0,0,1,0,0,1,0,0,0,0,0,1]) # features definitely present in the ambiguous R or K
]

input_absence = [
    1 - letters[letter_to_index["w"]],
    1 - letters[letter_to_index["o"]],
    1 - letters[letter_to_index["r"]],
    np.array([0,0,1,1,0,0,0,0,1,1,0,0,1,0]) # features definitely absent in the ambiguous R or K
]

# create a data frame with three columns to store the activation values
df = pd.DataFrame(columns=['word', 'timestep', 'activation'])

# reset all the layers of the model (in case the model has already been run).
# this lets you run the model again without recreating the layers.
letters_layer_first_letter.reset()
letters_layer_second_letter.reset()
letters_layer_third_letter.reset()
letters_layer_fourth_letter.reset()
words_layer.reset()

# loop for 40 cycles
for i in range(40):
  # save the state of each layer (this is important because calling .step() changes the state,
  # so we need a copy of the values before calling .step() to simulate everything happening
  # in one parallel step)
  l_0_s = letters_layer_first_letter.state
  l_1_s = letters_layer_second_letter.state
  l_2_s = letters_layer_third_letter.state
  l_3_s = letters_layer_fourth_letter.state
  w_s = words_layer.state

  # call step on each of the pools in the letters layer. note that we give each
  # pool the corresponding piece of input.
  letters_layer_first_letter.step([input_present[0], input_absence[0], w_s])
  letters_layer_second_letter.step([input_present[1], input_absence[1], w_s])
  letters_layer_third_letter.step([input_present[2], input_absence[2], w_s])
  letters_layer_fourth_letter.step([input_present[3], input_absence[3], w_s])

  # call step on the words layer, using the saved state values.
  words_layer.step([
      l_0_s,
      l_1_s,
      l_2_s,
      l_3_s,
  ])

  # this chunk of code is just for saving the data.
  # we use a for loop to run the chunk once for each word.
  # then we get the state of the words layer and extract
  # the activation value for the node that corresponds
  # to the word. the .index() function gets the location
  # of a value in a list.
  # then we build a new row for the data set with the corresponding
  # word, timestep (i is defined way above in the main loop), and
  # the activation value.
  # finally we add all this to the data frame using df.loc[].
  for w in ["work", "word", "weak", "wear"]:
    s = words_layer.state
    activation = s[words.index(w)]
    row = {'word': w, 'timestep': i, 'activation': activation}
    df.loc[len(df)] = row

# once the simulation is done, we can print the dataframe out.
df