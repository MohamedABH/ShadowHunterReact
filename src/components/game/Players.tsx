import PlayerCard from "./PlayerCard"

const Players = ({ players }) => {


    return (
        <div className="flex flex-col">
            {players.map(player => (
                <PlayerCard key={player.id} player={player} />
            ))}
        </div>
    )
}

export default Players