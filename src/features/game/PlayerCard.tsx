import type { Player } from '../../types/gameState.type';
import { PLAYER_COLOR_VALUES, isPlayerColor } from '../../types/playerColor.type';

type PlayerCardProps = {
    player: Player;
};

const PlayerCard = ({ player }: PlayerCardProps) => {

    const borderColor = isPlayerColor(player.color)
        ? PLAYER_COLOR_VALUES[player.color]
        : '#000000';

    return (
        <div style={{ borderColor }} className="border-4 border-double p-4 rounded-r-lg">
            <h3>{player.username}</h3>
            <p>Damage: {player.currentDamage}</p>
            <p>Equipments:</p>
            <ul>
                {player.equipments.map((equipment) => (
                    <li key={equipment.id}>{equipment.name}: {equipment.description}</li>
                ))}
            </ul>
        </div>
    )
}

export default PlayerCard
