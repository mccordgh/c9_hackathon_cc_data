export interface Champion {
	assists: number;
	timeCCingOthers: number;
	timePlayed: number;
	totalTimeCCDealt: number;
	// platformId: string;
}

export interface ChampionList {
	[key: string]: Champion;
}
