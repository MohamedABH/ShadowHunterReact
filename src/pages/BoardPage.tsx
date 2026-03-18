import Board from "../components/game/Board"
import Chat from "../components/game/Chat"
import Players from "../components/game/Players"

const BoardPage = () => {

    const mockGame = {
        "gameId": 3,
        "gameStatus": "ongoing",
        "turn": 7,
        "turnPhase": "roll",
        "currentTurnRoll": null,
        "currentPlayerId": 11,
        "positions": [
            {
            "id": 13,
            "number": 1,
            "placeCard": {
                "id": 129,
                "name": "Antre de l'ermite",
                "description": "Lorem Ipsum",
                "abilityMessage": "Vous pouvez piocher une carte Vision.",
                "link": "",
                "roll": [
                2,
                3
                ]
            }
            },
            {
            "id": 14,
            "number": 2,
            "placeCard": {
                "id": 130,
                "name": "Porte de l'Outremonde",
                "description": "Lorem Ipsum",
                "abilityMessage": "Vous pouvez piocher une carte de la pile de votre choix.",
                "link": "",
                "roll": [
                4,
                5
                ]
            }
            },
            {
            "id": 15,
            "number": 3,
            "placeCard": {
                "id": 131,
                "name": "Monastère",
                "description": "Lorem Ipsum",
                "abilityMessage": "Vous pouvez piocher une carte Lumière.",
                "link": "",
                "roll": [
                6
                ]
            }
            },
            {
            "id": 16,
            "number": 4,
            "placeCard": {
                "id": 132,
                "name": "Cimetière",
                "description": "Lorem Ipsum",
                "abilityMessage": "Vous pouvez piocher une carte Ténèbres.",
                "link": "",
                "roll": [
                8
                ]
            }
            },
            {
            "id": 17,
            "number": 5,
            "placeCard": {
                "id": 133,
                "name": "Forêt hantée",
                "description": "Lorem Ipsum",
                "abilityMessage": "Le joueur de votre choix peut subir 2 Blessures OU soigner 1 Blessure.",
                "link": "",
                "roll": [
                9
                ]
            }
            },
            {
            "id": 18,
            "number": 6,
            "placeCard": {
                "id": 134,
                "name": "Sanctuaire ancien",
                "description": "Lorem Ipsum",
                "abilityMessage": "Vous pouvez voler une carte équipement à un autre joueur.",
                "link": "",
                "roll": [
                10
                ]
            }
            }
        ],
        "players": [
            {
            "id": 9,
            "username": "admin_setup_test",
            "color": "white",
            "revealed": false,
            "characterCard": null,
            "position": 1,
            "currentDamage": 0,
            "playingOrder": 0,
            "equipments": []
            },
            {
            "id": 10,
            "username": "player1_setup_test",
            "color": "black",
            "revealed": false,
            "characterCard": null,
            "position": 2,
            "currentDamage": 2,
            "playingOrder": 1,
            "equipments": [
                {
                "id": 84,
                "name": "Tronçonneuse du mal",
                "description": "Lorem Ipsum",
                "abilityMessage": "Équipement. Si votre attaque inflige des Blessures, la victime subit 1 Blessure en plus.",
                "link": "",
                "type": "dark",
                "count": 1
                },
                {
                "id": 105,
                "name": "Lance de Longinus",
                "description": "Lorem Ipsum",
                "abilityMessage": "Équipement. Si vous êtes un Hunter et que votre identité est révélée, chaque fois qu'une de vos attaque inflige des Blessures, vous infligez 2 Blessures supplémentaires.",
                "link": "",
                "type": "light",
                "count": 1
                }
            ]
            },
            {
            "id": 11,
            "username": "player2_setup_test",
            "color": "purple",
            "revealed": false,
            "characterCard": null,
            "position": 2,
            "currentDamage": 0,
            "playingOrder": 2,
            "equipments": [
                {
                "id": 69,
                "name": "Vision enivrante",
                "description": "Lorem Ipsum",
                "abilityMessage": "Je pense que tu es Neutre ou Hunter. Si c'est le cas, tu dois: soit me donner une carte équipement, soit subir 1 Blessure.",
                "link": "",
                "type": "sight",
                "count": 2
                }
            ]
            },
            {
            "id": 12,
            "username": "player3_setup_test",
            "color": "orange",
            "revealed": false,
            "characterCard": null,
            "position": 1,
            "currentDamage": 0,
            "playingOrder": 3,
            "equipments": [
                {
                "id": 68,
                "name": "Vision furtive",
                "description": "Lorem Ipsum",
                "abilityMessage": "Je pense que tu es Hunter ou Shadow. Si c'est le cas, tu dois: soit me donner une carte équipement, soit subir 1 Blessure.",
                "link": "",
                "type": "sight",
                "count": 2
                }
            ]
            }
        ]
    }

    const playerPositions = mockGame.players.map(player => ({
        username: player.username,
        color: player.color,
        position: player.position
    }))

    return (
        <div className="board-page flex flex-row gap-4 justify-between w-full py-4">
            <Players players={mockGame.players}></Players>
            <Board positions={ mockGame.positions } playerPositions={playerPositions}></Board>
            <Chat></Chat>
        </div>
    )
}

export default BoardPage