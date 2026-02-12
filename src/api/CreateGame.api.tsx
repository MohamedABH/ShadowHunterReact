import axios from "axios";
import type { GameCreationBody, GameCreationResponse } from "../types/gameCreation.type";

export const createGame = async (body: GameCreationBody): Promise<GameCreationResponse> => {
	const response = await axios.post(
		`/api/game/create`,
		body,
		{ withCredentials: true }
	);

	return response.data;
};
