export const PLAYER_COLORS = [
  'white',
  'black',
  'purple',
  'orange',
  'green',
  'blue',
  'red',
  'yellow',
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const PLAYER_COLOR_VALUES: Record<PlayerColor, string> = {
  white: '#ffffff',
  black: '#000000',
  purple: '#7e22ce',
  orange: '#f97316',
  green: '#16a34a',
  blue: '#2563eb',
  red: '#dc2626',
  yellow: '#ffea00',
};

export const PLAYER_COLOR_INITIALS: Record<PlayerColor, string> = {
  white: 'W',
  black: 'K',
  purple: 'P',
  orange: 'O',
  green: 'G',
  blue: 'B',
  red: 'R',
  yellow: 'Y',
};

export const isPlayerColor = (color: string): color is PlayerColor =>
  PLAYER_COLORS.includes(color as PlayerColor);
