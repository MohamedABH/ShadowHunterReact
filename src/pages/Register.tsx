import React, { useState } from "react";
import { registerRequest } from "../api/Register.api";

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const data = await registerRequest({ email, username, password });
            console.log("Register response:", data);
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="login">
            <section className="login__card" aria-labelledby="register-title">

                <form className="login__form" noValidate onSubmit={handleSubmit}>
                    <label className="login__label" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="login__input"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

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
                        autoComplete="new-password"
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
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default Register;
