import React, { useState } from "react";
import { createGame } from "../api/CreateGame.api";

const GameCreation: React.FC = () => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await createGame({ name });
      console.log("Create game response:", data);
      setName("");
    } catch (err) {
      setError("Unable to create the game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="game-creation">
      <h1 className="game-creation__title">Create Game</h1>
      <form className="game-creation__form" onSubmit={handleSubmit}>
        <label className="game-creation__label" htmlFor="game-name">
          Game name
        </label>
        <input
          className="game-creation__input"
          id="game-name"
          name="name"
          type="text"
          placeholder="Enter game name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        {error ? <p className="game-creation__error">{error}</p> : null}

        <button
          type="submit"
          className="game-creation__submit"
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting ? "Creating..." : "Create game"}
        </button>
      </form>
    </section>
  );
};

export default GameCreation;
