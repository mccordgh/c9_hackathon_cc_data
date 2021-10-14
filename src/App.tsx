import React, { useEffect, useState } from 'react';

import './App.css';
import { DataProvider } from './services/DataProvider';
import { ChampionList } from './models/Champion';

// region match id prefixes?
// EUN1.json
// EUW1.json
// JP1.json
// KR.json
// NA1.json

const App = () => {
  const [champData, setChampData] = useState<ChampionList>();

  useEffect(() => {
    if (!champData) {
      getChampCcData();
    }
  });

  const getChampCcData = async() => {
    const data = await DataProvider.getChampCcData();

    setChampData(data);
  }

  const renderChampData = () => {
    if (!champData) {
      return (
        <tr>
          <td>
            <h2>Loading Data...</h2>
          </td>
        </tr>
      );
    }

    const getAverage = (a: number, b: number): string => (a / (b / 60)).toFixed(3) + "/m";

    return Object.entries(champData).map(([champ, stats]) => {
      return (
        <tr key={champ}>
          <td className="table--cell-name">{champ}</td>
          <td className="table--cell">{stats.games}</td>
          <td className="table--cell">{stats.assists}</td>
          <td className="table--cell">{stats.timePlayed}</td>
          <td className="table--cell">{stats.timeCCingOthers}</td>
          <td className="table--cell">{getAverage(stats.timeCCingOthers, stats.timePlayed)}</td>
          <td className="table--cell">{stats.totalTimeCCDealt}</td>
          <td className="table--cell">{getAverage(stats.totalTimeCCDealt, stats.timePlayed)}</td>
        </tr>
      )
    })
  }

  return (
    <div className="App">
      <table>
        <tbody>
          <tr>
            <td className="table--header">Champion</td>
            <td className="table--header">Game Played</td>
            <td className="table--header">Assists</td>
            <td className="table--header">Time Played</td>
            <td className="table--header">Time CCing Others</td>
            <td className="table--header">Average Time CCing Others</td>
            <td className="table--header">Total Length of Applied CC</td>
            <td className="table--header">Avg Total Length of CC</td>
          </tr>

          {renderChampData()}
        </tbody>
      </table>
    </div>
  );
}

export default App;
