import axios from "axios";

export type GamesJoinResponse = {
	message: string;
	gameId: number;
};

export const joinGame = async (gameId: number): Promise<GamesJoinResponse> => {
	const response = await axios.post(`/api/game/${gameId}/join`);

	return response.data;
};
