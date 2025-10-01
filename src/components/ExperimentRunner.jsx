import React, { useState } from 'react';
import { EXPERIMENTS } from '../experiments/wordSuperiority.js';
import ActivationChart from './ActivationChart.jsx';
import './ExperimentRunner.css';

export default function ExperimentRunner() {
    const [selectedExperiment, setSelectedExperiment] = useState('readVsE');
    const [experimentData, setExperimentData] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const runExperiment = () => {
        setIsRunning(true);
        // Small delay to show loading state
        setTimeout(() => {
            const result = EXPERIMENTS[selectedExperiment].run();
            setExperimentData(result);
            setIsRunning(false);
        }, 100);
    };

    return (
        <div className="experiment-runner">
            <div className="controls">
                <div className="control-group">
                    <label htmlFor="experiment-select">Select Experiment:</label>
                    <select
                        id="experiment-select"
                        value={selectedExperiment}
                        onChange={(e) => setSelectedExperiment(e.target.value)}
                    >
                        {Object.entries(EXPERIMENTS).map(([key, exp]) => (
                            <option key={key} value={key}>
                                {exp.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={runExperiment}
                    disabled={isRunning}
                    className="run-button"
                >
                    {isRunning ? 'Running...' : 'Run Experiment'}
                </button>
            </div>

            <div className="results">
                {experimentData ? (
                    <ActivationChart experimentData={experimentData} />
                ) : (
                    <div className="placeholder">
                        <p>Select an experiment and click "Run Experiment" to see results.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
