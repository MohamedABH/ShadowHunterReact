import React from "react";
import type { GameItem } from "../types/gameList.type";

type GameCardProps = {
	game: GameItem;
	isJoining: boolean;
	onJoin: (gameId: number) => void;
};

const GameCard: React.FC<GameCardProps> = ({ game, isJoining, onJoin }) => {
	return (
		<article className="game-card">
			<header className="game-card__header">
				<h2 className="game-card__title">{game.name}</h2>
				<span className="game-card__status">{game.status}</span>
			</header>
			<div className="game-card__meta">
				<span className="game-card__id">ID: {game.id}</span>
				<span className="game-card__players">Players: {game.playerCount}</span>
			</div>
			<div className="game-card__actions">
				{game.status === "pending" ? (
					<button
						type="button"
						className="game-card__join"
						onClick={() => onJoin(game.id)}
						disabled={isJoining}
					>
						{isJoining ? "Joining..." : "Join"}
					</button>
				) : (
					<span className="game-card__inactive">Unavailable</span>
				)}
			</div>
		</article>
	);
};

export default GameCard;
