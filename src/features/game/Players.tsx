import PlayerCard from './PlayerCard';
import type { Player } from '../../types/gameState.type';

type PlayersProps = {
    players: Player[];
};

const Players = ({ players }: PlayersProps) => {


    return (
        <div className="flex flex-col">
            {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
            ))}
        </div>
    )
}

export default Players
