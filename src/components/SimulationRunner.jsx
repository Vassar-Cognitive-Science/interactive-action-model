import React, { useState, useEffect, useRef } from 'react';
import { InteractiveActivationModel } from '../core/IAModel.js';
import LayerVisualization from './LayerVisualization.jsx';
import ActivationChart from './ActivationChart.jsx';
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
    const [maxSteps, setMaxSteps] = useState(50);
    const [maskStart, setMaskStart] = useState(20);
    const [speed, setSpeed] = useState(100); // ms per step
    const [modelState, setModelState] = useState(null);
    const [currentStimulus, setCurrentStimulus] = useState(null);
    const [history, setHistory] = useState({ time: [], words: {} });
    const [showParameters, setShowParameters] = useState(false);
    const [trackedWords, setTrackedWords] = useState([]);
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
        setHistory({ time: [], words: {} });
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

        // Track top words for chart
        const topWords = model.getTopWords(5);
        setHistory(prev => {
            const newHistory = { ...prev };
            newHistory.time = [...prev.time, currentStep];

            topWords.forEach(({ word, activation }) => {
                if (!newHistory.words[word]) {
                    newHistory.words[word] = [];
                }
                newHistory.words[word].push(activation);
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

    // Prepare chart data
    const chartData = history.time.length > 0 ? {
        title: `Activation Over Time`,
        description: `Showing top ${Object.keys(history.words).length} active words`,
        timePoints: history.time,
        data: Object.entries(history.words).map(([word, values]) => ({
            label: word.toUpperCase(),
            values
        }))
    } : null;

    return (
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

            <div className={`simulation-content ${showParameters ? 'show-parameters' : ''}`}>
                {showParameters && (
                    <div className="parameters-section">
                        <Parameters
                            parameters={parameters}
                            onParametersChange={setParameters}
                            maskStart={maskStart}
                            onMaskStartChange={setMaskStart}
                            maxSteps={maxSteps}
                            onMaxStepsChange={setMaxSteps}
                        />
                    </div>
                )}

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

                {chartData && (
                    <div className="chart-panel">
                        <ActivationChart experimentData={chartData} />
                    </div>
                )}
            </div>
        </div>
    );
}
