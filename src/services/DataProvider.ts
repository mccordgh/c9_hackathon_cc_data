import { LolApi, Constants } from 'twisted';
import { IBaseApiParams } from 'twisted/dist/base/base.utils';
import { RegionGroups, Regions } from 'twisted/dist/constants';
import { ApiResponseDTO, MatchV5DTOs, SummonerV4DTO } from 'twisted/dist/models-dto';
import { MatchQueryV5DTO } from 'twisted/dist/models-dto/matches/query-v5';
import * as apiKey from '../data/apiKey.json';
import { Champion, ChampionList } from '../models/Champion';

const config: IBaseApiParams = {
   rateLimitRetry: false,
   rateLimitRetryAttempts: 1,
   key: apiKey.key,
//    debug: {
//        logTime: true,
//        logUrls: true,
//        logRatelimits: true,
//    },
}

enum MatchIdPrefixes {
  NORTH_AMERICA = "NA1",
}

const Settings = {
  matchIdPrefix: MatchIdPrefixes.NORTH_AMERICA,
  region: Regions.AMERICA_NORTH,
  regionGroup: RegionGroups.AMERICAS,
};

const api = new LolApi(config);

/*
	This class will gather data from api calls and save to json file, or from json file if already exists.
	The functions are just commented out once a json file exists, there is no logic checking for json file before doing request.
*/
export class DataProvider {
	static getMatchData = async() => {
		let final: string[] = [];
		let json: any;

		json = await import('../data/leagues/solo_queue_diamond_I.json');
		final = await DataProvider.addIdsToArray(json, final);

		json = await import('../data/leagues/solo_queue_diamond_II.json');
		final = await DataProvider.addIdsToArray(json, final);

		json = await import('../data/leagues/solo_queue_diamond_III.json');
		final = await DataProvider.addIdsToArray(json, final);

		json = await import('../data/leagues/solo_queue_diamond_VI.json');
		final = await DataProvider.addIdsToArray(json, final);

		this.saveToJsonFile(final, "summoner_id_list.json");
	}

	static getChampCcData = async() => {
	/* steps to get champion cc over several games:
		- grab list of games from /lol/league/v4/entries/{queue}/{tier}/{division}
		-> saved to json files in data/leagues to limit requests on rate-limited dev api key
		- parse all unique summoner id's in that data
		- make call per summoner id to /lol/summoner/v4/summoners/{summonerId} to get puuid
		- use puuid to call /lol/match/v5/matches/by-puuid/{puuid}/ids to get list of match ids
		- make call per match id to /lol/match/v5/matches/{matchId} to get match data
		- parse and separate data by champion.
	*/

		// for now these will make a call and then save a json file (because our api key is rate limited)
		// After json file is saved commenting out function to save calls and next function uses existing json file
		// this.getMatchData();
		// this.getPuuids();
		// this.getMatcheIdsByPuuids();
		this.getChampDataFromMatches();
	}

	private static getChampDataFromMatches = async() => {
		let final: string[] = [];
		let json: any;
		let champions: ChampionList = {};

		let count: number = 0;

		json = await import('../data/matches/match_ids.json');

		for (const item of json.default) {
			count++;
			if (count > 2) break;

			try {
				const match: ApiResponseDTO<MatchV5DTOs.MatchDto> = await api.MatchV5.get(item, Settings.regionGroup);
				
				champions = this.gatherChampDataFromMatchData(champions, match);
				console.log({champions})
			}
			catch (e) {
				break;
			}
		}
	}

	private static gatherChampDataFromMatchData = (champions: ChampionList, matchData: ApiResponseDTO<MatchV5DTOs.MatchDto>): ChampionList => {
		console.log(matchData);
		for (const item of matchData.response.info.participants) {
			if (!champions[item.championName]) {
				champions[item.championName] = {
					assists: item.assists,
					timeCCingOthers: item.timeCCingOthers,
					timePlayed: item.timePlayed,
					totalTimeCCDealt: item.totalTimeCCDealt,
				}
			}
			else {
				champions[item.championName].assists += item.assists;
				champions[item.championName].timeCCingOthers += item.timeCCingOthers;
				champions[item.championName].timePlayed += item.timePlayed;
				champions[item.championName].totalTimeCCDealt += item.totalTimeCCDealt;
			}
		}

		return champions;
	}

	private static getMatcheIdsByPuuids = async() => {
		let final: string[] = [];
		let json: any;

		json = await import('../data/summoners/puuid_list.json');

		for (const item of json.default) {
			try {
				const matches: string[] = await this.getMatchesByPuuid(item);

				if (!matches || matches.length <= 0) {
					break;
				}

				final = final.concat(matches);
			}
			catch (e) {
				break;
			}
		}

		final = final.filter((item, index) => final.indexOf(item) === index);

		this.saveToJsonFile(final, "match_ids.json");
	}

	private static getMatchesByPuuid = async(puuid: string) => {
		const query: MatchQueryV5DTO = {
			count: 100,
			queue: 420, // 420 is queue id for Ranked Solo Queue see https://static.developer.riotgames.com/docs/lol/queues.json
			type: "ranked",
		};

		const data: ApiResponseDTO<string[]> = await api.MatchV5.list(puuid, Settings.regionGroup, query);

		return data.response;
	}

	private static getPuuids = async() => {
		let final: string[] = [];
		let json: any;

		json = await import('../data/summoners/summoner_id_list.json');
		final = await this.getPuuidsFromSummonerIds(json.default);

		this.saveToJsonFile(final, "puuid_list.json");
	}

	private static addIdsToArray = async(json: any, final: string[]) => {
		json.default.forEach((item: any) => {
			if (final.indexOf(item.summonerId) === -1) {
				final.push(item.summonerId);
			}
		});

		return final;
	}

	private static saveToJsonFile = (data: any, filename: string) => {
		const a = document.createElement("a");

		a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json"
		}));

		a.setAttribute("download", filename);

		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
	}

	private static getPuuidsFromSummonerIds = async(summonerIds: string[]): Promise<string[]> => {
		let final: string[] = [];

		for (const item of summonerIds) {
			try {
				const puuid: string = await this.getPuuidFromSummonerId(item);

				if (!puuid) {
					break;
				}

				final.push(puuid);
			}
			catch (e) {
				break;
			}
		}

		return final;
	}

	private static getPuuidFromSummonerId = async(summonerId: string): Promise<string> => {
		const data: ApiResponseDTO<SummonerV4DTO> = await api.Summoner.getById(summonerId, Settings.region);

		return data.response.puuid;
	}
};
