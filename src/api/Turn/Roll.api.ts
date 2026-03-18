import axios from "axios";

export const turnRoll = async (gameId: string): Promise<unknown> => {
	const response = await axios.post(`/api/game/${gameId}/turn/roll`, null, {
		withCredentials: true,
	});

	return response.data;
};
