import axios from "axios";
import type { LoginRequestBody, LoginResponseBody } from "../types/login.type";

export const loginRequest = async (
	body: LoginRequestBody
): Promise<LoginResponseBody> => {
	const response = await axios.post<LoginResponseBody>(
		"/api/login",
		body,
		{ withCredentials: true }
	);

	return response.data;
};
