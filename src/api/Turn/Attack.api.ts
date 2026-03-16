import axios from "axios";

export const turnAttack = async (gameId: string): Promise<any> => {
	const response = await axios.post(`/api/game/${gameId}/turn/attack`, null, {
		withCredentials: true,
	});

	return response.data;
};
