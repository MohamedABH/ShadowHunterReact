import axios from "axios";

export const turnEnd = async (gameId: string): Promise<unknown> => {
	const response = await axios.post(`/api/game/${gameId}/turn/end`, null, {
		withCredentials: true,
	});

	return response.data;
};
