import { useState } from "react";
import "./App.css";

export default function App() {
  const [k, setK] = useState(2);
  const [result, setResult] = useState(null);

  const compute = async () => {
    const res = await fetch(`http://127.0.0.1:8000/compute?k=${k}`, {
      method: "POST",
    });
    const data = await res.json();
    setResult(data);
  };

  const renderGrid = () => {
    if (!result) return null;

    const covered = new Set(result.covered);
    const cells = [];
    let id = 1;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        const isCovered = covered.has(id);
        cells.push(
          <div
            key={id}
            className={`cell ${isCovered ? "covered" : "uncovered"}`}
          >
            {id}
          </div>
        );
        id++;
      }
    }

    return <div className="grid">{cells}</div>;
  };

  return (
    <div className="App">
      <header className="header">Weather Station Optimizer</header>

      <div className="card">
        <label>Number of Stations (k):</label>
        <input
          type="number"
          value={k}
          onChange={(e) => setK(e.target.value)}
        />
        <button onClick={compute}>Compute</button>
      </div>

      {result && (
        <div className="results">
          <h2>Chosen Stations</h2>
          <p>{result.chosen.join(", ")}</p>

          <h2>Covered Regions</h2>
          <p>{result.covered.join(", ")}</p>

          {renderGrid()}
        </div>
      )}
    </div>
  );
}
