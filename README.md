# Interactive Activation Model

A modern, interactive web application implementing the **Interactive Activation Model** from Rumelhart & McClelland's classic PDP (Parallel Distributed Processing) work on word recognition.

## Overview

This application demonstrates how words are recognized through interactive activation between three layers:
- **Feature Layer**: Visual features at each letter position
- **Letter Layer**: Letter detectors at each position
- **Word Layer**: Complete word representations

The model shows emergent phenomena like:
- **Word Superiority Effect**: Letters are recognized better in word contexts
- **Pseudoword Superiority**: Even pronounceable non-words facilitate letter recognition
- **Rich Get Richer**: High-frequency words activate faster
- **Gang Effect**: Words with more matching letters activate more strongly

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Visit `http://localhost:5173` to use the application.

## Features

### 🎮 Live Simulation Mode
- **Interactive Controls**: Start, pause, step-through, and reset
- **Custom Input**: Enter any 4-letter word to see how it's processed
- **Speed Control**: Adjust simulation speed from 20ms to 500ms per step
- **Real-Time Visualization**: Watch activation flow through all three layers
- **Dynamic Charts**: Track word activation over time

### 🔬 Classic Experiments
- Pre-configured experiments from the original IAM paper
- One-click execution
- Detailed results and explanations
- Side-by-side comparisons

### 👁️ Layer Visualization
- **Feature Layer**: Visual features at each position (red indicators)
- **Letter Layer**: 26 letters × 4 positions with color-coded activation
- **Word Layer**: Top 15 active words with bar chart
- **Color Coding**: White (low) → Light Blue (medium) → Dark Blue (high)
- **Hover Tooltips**: Detailed activation values

## Project Structure

```
/src
  /core
    - IAPool.js          # Pool of interactive activation units
    - IAModel.js         # Main Interactive Activation Model
    - constants.js       # Model parameters
    - data.js            # Letter features and word list
  /components
    - SimulationRunner.jsx    # Live interactive simulation
    - ExperimentRunner.jsx    # Classic experiments interface
    - LayerVisualization.jsx  # Three-layer architecture view
    - FeatureLayer.jsx        # Visual features display
    - LetterPool.jsx          # Letter activation grid
    - WordLayer.jsx           # Word activation bars
    - ActivationChart.jsx     # Time series visualization
  /experiments
    - wordSuperiority.js      # Classic IAM experiments
  /utils
    - colors.js               # Activation color mapping
  App.jsx                     # Main application with tabs
  main.jsx                    # Entry point
```

## Classic Experiments

### 1. Word Superiority Effect
Compare letter recognition in word vs. isolated contexts:
- **E in READ** vs. **E alone**
- Shows that word context facilitates letter recognition

### 2. Pseudoword Superiority
Test recognition with pronounceable non-words:
- **E in MAVE** vs. **E alone**
- Demonstrates that word-layer feedback helps even for non-words

### 3. Rich Get Richer
Frequency effects in word recognition:
- Compare **HAVE** (high frequency) vs. **SAVE** (lower frequency)
- High-frequency words have higher resting states and activate faster

### 4. Gang Effect
Competition and similarity in word recognition:
- Present **MAVE** and track **SAVE**, **MALE**, **MOVE**
- Words with more matching letters (SAVE) activate more strongly

## Model Parameters

Key parameters (defined in `src/core/constants.js`):

- `FEATURE_LETTER_EXCITATION`: 0.005
- `FEATURE_LETTER_INHIBITION`: 0.15
- `LETTER_WORD_EXCITATION`: 0.07
- `WORD_LETTER_EXCITATION`: 0.3
- `WORD_WORD_INHIBITION`: 0.21
- `DECAY_RATE`: 0.07
- `MIN_ACTIVATION`: -0.2

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/core/IAPool.test.js
```

### Verifying Experiments

```bash
# Run experiment verification script
node src/experiments/verify.js
```

## Using the Core Model

```javascript
import { InteractiveActivationModel } from './src/core/IAModel.js';
import { letters } from './src/core/data.js';

// Create model
const model = new InteractiveActivationModel();

// Convert text to features
const stimulus = model.textToFeatures('read');

// Run a trial
const results = model.runTrial(
  stimulus,
  40,  // duration
  [{ type: 'word', index: model.wordList.indexOf('read'), label: 'READ' }],
  true  // enable word layer
);

// Get top active words
const topWords = model.getTopWords(10);
console.log(topWords);
```

## Technology Stack

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **Chart.js**: Time series visualization
- **ES Modules**: Modern JavaScript

## References

- Rumelhart, D. E., & McClelland, J. L. (1982). An interactive activation model of context effects in letter perception: Part 2. The contextual enhancement effect and some tests and extensions of the model. *Psychological Review*, 89(1), 60-94.

- McClelland, J. L., & Rumelhart, D. E. (1981). An interactive activation model of context effects in letter perception: Part 1. An account of basic findings. *Psychological Review*, 88(5), 375-407.

## License

ISC

## Contributing

This is an educational implementation. Contributions that improve clarity, add educational features, or extend the model are welcome!
