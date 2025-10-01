# Interactive Activation Model - Implementation Plan

## Overview
Modernize the Interactive Activation Model (IAM) implementation from Rumelhart & McClelland's PDP book into a maintainable, interactive web application suitable for teaching demonstrations.

## Current State
- Basic JavaScript implementation in `iam.js` with IAM core logic
- Simple HTML interface with Chart.js visualizations
- Hardcoded experiments (READ vs E, MAVE vs E, Rich Get Richer, Gang Effect)
- No build system, testing, or modular architecture

## Goals
1. **Educational clarity**: Clear visualizations of the three-layer architecture (features → letters → words)
2. **Interactive exploration**: Allow users to input custom stimuli and adjust parameters
3. **Visual feedback**: Show real-time activation across all layers and pools
4. **Maintainability**: Modern tooling, modular code, testing
5. **Teaching-friendly**: Explanatory text, guided experiments, parameter presets

## Proposed Architecture

### Technology Stack
- **Framework**: React (or Vanilla JS with modern build tools)
- **Build Tool**: Vite (fast, modern, minimal config)
- **Visualization**: D3.js for layer/pool visualization + Chart.js for time series
- **Styling**: CSS modules or Tailwind CSS
- **State Management**: React Context or Zustand (lightweight)
- **Testing**: Vitest + Testing Library
- **Type Safety**: JSDoc comments or TypeScript (optional)

### Project Structure
```
/src
  /core
    - IAPool.js          # Pool class (refactored)
    - IAModel.js         # Main model class
    - constants.js       # Model parameters
    - data.js            # Letter features, word list
  /components
    - LayerVisualization.js    # Visual representation of layers
    - PoolVisualization.js     # Individual pool display
    - ActivationChart.js       # Time series plots
    - ControlPanel.js          # Parameter controls
    - StimulusInput.js         # Custom stimulus entry
    - ExperimentRunner.js      # Pre-configured experiments
  /experiments
    - wordSuperiority.js       # Classic experiments
    - pseudoword.js
  /utils
    - helpers.js
  App.js
  main.js
/tests
  - IAPool.test.js
  - IAModel.test.js
/public
  - assets, styles
```

## Implementation Phases

### Phase 1: Project Setup & Core Refactoring
**Goal**: Modern development environment with tested core logic

**Tasks**:
- [ ] Initialize Vite project with modern JS/React
- [ ] Set up testing framework (Vitest)
- [ ] Refactor `IAPool` class into modular file with tests
- [ ] Refactor `InteractiveActivationModel` into modular file with tests
- [ ] Move constants and data to separate files
- [ ] Verify existing experiments still work

**Deliverables**: Clean, tested core model

---

### Phase 2: Enhanced Visualizations
**Goal**: Clear, interactive three-layer visualization

**Tasks**:
- [ ] Design layer visualization layout (vertical: features → letters → words)
- [ ] Build `LayerVisualization` component
  - Features layer: 14 features × 4 positions (visual glyphs)
  - Letters layer: 26 letters × 4 positions (grid with activation colors)
  - Words layer: Top N active words (dynamic list/bar chart)
- [ ] Build `PoolVisualization` component for detailed pool view
  - Show individual unit activations
  - Highlight connections on hover
- [ ] Implement real-time updates during simulation
- [ ] Add color-coding (green = excitatory, red = inhibitory, intensity = activation)

**Deliverables**: Interactive layer diagrams

---

### Phase 3: Interactive Controls
**Goal**: User-friendly parameter adjustment and stimulus input

**Tasks**:
- [ ] Build `ControlPanel` component
  - Sliders for key parameters (excitation/inhibition weights, decay rate)
  - Presets for classic configurations
  - Reset to defaults
- [ ] Build `StimulusInput` component
  - Text input for 4-letter words/pseudowords
  - Visual feature editor (click to toggle features)
  - Mask timing controls
- [ ] Implement parameter validation
- [ ] Add tooltips/help text for parameters

**Deliverables**: Full user control over model

---

### Phase 4: Experiment Framework
**Goal**: Pre-built classic experiments with explanations

**Tasks**:
- [ ] Create `ExperimentRunner` component
  - Dropdown/tabs for experiment selection
  - Run/pause/reset controls
  - Step-through mode for teaching
- [ ] Implement classic experiments:
  - Word superiority effect (READ vs E)
  - Pseudoword superiority (MAVE vs E)
  - Rich get richer
  - Gang effect
- [ ] Add experiment descriptions and expected results
- [ ] Show side-by-side comparisons
- [ ] Export results (CSV/JSON)

**Deliverables**: Teaching-ready demo interface

---

### Phase 5: Documentation & Polish
**Goal**: Professional, classroom-ready application

**Tasks**:
- [ ] Write comprehensive README
  - Model overview
  - How to use the application
  - Parameter guide
  - Development setup
- [ ] Create user guide section in app
  - Model explanation
  - Experiment tutorials
  - Parameter effects guide
- [ ] Add responsive design for presentations
- [ ] Performance optimization (memoization, web workers for long simulations)
- [ ] Browser testing
- [ ] Deploy to GitHub Pages or Netlify

**Deliverables**: Complete, documented application

---

## Optional Enhancements (Future)
- **Advanced features**:
  - Save/load model states
  - Custom word lists
  - Multi-trial analysis
  - Parameter sensitivity analysis
  - Animation controls (speed, auto-play)
- **Extended model**:
  - Variable word length support
  - Context effects
  - Noise/stochasticity
- **Educational tools**:
  - Quiz mode (predict outcomes)
  - Guided walkthroughs
  - Video export of simulations

---

## Key Design Decisions

### Why Vite?
- Fast development server with HMR
- Minimal configuration
- Modern ES modules
- Easy deployment

### Why D3.js + Chart.js?
- D3 for custom layer/pool visualizations (flexibility)
- Chart.js for standard time series (simplicity)
- Both well-documented for teaching examples

### Modular vs Monolithic?
- Separate core model from UI completely
- Core can be tested independently
- UI components are reusable
- Easier to maintain and extend

### React vs Vanilla JS?
- React: Better for complex state management, component reusability
- Vanilla: Lighter, simpler for students to understand
- **Recommendation**: Start with React for maintainability

---

## Success Criteria
1. ✅ Model produces correct results (verified against original implementation)
2. ✅ Clear visualization of all three layers
3. ✅ Users can run classic experiments with one click
4. ✅ Users can input custom stimuli and adjust parameters
5. ✅ Code is well-documented and tested
6. ✅ Application loads quickly and runs smoothly
7. ✅ Suitable for classroom demonstrations

---

## Timeline Estimate
- **Phase 1**: 1-2 days
- **Phase 2**: 2-3 days
- **Phase 3**: 1-2 days
- **Phase 4**: 1-2 days
- **Phase 5**: 1 day

**Total**: ~7-10 days (part-time development)

---

## Next Steps
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on feedback
