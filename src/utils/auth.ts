const AUTH_KEY = "isLoggedIn";
const USERNAME_KEY = "username";

export const isLoggedIn = () => {
	try {
		return localStorage.getItem(AUTH_KEY) === "true";
	} catch {
		return false;
	}
};

export const setLoggedIn = (value: boolean) => {
	try {
		localStorage.setItem(AUTH_KEY, value ? "true" : "false");
	} catch {
		// Ignore storage errors
	}
	window.dispatchEvent(new Event("auth-changed"));
};

export const clearLoggedIn = () => {
	try {
		localStorage.removeItem(AUTH_KEY);
	} catch {
		// Ignore storage errors
	}
	window.dispatchEvent(new Event("auth-changed"));
};

export const getUsername = () => {
	try {
		return localStorage.getItem(USERNAME_KEY) ?? "";
	} catch {
		return "";
	}
};

export const setUsername = (value: string) => {
	try {
		localStorage.setItem(USERNAME_KEY, value);
	} catch {
		// Ignore storage errors
	}
	window.dispatchEvent(new Event("auth-changed"));
};

export const clearUsername = () => {
	try {
		localStorage.removeItem(USERNAME_KEY);
	} catch {
		// Ignore storage errors
	}
	window.dispatchEvent(new Event("auth-changed"));
};
