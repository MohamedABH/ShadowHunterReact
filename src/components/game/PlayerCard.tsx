const PlayerCard = ({player}) => {

    const COLORS = {
        white: '#ffffff',
        black: '#000000',
        purple: '#7e22ce',
        orange: '#f97316',
        green: '#16a34a',
        blue: '#2563eb',
        red: '#dc2626',
        yellow: '#ffea00',
    }

    return (
        <div style={{ borderColor: COLORS[player.color] }} className="border-4 border-double p-4 rounded-r-lg">
            <h3>{player.username}</h3>
            <p>Damage: {player.currentDamage}</p>
            <p>Equipments:</p>
            <ul>
                {player.equipments.map(equipment => (
                    <li key={equipment.id}>{equipment.name}: {equipment.description}</li>
                ))}
            </ul>
        </div>
    )
}

export default PlayerCard