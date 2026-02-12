export type GameState = {
	gameId: number;
	gameStatus: string;
	turn: number;
	currentPlayerId: number;
	positions: Position[];
	players: Player[];
};

export type Position = {
	id: number;
	number: number;
	placeCard: PlaceCard | null;
};

export type PlaceCard = {
	id: number;
	name: string;
	description: string;
	abilityMessage: string;
	link: string;
	roll: string;
};

export type Player = {
	id: number;
	username: string;
	color: string;
	revealed: boolean;
	characterCard: CharacterCard | null;
	position: number | null;
	currentDamage: number;
	playingOrder: number;
	equipments: ActionCard[];
};

export type CharacterCard = {
	id: number;
	name: string;
	description: string;
	abilityMessage: string;
	link: string;
	type: string;
	maxDamage: number;
	initial: string;
};

export type ActionCard = {
	id: number;
	name: string;
	description: string;
	abilityMessage: string;
	link: string;
	type: string;
	count: number;
};
