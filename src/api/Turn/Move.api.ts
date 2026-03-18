import axios from "axios";

type TurnMovePayload = {
	positionNumber: number;
};

export const turnMove = async (gameId: string, payload: TurnMovePayload): Promise<unknown> => {
	const response = await axios.post(`/api/game/${gameId}/turn/move`, payload, {
		withCredentials: true,
	});

	return response.data;
};
