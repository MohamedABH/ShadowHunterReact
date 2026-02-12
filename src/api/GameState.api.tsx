import axios from "axios";
import type { GameState } from "../types/gameState.type";

export const getGameState = async (): Promise<GameState> => {
	const response = await axios.get("/api/game/state", {
		withCredentials: true,
	});

	return response.data;
};
