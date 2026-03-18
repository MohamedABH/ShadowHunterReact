import axios from "axios";

export const logoutRequest = async (): Promise<unknown> => {
	const response = await axios.post<unknown>(
		"/api/logout",
		null,
		{ withCredentials: true }
	);

	return response.data;
};
