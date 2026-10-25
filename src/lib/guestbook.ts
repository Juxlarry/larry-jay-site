// Shared guestbook rules, used by the page and by the API so both validate the same way.
export const COLOURS = [
  ['gold', 'Gold'], ['paper', 'Paper'], ['ink', 'Ink'], ['mint', 'Mint'],
] as const;
export const STICKERS = [
  ['hand-waving', 'Wave'], ['rocket-launch', 'Rocket'], ['lightning', 'Lightning'],
  ['soccer-ball', 'Football'], ['coffee', 'Coffee'], ['heart', 'Heart'], ['star', 'Star'],
] as const;
export const MAX_MESSAGE = 180;
export const MAX_SIGNATURE = 40;

export const isColour = (v: unknown): v is string => COLOURS.some(([c]) => c === v);
export const isSticker = (v: unknown): v is string => STICKERS.some(([s]) => s === v);
