import React from 'react'
import SimulationRunner from './components/SimulationRunner.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Interactive Activation Model</h1>
        <p>Rumelhart & McClelland's Word Recognition Model</p>
      </header>

      <main className="app-main">
        <SimulationRunner />
      </main>
    </div>
  )
}

export default App
