import axios from "axios";

export const logoutRequest = async () => {
	const response = await axios.post(
		"/api/logout",
		null,
		{ withCredentials: true }
	);

	return response.data;
};
