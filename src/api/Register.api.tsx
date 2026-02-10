import axios from "axios";

export type RegisterRequestBody = {
    email: string;
	username: string;
	password: string;
};

export const registerRequest = async (body: RegisterRequestBody) => {
	const response = await axios.post(
		"/api/register",
		body,
		{ withCredentials: true }
	);

	return response.data;
};
