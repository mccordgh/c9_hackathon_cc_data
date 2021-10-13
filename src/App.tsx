import React, { useEffect, useState } from 'react';
import { IBaseApiParams } from 'twisted/dist/base/base.utils';

// import * as matchList1 from "./data/matches/matchlist_na1.json";

import './App.css';
import { RegionGroups, Regions } from 'twisted/dist/constants';
import { ApiResponseDTO, MatchDto, MatchV5DTOs, SummonerV4DTO } from 'twisted/dist/models-dto';
import { DataProvider } from './services/DataProvider';
import { Champion } from './models/Champion';

// region match id prefixes?
// EUN1.json
// EUW1.json
// JP1.json
// KR.json
// NA1.json

const App = () => {
  const [champData, setChampData] = useState<Champion[]>();
  // const [summonerData, setSummonerData] = useState<ApiResponseDTO<SummonerV4DTO>>();

  useEffect(() => {
    if (!champData) {
      getChampCcData();
    }
  //   if (!matchData) {
  //     getMatchData("NA1_4069933342");
  //   }

  //   if (!summonerData) {
  //     getSummonerData("tyler1");
  //   }
  });

  const getChampCcData = async() => {
    DataProvider.getChampCcData();
    // const data: Champion[] = await DataProvider.getChampCcData();

    // setChampData(data);
  }

  // const getSummonerData = async(name: string) => {
  //   const data = await api.Summoner.getByName(name, Settings.region);

  //   console.log({summoner: data});

  //   setSummonerData(data);
  // }

  // const getMatchData = async(id: string) => {
  //   const data = await api.MatchV5.get(id, Settings.regionGroup);

  //   console.log({match: data});

  //   setChampData(data);
  // }


  return (
    <div className="App">
      <h1></h1>
    </div>
  );
}

export default App;
