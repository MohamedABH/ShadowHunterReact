import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../api/Logout.api";
import { clearLoggedIn, clearUsername } from "../utils/auth";

const Logout: React.FC = () => {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const performLogout = async () => {
			try {
				await logoutRequest();
			} catch (err) {
				if (isMounted) {
					setError("Logout failed. Redirecting to login.");
				}
			} finally {
				clearLoggedIn();
				clearUsername();
				try {
					localStorage.clear();
				} catch {
					// Ignore storage errors
				}
				try {
					sessionStorage.clear();
				} catch {
					// Ignore storage errors
				}

				if (isMounted) {
					setTimeout(() => {
						navigate("/login", { replace: true });
					}, 800);
				}
			}
		};

		performLogout();

		return () => {
			isMounted = false;
		};
	}, [navigate]);

	return (
		<main className="logout">
			<section className="logout__card" aria-live="polite">
				<h1>Signing out...</h1>
				{error ? (
					<p className="logout__error">{error}</p>
				) : (
					<p>You are being signed out.</p>
				)}
			</section>
		</main>
	);
};

export default Logout;
