import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGamesList, type GameItem } from "../api/GameList.api";
import { joinGame } from "../api/JoinGame.api";

const Games: React.FC = () => {
  const [games, setGames] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningGameId, setJoiningGameId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

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
      <table className="games__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Players</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.name}</td>
              <td>{game.status}</td>
              <td>{game.playerCount}</td>
              <td>
                {game.status === "pending" ? (
                  <button
                    type="button"
                    className="games__join"
                    onClick={() => handleJoin(game.id)}
                    disabled={joiningGameId === game.id}
                  >
                    {joiningGameId === game.id ? "Joining..." : "Join"}
                  </button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default Games;