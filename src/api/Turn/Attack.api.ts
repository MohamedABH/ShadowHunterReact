import axios from "axios";

export const turnAttack = async (gameId: string): Promise<unknown> => {
	const response = await axios.post(`/api/game/${gameId}/turn/attack`, null, {
		withCredentials: true,
	});

	return response.data;
};
