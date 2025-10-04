# Interactive Activation Model

Interactive web application implementing the **Interactive Activation Model** from McClelland & Rumelhart's classic work on word recognition.

🔗 **[Live Demo](https://vassar-cognitive-science.github.io/interactive-activation-model/)**

## Overview

The Interactive Activation Model demonstrates how word recognition emerges from bidirectional activation between three layers:

- **Feature Layer**: Visual line segments at each letter position
- **Letter Layer**: Letter detectors (26 letters × 4 positions)
- **Word Layer**: 1179 four-letter word representations

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Features

- **Interactive Controls**: Play, pause, step, and reset simulation
- **Custom Input**: Click feature segments to create any 4-letter pattern
- **Real-Time Visualization**: Watch activation flow through all layers
- **Activation Charts**: Track word and letter activations over time
- **Word Tracking**: Pin specific words to follow their activation
- **Adjustable Parameters**: Modify weights and dynamics in real-time

## Development

```bash
npm test              # Run tests
npm run build         # Build for production
npm run preview       # Preview production build
```

## References

McClelland, J. L., & Rumelhart, D. E. (1981). An interactive activation model of context effects in letter perception: I. An account of basic findings. *Psychological Review, 88*(5), 375-407.

## License

ISC
