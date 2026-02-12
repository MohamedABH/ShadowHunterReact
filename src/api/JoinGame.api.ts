import axios from "axios";
import type { JoinGameResponse } from "../types/joinGame.type";

export const joinGame = async (gameId: number): Promise<JoinGameResponse> => {
	const response = await axios.post(
		`/api/game/${gameId}/join`,
		undefined,
		{ withCredentials: true }
	);

	return response.data;
};
