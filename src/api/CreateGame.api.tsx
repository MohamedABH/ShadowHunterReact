import axios from "axios";

export type GameCreationResponse = {
	message: string;
	gameId: number;
};

export type GameCreationBody = {
    name: string;
};

export const createGame = async (body: GameCreationBody): Promise<GameCreationResponse> => {
	const response = await axios.post(`/api/game/create`, body);

	return response.data;
};
