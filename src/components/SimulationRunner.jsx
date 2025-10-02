import React, { useState, useEffect, useRef } from 'react';
import { InteractiveActivationModel } from '../core/IAModel.js';
import LayerVisualization from './LayerVisualization.jsx';
import ActivationChart from './ActivationChart.jsx';
import ChartSettings from './ChartSettings.jsx';
import Parameters from './Parameters.jsx';
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
    const [maskStart, setMaskStart] = useState(constants.DEFAULT_MASK_START);
    const [speed, setSpeed] = useState(constants.DEFAULT_SPEED); // ms per step
    const [modelState, setModelState] = useState(null);
    const [currentStimulus, setCurrentStimulus] = useState(null);
    const [history, setHistory] = useState({ time: [], words: {}, letters: {} });
    const [showParameters, setShowParameters] = useState(false);
    const [showChartSettings, setShowChartSettings] = useState(false);
    const [trackedWords, setTrackedWords] = useState([]);
    const [chartSettings, setChartSettings] = useState({
        showTopWords: true,
        showTrackedWords: true,
        showLetters: false,
        letterPosition: 0,
        letterFilter: '',
        autoScale: false,
        showLegend: true
    });
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
        setHistory({ time: [], words: {}, letters: {} });
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

        // Use stimulus until maskStart, then ambiguous (0.5) for mask
        const input = currentStep < maskStart ? stimulus :
            [Array(14).fill(0.5), Array(14).fill(0.5), Array(14).fill(0.5), Array(14).fill(0.5)];

        model.stepModel(input, true);
        updateVisualization();

        // Track words and letters for chart
        const topWords = model.getTopWords(5);
        const state = model.getState();

        setHistory(prev => {
            const newHistory = {
                time: [...prev.time, currentStep],
                words: { ...prev.words },
                letters: { ...prev.letters }
            };

            // Track top 5 words
            const recordedWords = new Set();
            topWords.forEach(({ word, activation }) => {
                if (!newHistory.words[word]) {
                    newHistory.words[word] = Array(prev.time.length).fill(null);
                }
                // Don't mutate - create new array (important for React StrictMode)
                newHistory.words[word] = [...newHistory.words[word], activation];
                recordedWords.add(word);
            });

            // Track all tracked words (even if not in top 5)
            trackedWords.forEach(word => {
                // Skip if already recorded in top 5
                if (recordedWords.has(word)) return;

                const wordIndex = model.wordList.indexOf(word);
                const activation = wordIndex >= 0 ? state.words[wordIndex] : 0;
                if (!newHistory.words[word]) {
                    newHistory.words[word] = Array(prev.time.length).fill(null);
                }
                // Don't mutate - create new array (important for React StrictMode)
                newHistory.words[word] = [...newHistory.words[word], activation];
            });

            // Track letter activations for specified position and letters
            if (chartSettings.showLetters && chartSettings.letterFilter) {
                const position = chartSettings.letterPosition;
                const letters = chartSettings.letterFilter.split('').filter(c => /[a-z]/.test(c));

                letters.forEach(letter => {
                    const letterIndex = letter.charCodeAt(0) - 97; // a=0, b=1, etc.
                    if (letterIndex >= 0 && letterIndex < 26) {
                        const key = `${letter.toUpperCase()}_pos${position + 1}`;
                        const activation = state.letters[position][letterIndex];
                        if (!newHistory.letters[key]) {
                            newHistory.letters[key] = Array(prev.time.length).fill(null);
                        }
                        // Don't mutate - create new array (important for React StrictMode)
                        newHistory.letters[key] = [...newHistory.letters[key], activation];
                    }
                });
            }

            // Fill gaps in history for words that aren't currently tracked
            Object.keys(newHistory.words).forEach(word => {
                while (newHistory.words[word].length < newHistory.time.length) {
                    newHistory.words[word] = [...newHistory.words[word], null];
                }
            });

            Object.keys(newHistory.letters).forEach(key => {
                while (newHistory.letters[key].length < newHistory.time.length) {
                    newHistory.letters[key] = [...newHistory.letters[key], null];
                }
            });

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

    // Prepare chart data based on settings
    const chartData = history.time.length > 0 ? (() => {
        const datasets = [];

        // Add words based on settings
        if (chartSettings.showTopWords || chartSettings.showTrackedWords) {
            Object.entries(history.words).forEach(([word, values]) => {
                const isTracked = trackedWords.includes(word);
                const shouldShow =
                    (chartSettings.showTrackedWords && isTracked) ||
                    (chartSettings.showTopWords && !isTracked);

                if (shouldShow) {
                    datasets.push({
                        label: word.toUpperCase(),
                        values,
                        type: 'word',
                        isTracked
                    });
                }
            });
        }

        // Add letter data if enabled
        if (chartSettings.showLetters) {
            Object.entries(history.letters).forEach(([key, values]) => {
                datasets.push({
                    label: key,
                    values,
                    type: 'letter'
                });
            });
        }

        return {
            title: 'Activation Over Time',
            timePoints: history.time,
            maxSteps: maxSteps,
            data: datasets,
            autoScale: chartSettings.autoScale,
            showLegend: chartSettings.showLegend
        };
    })() : null;

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
                                maskStart={maskStart}
                                onMaskStartChange={setMaskStart}
                                maxSteps={maxSteps}
                                onMaxStepsChange={setMaxSteps}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Chart Settings Drawer */}
            {showChartSettings && (
                <>
                    <div className="drawer-overlay" onClick={() => setShowChartSettings(false)} />
                    <div className="drawer drawer-left">
                        <div className="drawer-header">
                            <h3>Chart Settings</h3>
                            <button className="drawer-close" onClick={() => setShowChartSettings(false)}>×</button>
                        </div>
                        <div className="drawer-content">
                            <ChartSettings
                                settings={chartSettings}
                                onSettingsChange={setChartSettings}
                            />
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
                            onClick={() => setShowChartSettings(!showChartSettings)}
                            className={showChartSettings ? "btn-toggle active" : "btn-toggle"}
                        >
                            📊 Chart
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
                        {currentStep >= maskStart && <span className="mask-indicator"> (Masked)</span>}
                    </div>
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
                        />
                    </div>
                </div>

                {(chartData || isRunning || isPaused || currentStep > 0) && (
                    <div className="chart-panel">
                        {chartData ? (
                            <ActivationChart experimentData={chartData} />
                        ) : (
                            <div className="chart-placeholder">
                                <p>Chart will appear here once simulation starts...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
