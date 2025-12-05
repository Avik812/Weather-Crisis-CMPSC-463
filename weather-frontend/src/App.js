import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [k, setK] = useState(2);
  const [stations, setStations] = useState([{ name: "S1", regions: "1,2,5" }]);
  const [result, setResult] = useState(null);

  // ---- Debounce timer ----
  const [typingTimer, setTypingTimer] = useState(null);

  const addStation = () => {
    setStations([...stations, { name: "", regions: "" }]);
  };

  const updateStation = (index, field, value) => {
    const newStations = [...stations];
    newStations[index][field] = value;
    setStations(newStations);
  };

  // ---- Compute Function ----
  const compute = async () => {
    const formattedStations = {};

    stations.forEach((s) => {
      if (s.name.trim() !== "") {
        formattedStations[s.name] = s.regions
          .split(",")
          .map((x) => Number(x.trim()))
          .filter((x) => !isNaN(x));
      }
    });

    const res = await fetch(`http://127.0.0.1:8000/compute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        k: Number(k),
        stations: formattedStations,
      }),
    });

    const data = await res.json();
    setResult(data);
  };

  // ---- Auto-update whenever inputs change ----
  useEffect(() => {
    // Clear previous timer
    if (typingTimer) clearTimeout(typingTimer);

    // Wait 400ms after user stops typing
    const timer = setTimeout(() => {
      compute();
    }, 400);

    setTypingTimer(timer);
    return () => clearTimeout(timer);

  }, [k, stations]); // recompute when k or stations change

  // ---- Grid Rendering ----
  const renderGrid = () => {
    if (!result) return null;

    const covered = new Set(result.covered);
    const cells = [];
    let id = 1;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        const isCovered = covered.has(id);
        cells.push(
          <div key={id} className={`cell ${isCovered ? "covered" : "uncovered"}`}>
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
        <label>Number of Stations to Choose (k):</label>
        <input type="number" value={k} onChange={(e) => setK(e.target.value)} />

        <h3>Define Weather Stations</h3>

        {stations.map((s, idx) => (
          <div key={idx} className="station-input">
            <input
              placeholder="Station Name (e.g., S1)"
              value={s.name}
              onChange={(e) => updateStation(idx, "name", e.target.value)}
            />
            <input
              placeholder="Covered Regions (e.g., 1,2,5)"
              value={s.regions}
              onChange={(e) => updateStation(idx, "regions", e.target.value)}
            />
          </div>
        ))}

        <button className="add-btn" onClick={addStation}>
          + Add Station
        </button>

        {/* Compute button removed since it's auto-updating */}
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