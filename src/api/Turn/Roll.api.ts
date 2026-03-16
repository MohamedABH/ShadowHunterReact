import axios from "axios";

export const turnRoll = async (gameId: string): Promise<any> => {
	const response = await axios.post(`/api/game/${gameId}/turn/roll`, null, {
		withCredentials: true,
	});

	return response.data;
};
