import axios from "axios";
import type { RegisterRequestBody } from "../types/register.type";

export const registerRequest = async (body: RegisterRequestBody): Promise<unknown> => {
	const response = await axios.post<unknown>(
		"/api/register",
		body,
		{ withCredentials: true }
	);

	return response.data;
};
