import earthquakeImg from './assets/earthquake.svg'
import ArcMap from './components/arcmap.js'
import QuakeSidebar from './components/QuakeSidebar'
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";
import "@esri/calcite-components/components/calcite-input-number";
import './App.css'
import { useState } from 'react';
// API Key: AAPTalEPKKb2quY7ATc-tlx4CmQ..e200lDbT0YgAP7n8NxebapJrwHgmK9z6fFemp-lp7ZmlRXlDwWTbgno_gvJ04HmrJYe540a1cAErMaOB4Lk2AKEuCispXAzkU1r3rvCoLEpFpV4789INbefCY_gaO-3NRCco5jnwqdA40PgRSP05qkv1QiC30Jdxv0oELSG9bRTi6B8A3kUfouvc47Woj6ZXuFCiEhAXEFqyxlT0tzC8mxXmHSLXOI-BmGHpIptAuzReBgRgj0W9aVZ9svnp7UpZNQ..AT1_ySRv5tc7
interface mapProperties
{
  period: string,
  minMag: string
}
const MIN_COUNT = 1;
const MAX_COUNT = 50;

function App() {

  const [properties, setProperties] = useState<mapProperties>({ period: "day", minMag: "all"});
  const [topCount, setTopCount] = useState(10);

  function handleCountUpdate(value: string)
  {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return; // ignore empty/invalid input, keep the last valid count
    setTopCount(Math.min(MAX_COUNT, Math.max(MIN_COUNT, parsed)));
  }

  function handleMagnitudeUpdate(value: string)
  {
    setProperties(prevProperties => ({
      ...prevProperties,
      minMag: value
    }));
  }
  function handlePeriodUpdate(value: string)
  {
    setProperties(prevProperties => ({
      ...prevProperties,
      period: value
    }));
  }
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={earthquakeImg} className="base" width="170" height="170" alt="Earthquake" />
        </div>
        <div className="mb-4">
          <h1>Geographic Information Systems (GIS) Demo</h1>
          <h2>Earthquake Data Tracker</h2>
          <p>
            Click a node to learn more about an Earthquake
          </p>
        </div>
      </section>

      <section id="map-container">
        <div className="flex justify-start items-center">
          <div className="flex flex-col justify-between items-start mr-2">
            <calcite-label>Magnitude</calcite-label>
            <calcite-select label="Magnitude" value={properties.minMag} oncalciteSelectChange={(event) => {
              handleMagnitudeUpdate(event.target.value);
            }}>
              <calcite-option value="all">Any</calcite-option>
              <calcite-option value="1.0">1.0</calcite-option>
              <calcite-option value="2.5">2.5</calcite-option>
              <calcite-option value="4.5">4.5</calcite-option>
              <calcite-option value="significant">Significant</calcite-option>
            </calcite-select>
          </div>
          <div className="flex flex-col justify-between items-start">
            <calcite-label>Period</calcite-label>
            <calcite-select label="Period" value={properties.period} oncalciteSelectChange={(event) => {
              handlePeriodUpdate(event.target.value);
            }}>
              <calcite-option value="hour">Hour</calcite-option>
              <calcite-option value="day">Day</calcite-option>
              <calcite-option value="week">Week</calcite-option>
              <calcite-option value="month">Month</calcite-option>
            </calcite-select>
          </div>
          <div className="flex flex-col justify-between items-start ml-2">
            <calcite-label>Top results</calcite-label>
            <calcite-input-number
              label="Number of earthquakes in the sidebar"
              value={String(topCount)}
              min={MIN_COUNT}
              max={MAX_COUNT}
              step={1}
              integer
              oncalciteInputNumberChange={(event) => {
                handleCountUpdate(event.target.value);
              }}
            ></calcite-input-number>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
          <ArcMap properties={properties}></ArcMap>
          <QuakeSidebar period={properties.period} minMag={properties.minMag} count={topCount} />
        </div>
      </section>
    </>
  )
}

export default App
