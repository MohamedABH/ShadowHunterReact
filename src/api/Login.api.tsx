import axios from "axios";

export type LoginRequestBody = {
	username: string;
	password: string;
};

export const loginRequest = async (body: LoginRequestBody) => {
	const response = await axios.post(
		"/api/login",
		body
	);

	return response.data;
};
