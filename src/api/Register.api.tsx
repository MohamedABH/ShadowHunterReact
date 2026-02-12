import axios from "axios";
import type { RegisterRequestBody } from "../types/register.type";

export const registerRequest = async (body: RegisterRequestBody) => {
	const response = await axios.post(
		"/api/register",
		body,
		{ withCredentials: true }
	);

	return response.data;
};
