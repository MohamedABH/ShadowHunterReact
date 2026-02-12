export type GameItem = {
	id: number;
	name: string;
	status: string;
	playerCount: number;
};

export type GameListResponse = {
	games: GameItem[];
	total: number;
};
