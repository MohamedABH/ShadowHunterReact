import axios from "axios";

export type GameItem = {
	id: number;
	name: string;
	status: string;
	playerCount: number;
};

export type GamesListResponse = {
	games: GameItem[];
	total: number;
};

export const getGamesList = async (): Promise<GamesListResponse> => {
	const response = await axios.get("/api/game/list", {
		withCredentials: true,
	});

	return response.data;
};
