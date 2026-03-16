import axios from "axios";

export const turnPlaceAbility = async (
	gameId: string,
	payload: Record<string, unknown> | null = null,
): Promise<any> => {
	const response = await axios.post(`/api/game/${gameId}/turn/place-ability`, payload, {
		withCredentials: true,
	});

	return response.data;
};
