import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/Login.api";
import type { LoginResponseBody } from "../types/login.type";
import { setLoggedIn, setUsername as setStoredUsername } from "../utils/auth";

const Login: React.FC = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const data: LoginResponseBody = await loginRequest({ username, password });
			console.log("Login response:", data);
			console.log("Document cookies:", document.cookie);
			setLoggedIn(true);
			setStoredUsername(data?.username ?? username);
			navigate("/games", { replace: true });
		} catch (err) {
			setError("Login failed. Please check your credentials and try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="login">
			<section className="login__card" aria-labelledby="login-title">

				<form className="login__form" noValidate onSubmit={handleSubmit}>
					<label className="login__label" htmlFor="username">
						Username
					</label>
					<input
						className="login__input"
						id="username"
						name="username"
						type="text"
						placeholder="yourname"
						autoComplete="username"
						value={username}
						onChange={(event) => setUsername(event.target.value)}
						required
					/>

					<label className="login__label" htmlFor="password">
						Password
					</label>
					<input
						className="login__input"
						id="password"
						name="password"
						type="password"
						placeholder="••••••••"
						autoComplete="current-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>

					{error ? <p className="login__error">{error}</p> : null}

					<button
						type="submit"
						className="login__submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</button>

				</form>
                
			</section>
		</main>
	);
};

export default Login;
