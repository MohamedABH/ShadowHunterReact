import axios from "axios";
import type { GameListResponse } from "../types/gameList.type";

export const getGamesList = async (): Promise<GameListResponse> => {
	const response = await axios.get<GameListResponse>("/api/game/list", {
		withCredentials: true,
	});

	return response.data;
};
