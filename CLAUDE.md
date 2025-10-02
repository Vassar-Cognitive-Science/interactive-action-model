# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm test             # Run all tests with Vitest
npm test -- --watch  # Run tests in watch mode
npm run build        # Build for production
npm run preview      # Preview production build
```

### Running Specific Tests
```bash
npm test -- src/core/IAPool.test.js      # Test activation pool
npm test -- src/core/IAModel.test.js     # Test model
```

## Architecture Overview

This is an implementation of the **Interactive Activation Model** (IAM) from Rumelhart & McClelland's PDP work on word recognition. The model demonstrates emergent cognitive phenomena through bidirectional activation between three layers.

### Core Model Architecture

The model is split between **core logic** (`src/core/`) and **UI components** (`src/components/`).

#### Three-Layer Interactive Activation

1. **Feature Layer** (bottom)
   - 14 visual features per position (4 positions for 4-letter words)
   - Features: horizontal/vertical/diagonal line segments
   - Defined in `src/core/data.js` as binary vectors for each letter

2. **Letter Layer** (middle)
   - 26 letters × 4 positions = 104 letter units
   - Each implemented as an `IAPool` instance
   - Receives bottom-up from features AND top-down from words

3. **Word Layer** (top)
   - 1179 four-letter words (subset of English)
   - Single `IAPool` with lateral inhibition (word-word competition)
   - Sends top-down feedback to letters

#### Key Classes

**`IAPool` (src/core/IAPool.js)**
- Core activation unit implementing interactive activation dynamics
- Handles: net input computation, lateral inhibition, decay, min/max bounds
- Methods: `step(inputs)`, `computeActivation(effect)`, `reset()`

**`InteractiveActivationModel` (src/core/IAModel.js)**
- Orchestrates three layers
- Manages weight matrices for all connections:
  - `featureToLetterWeights`: 14 features → 26 letters (excitatory/inhibitory)
  - `letterToWordWeights`: letters at positions → words (excitatory)
  - `wordToLetterWeights`: words → letters at positions (excitatory)
- Key methods:
  - `stepModel(stimulus, enableWord)`: Advance simulation one timestep
  - `runTrial(stimulus, duration, trackedItems, enableWord)`: Run full trial
  - `textToFeatures(word)`: Convert text to feature vectors

#### Connection Weights

**Bottom-up (Features → Letters)**
- Excitatory: Feature PRESENT activates matching letters (+)
- Inhibitory: Feature ABSENT suppresses letters that need it (-)
- Computed from letter feature vectors in `data.js`

**Bidirectional (Letters ↔ Words)**
- Bottom-up: Letters excite words containing them at correct positions
- Top-down: Words excite their constituent letters (word feedback)
- Enables context effects (word superiority effect)

**Within-Layer**
- Word-Word: Lateral inhibition (competition between similar words)
- Letter-Letter: None by default (letters at same position don't inhibit)

### UI Architecture

**Single-page app** with no tabs (classic experiments removed). Main interface shows:

1. **Control Panel** (`SimulationRunner.jsx`)
   - Play/Pause/Step/Reset controls
   - Speed slider
   - Parameters drawer (left side, toggled with ⚙ button)
   - Chart Settings drawer (left side, toggled with 📊 button)

2. **Layer Visualization** (`LayerVisualization.jsx`)
   - Top: Word Layer - horizontal grid of top 15 words with color-coded activation
   - Middle: Letter Layer - 4 position pools showing 26 letters each
   - Bottom: Feature Editor - interactive input with 4 clickable glyphs

3. **Feature Editor** (`FeatureEditor.jsx`)
   - PIN-style 4-letter text input at top
   - Four interactive glyphs (one per position) in one row
   - Legend below glyphs showing PRESENT/ABSENT/AMBIGUOUS states
   - Clicking features cycles: ABSENT → PRESENT → AMBIGUOUS → ABSENT

4. **Interactive Glyph** (`InteractiveGlyph.jsx`)
   - SVG-based visualization of 14 line segments
   - Color coding:
     - Green solid: PRESENT (1.0)
     - Gray: ABSENT (0.0)
     - Black: AMBIGUOUS (0.5)
   - Invisible hit areas for easier clicking

5. **Word Tracking** (`WordLayer.jsx`)
   - Click "📊 Track" to show tracking UI
   - Add specific words to track in charts
   - Click any word tile to toggle tracking
   - Tracked words show gold border + 📌 indicator

### State Management

**Feature States** (FeatureEditor)
- ABSENT (0): Gray, inhibits letters needing this feature
- PRESENT (1): Green solid, excites letters with this feature
- AMBIGUOUS (0.5): Black, neutral (no excitation/inhibition)

**Typing behavior**: Entering letters automatically converts to feature vectors. Deleting characters sets positions to ABSENT.

**Simulation State** (SimulationRunner)
- Maintains model instance, activation history, tracked words
- `customFeatures`: Current input from FeatureEditor (4 positions × 14 features)
- `modelState`: Current activations (letters, words)
- `maskStart`: Timestep when mask appears (replaces stimulus with AMBIGUOUS)
- Parameters can be edited live via Parameters panel

### Configuration & Data Files

**`model-config.json`** (project root)
- **Centralized configuration file** for all model defaults
- Easy to edit without touching code
- Contains:
  - `parameters`: All weight/activation parameters
  - `simulation`: Max steps, mask start, default speed
  - `mask`: Default mask stimulus features
- Loaded by `src/core/constants.js` at build time

**`src/core/constants.js`**
- Imports values from `model-config.json`
- Exports constants used throughout the app
- Provides: `DEFAULT_MAX_STEPS`, `DEFAULT_MASK_START`, `DEFAULT_SPEED`

**`src/core/data.js`**
- `letters`: Object mapping a-z to 14-element binary feature vectors
- `WORD_LIST`: 1179 four-letter words
- Feature order matches IAM diagram: top/middle/bottom horizontal, verticals, diagonals

## Important Implementation Details

### Activation Dynamics

Each pool uses the IAM update rule:
```
net_input = Σ(weight_i × activation_i)
effect = max - activation  if net_input > 0  (excitatory)
       = activation - min  if net_input < 0  (inhibitory)
new_activation = activation + (effect × net_input) - (decay × (activation - rest))
```

### Feature Absence vs Presence

The model handles **absence** explicitly:
- Present features (value=1) provide excitatory input
- Absent features (value=0) provide inhibitory input to letters requiring them
- Ambiguous features (value=0.5) provide no input (used for masking)

### Testing

Tests use Vitest with happy-dom. Core tests (IAPool, IAModel) verify:
- Activation computation correctness
- Weight matrix dimensions
- Trial execution
- State management

UI components are not extensively tested (focus is on model correctness).

## Component Communication

```
SimulationRunner (state management)
  ├─> Parameters (hidden by default)
  ├─> LayerVisualization
  │     ├─> WordLayer (with tracking)
  │     ├─> LetterPool × 4
  │     └─> FeatureEditor
  │           ├─> LetterInput (PIN-style)
  │           └─> InteractiveGlyph × 4
  └─> ActivationChart (if history exists)
```

## Styling Conventions

- CSS modules per component (e.g., `WordLayer.css`)
- Flexbox for horizontal layouts
- Grid for responsive multi-column layouts (e.g., letter pools, word tiles)
- Color palette:
  - Primary blue: #3498db
  - Green (present/success): #27ae60
  - Gray (absent): #95a5a6
  - Dark (ambiguous): #2c3e50
  - Purple (parameters): #9b59b6
  - Orange (tracking): #f39c12

## Common Modifications

**Adjusting model defaults**: Edit `model-config.json` in project root (easiest method - no code changes needed)

**Changing word list**: Modify `WORD_LIST` in `src/core/data.js`

**Adding letter features**: Update `letters` object in `src/core/data.js` and increase feature count from 14

**Modifying UI layout**: Most layout is in component CSS files, with grid/flexbox for responsiveness

**Customizing visualization**: Use the Chart Settings drawer (📊 button) to configure:
- Top 5 words display
- Tracked words (always shown)
- Letter unit tracking (select position + letters)
- Auto-scale Y-axis
- Legend visibility
