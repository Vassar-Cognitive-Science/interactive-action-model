import React, { useState, useEffect, useRef } from 'react';
import { InteractiveActivationModel } from '../core/IAModel.js';
import LayerVisualization from './LayerVisualization.jsx';
import ActivationChart from './ActivationChart.jsx';
import SimpleChartSettings from './SimpleChartSettings.jsx';
import Parameters from './Parameters.jsx';
import ChartGallery from './ChartGallery.jsx';
import * as constants from '../core/constants.js';
import './SimulationRunner.css';

/**
 * Interactive simulation runner with real-time visualization
 */
export default function SimulationRunner() {
    const [model] = useState(() => new InteractiveActivationModel());
    const [customFeatures, setCustomFeatures] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [maxSteps, setMaxSteps] = useState(constants.DEFAULT_MAX_STEPS);
    const [maskEnabled, setMaskEnabled] = useState(constants.DEFAULT_MASK_ENABLED);
    const [maskStart, setMaskStart] = useState(constants.DEFAULT_MASK_START);
    const [speed, setSpeed] = useState(constants.DEFAULT_SPEED); // ms per step
    const [modelState, setModelState] = useState(null);
    const [currentStimulus, setCurrentStimulus] = useState(null);
    const [history, setHistory] = useState({ time: [], words: {}, letters: {}, wordPeaks: {}, letterPeaks: {} });
    const [showParameters, setShowParameters] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [savedCharts, setSavedCharts] = useState([]);
    const [trackedWords, setTrackedWords] = useState([]);
    const [showWordChart, setShowWordChart] = useState(false);
    const [showLetterCharts, setShowLetterCharts] = useState([false, false, false, false]);
    const [wordChartSettings, setWordChartSettings] = useState({
        showTopWords: true,
        showTrackedWords: true,
        autoScale: true
    });
    const [letterChartSettings, setLetterChartSettings] = useState([
        { showTopLetters: true, topN: 3, letterFilter: '', autoScale: true },
        { showTopLetters: true, topN: 3, letterFilter: '', autoScale: true },
        { showTopLetters: true, topN: 3, letterFilter: '', autoScale: true },
        { showTopLetters: true, topN: 3, letterFilter: '', autoScale: true }
    ]);
    const [parameters, setParameters] = useState({
        FEATURE_LETTER_EXCITATION: constants.FEATURE_LETTER_EXCITATION,
        FEATURE_LETTER_INHIBITION: constants.FEATURE_LETTER_INHIBITION,
        LETTER_WORD_EXCITATION: constants.LETTER_WORD_EXCITATION,
        LETTER_WORD_INHIBITION: constants.LETTER_WORD_INHIBITION,
        WORD_LETTER_EXCITATION: constants.WORD_LETTER_EXCITATION,
        WORD_LETTER_INHIBITION: constants.WORD_LETTER_INHIBITION,
        WORD_WORD_INHIBITION: constants.WORD_WORD_INHIBITION,
        LETTER_LETTER_INHIBITION: constants.LETTER_LETTER_INHIBITION,
        DECAY_RATE: constants.DECAY_RATE,
        MIN_ACTIVATION: constants.MIN_ACTIVATION
    });

    const intervalRef = useRef(null);

    const resetSimulation = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        model.reset();
        setCurrentStep(0);
        setIsRunning(false);
        setIsPaused(false);
        setHistory({ time: [], words: {}, letters: {}, wordPeaks: {}, letterPeaks: {} });
        updateVisualization();
    };

    const updateVisualization = () => {
        const state = model.getState();
        setModelState(state);
    };

    const runStep = () => {
        // Get stimulus from custom features (FeatureEditor handles conversion)
        const stimulus = customFeatures || [Array(14).fill(0.5), Array(14).fill(0.5), Array(14).fill(0.5), Array(14).fill(0.5)];
        setCurrentStimulus(stimulus);

        // Use stimulus until maskStart (if mask enabled), then ambiguous (0.5) for mask
        const input = (maskEnabled && currentStep >= maskStart) ?
            [Array(14).fill(0.5), Array(14).fill(0.5), Array(14).fill(0.5), Array(14).fill(0.5)] :
            stimulus;

        model.stepModel(input, true);
        updateVisualization();

        const state = model.getState();

        setHistory(prev => {
            const newHistory = {
                time: [...prev.time, currentStep],
                words: { ...prev.words },
                letters: { ...prev.letters },
                wordPeaks: { ...prev.wordPeaks },
                letterPeaks: { ...prev.letterPeaks }
            };

            // Track ALL words for peak detection
            model.wordList.forEach((word, idx) => {
                const activation = state.words[idx];
                if (!newHistory.words[word]) {
                    newHistory.words[word] = Array(prev.time.length).fill(null);
                }
                newHistory.words[word] = [...newHistory.words[word], activation];

                // Update peak activation
                const currentPeak = newHistory.wordPeaks[word] || 0;
                newHistory.wordPeaks[word] = Math.max(currentPeak, activation);
            });

            // Track ALL letters for ALL positions
            const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
            for (let position = 0; position < 4; position++) {
                allLetters.forEach((letter, idx) => {
                    const key = `${letter.toUpperCase()}_pos${position + 1}`;
                    const activation = state.letters[position][idx];
                    if (!newHistory.letters[key]) {
                        newHistory.letters[key] = Array(prev.time.length).fill(null);
                    }
                    newHistory.letters[key] = [...newHistory.letters[key], activation];

                    // Update peak activation
                    const currentPeak = newHistory.letterPeaks[key] || 0;
                    newHistory.letterPeaks[key] = Math.max(currentPeak, activation);
                });
            }

            return newHistory;
        });

        setCurrentStep(prev => prev + 1);

        // Stop at max steps
        if (currentStep >= maxSteps - 1) {
            stopSimulation();
        }
    };

    const startSimulation = () => {
        if (currentStep === 0) {
            resetSimulation();
        }
        setIsRunning(true);
        setIsPaused(false);
    };

    const pauseSimulation = () => {
        setIsPaused(true);
        setIsRunning(false);
    };

    const stopSimulation = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setIsRunning(false);
        setIsPaused(false);
    };

    const stepForward = () => {
        if (currentStep < maxSteps) {
            runStep();
        }
    };

    // Auto-step when running
    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                runStep();
            }, speed);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isPaused, speed, currentStep]);

    // Initialize
    useEffect(() => {
        updateVisualization();
    }, []);

    // Helper to prepare word chart data
    const prepareWordChartData = () => {
        if (history.time.length === 0) return null;

        const datasets = [];

        // Get top 5 words by peak activation
        const wordsByPeak = Object.entries(history.wordPeaks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);

        // Add words based on settings
        Object.entries(history.words).forEach(([word, values]) => {
            const isTracked = trackedWords.includes(word);
            const isTopPeak = wordsByPeak.includes(word);
            const shouldShow =
                (wordChartSettings.showTrackedWords && isTracked) ||
                (wordChartSettings.showTopWords && isTopPeak && !isTracked);

            if (shouldShow) {
                datasets.push({
                    label: word.toUpperCase(),
                    values,
                    type: 'word',
                    isTracked
                });
            }
        });

        return {
            title: 'Word Activations',
            timePoints: history.time,
            maxSteps: maxSteps,
            data: datasets,
            autoScale: wordChartSettings.autoScale,
            showLegend: true
        };
    };

    // Helper to prepare letter pool chart data
    const prepareLetterChartData = (position) => {
        if (history.time.length === 0) return null;

        const datasets = [];
        const settings = letterChartSettings[position];
        const filterLetters = settings.letterFilter.split('').filter(c => /[a-z]/.test(c));

        // Determine which letters to show
        let lettersToShow;
        if (filterLetters.length > 0) {
            lettersToShow = filterLetters;
        } else if (settings.showTopLetters) {
            // Get top N letters by peak activation for this position
            const lettersByPeak = Object.entries(history.letterPeaks)
                .filter(([key]) => key.endsWith(`_pos${position + 1}`))
                .sort((a, b) => b[1] - a[1])
                .slice(0, settings.topN)
                .map(([key]) => key.charAt(0).toLowerCase());
            lettersToShow = lettersByPeak;
        } else {
            // Show all tracked letters
            lettersToShow = Object.keys(history.letters)
                .filter(key => key.endsWith(`_pos${position + 1}`))
                .map(key => key.charAt(0).toLowerCase());
        }

        lettersToShow.forEach(letter => {
            const key = `${letter.toUpperCase()}_pos${position + 1}`;
            if (history.letters[key]) {
                datasets.push({
                    label: letter.toUpperCase(),
                    values: history.letters[key],
                    type: 'letter'
                });
            }
        });

        return {
            title: `Position ${position + 1} Letter Activations`,
            timePoints: history.time,
            maxSteps: maxSteps,
            data: datasets,
            autoScale: settings.autoScale,
            showLegend: datasets.length <= 10
        };
    };

    const toggleLetterChart = (position) => {
        setShowLetterCharts(prev => {
            const newCharts = [...prev];
            newCharts[position] = !newCharts[position];
            return newCharts;
        });
    };

    const updateLetterChartSettings = (position, newSettings) => {
        setLetterChartSettings(prev => {
            const updated = [...prev];
            updated[position] = newSettings;
            return updated;
        });
    };

    const saveChartToGallery = (chartData) => {
        const timestamp = new Date().toLocaleString();
        setSavedCharts(prev => [...prev, { ...chartData, timestamp }]);
    };

    const removeChartFromGallery = (index) => {
        setSavedCharts(prev => prev.filter((_, i) => i !== index));
    };

    const clearGallery = () => {
        if (window.confirm('Are you sure you want to clear all saved charts?')) {
            setSavedCharts([]);
        }
    };

    return (
        <>
            {/* Parameters Drawer */}
            {showParameters && (
                <>
                    <div className="drawer-overlay" onClick={() => setShowParameters(false)} />
                    <div className="drawer drawer-left">
                        <div className="drawer-header">
                            <h3>Parameters</h3>
                            <button className="drawer-close" onClick={() => setShowParameters(false)}>×</button>
                        </div>
                        <div className="drawer-content">
                            <Parameters
                                parameters={parameters}
                                onParametersChange={setParameters}
                                maskEnabled={maskEnabled}
                                onMaskEnabledChange={setMaskEnabled}
                                maskStart={maskStart}
                                onMaskStartChange={setMaskStart}
                                maxSteps={maxSteps}
                                onMaxStepsChange={setMaxSteps}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* About Drawer */}
            {showAbout && (
                <>
                    <div className="drawer-overlay" onClick={() => setShowAbout(false)} />
                    <div className="drawer drawer-left">
                        <div className="drawer-header">
                            <h3>About</h3>
                            <button className="drawer-close" onClick={() => setShowAbout(false)}>×</button>
                        </div>
                        <div className="drawer-content">
                            <div style={{ lineHeight: '1.6' }}>
                                <h4 style={{ marginTop: 0 }}>Interactive Activation Model</h4>
                                <p>
                                    This is an interactive visualization of the Interactive Activation Model
                                    of word recognition, originally developed by McClelland and Rumelhart (1981).
                                </p>

                                <h4>Original Paper</h4>
                                <p>
                                    McClelland, J. L., & Rumelhart, D. E. (1981). An interactive activation model
                                    of context effects in letter perception: I. An account of basic findings.
                                    <em> Psychological Review, 88</em>(5), 375-407.
                                </p>

                                <h4>Credits</h4>
                                <p>
                                    <strong>Development:</strong> Josh de Leeuw, Vassar College
                                </p>
                                <p>
                                    <strong>Coding Assistant:</strong> Claude (Anthropic)
                                </p>

                                <h4>About the Model</h4>
                                <p>
                                    The Interactive Activation Model demonstrates how word recognition emerges
                                    from bidirectional interactions between visual features, letters, and words.
                                    The model exhibits phenomena like the word superiority effect through
                                    these interactive processes.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}


            <div className="simulation-runner">
                <div className="simulation-controls">
                    <div className="control-buttons">
                        {!isRunning && !isPaused && (
                            <button onClick={startSimulation} className="btn-primary">
                                ▶ Start
                            </button>
                        )}
                        {isRunning && (
                            <button onClick={pauseSimulation} className="btn-warning">
                                ⏸ Pause
                            </button>
                        )}
                        {isPaused && (
                            <button onClick={startSimulation} className="btn-primary">
                                ▶ Resume
                            </button>
                        )}
                        <button onClick={stepForward} disabled={isRunning || currentStep >= maxSteps} className="btn-secondary">
                            ⏭ Step
                        </button>
                        <button onClick={resetSimulation} className="btn-danger">
                            ⏹ Reset
                        </button>
                        <button
                            onClick={() => setShowParameters(!showParameters)}
                            className={showParameters ? "btn-toggle active" : "btn-toggle"}
                        >
                            ⚙ Parameters
                        </button>
                        <button
                            onClick={() => setShowGallery(!showGallery)}
                            className={showGallery ? "btn-toggle active" : "btn-toggle"}
                        >
                            🖼 Gallery {savedCharts.length > 0 && `(${savedCharts.length})`}
                        </button>
                    </div>

                    <div className="speed-control">
                        <label htmlFor="speed">Speed:</label>
                        <input
                            id="speed"
                            type="range"
                            min="20"
                            max="500"
                            step="20"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                        />
                        <span>{speed}ms</span>
                    </div>

                    <div className="step-counter">
                        Step: {currentStep} / {maxSteps}
                        {maskEnabled && currentStep >= maskStart && <span className="mask-indicator"> (Masked)</span>}
                    </div>

                    <button
                        onClick={() => setShowAbout(!showAbout)}
                        className="about-icon-btn"
                        title="About this model"
                    >
                        ℹ
                    </button>
                </div>

                <div className="simulation-content">
                    <div className="visualization-panel">
                        <LayerVisualization
                            modelState={modelState}
                            currentStimulus={currentStimulus}
                            wordList={model.wordList}
                            onFeaturesChange={setCustomFeatures}
                            trackedWords={trackedWords}
                            onTrackedWordsChange={setTrackedWords}
                            showWordChart={showWordChart}
                            onToggleWordChart={() => setShowWordChart(!showWordChart)}
                            wordChartData={prepareWordChartData()}
                            wordChartSettings={wordChartSettings}
                            onWordChartSettingsChange={setWordChartSettings}
                            showLetterCharts={showLetterCharts}
                            onToggleLetterChart={toggleLetterChart}
                            prepareLetterChartData={prepareLetterChartData}
                            letterChartSettings={letterChartSettings}
                            onLetterChartSettingsChange={updateLetterChartSettings}
                            onSaveChartToGallery={saveChartToGallery}
                        />
                    </div>

                    {showGallery && (
                        <ChartGallery
                            savedCharts={savedCharts}
                            onRemoveChart={removeChartFromGallery}
                            onClearGallery={clearGallery}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
