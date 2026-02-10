import React, { useEffect, useState } from "react";
import { getGamesList, type GameItem } from "../api/Games.api";

const Games: React.FC = () => {
  const [games, setGames] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="games">
      <h1 className="games__title">Games</h1>
      <table className="games__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Players</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.name}</td>
              <td>{game.status}</td>
              <td>{game.playerCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default Games;