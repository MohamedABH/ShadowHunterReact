export type LoginRequestBody = {
	username: string;
	password: string;
};

export type LoginResponseBody = {
	message: string;
	id: number;
	username: string;
	email: string;
};


