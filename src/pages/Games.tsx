import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGamesList } from "../api/GameList.api";
import type { GameItem } from "../types/gameList.type";
import { joinGame } from "../api/JoinGame.api";
import GameCard from "../components/GameCard";

const Games: React.FC = () => {
  const [games, setGames] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningGameId, setJoiningGameId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted: boolean = true;

    const loadGames = async () => {
      try {
        const data = await getGamesList();
        if (isMounted) {
          setGames(data.games);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load games.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGames();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p>Loading games...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleJoin = async (gameId: number) => {
    setJoiningGameId(gameId);
    setError(null);

    try {
      const data = await joinGame(gameId);
      console.log("Join game response:", data);
    } catch (err) {
      setError("Unable to join the game.");
    } finally {
      setJoiningGameId(null);
    }
  };

  return (
    <section className="games">
      <header className="games__header">
        <h1 className="games__title">Games</h1>
        <Link className="games__create" to="/games/create">
          Create a game
        </Link>
      </header>
      <div className="games__list">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isJoining={joiningGameId === game.id}
            onJoin={handleJoin}
          />
        ))}
      </div>
    </section>
  );
};

export default Games;
