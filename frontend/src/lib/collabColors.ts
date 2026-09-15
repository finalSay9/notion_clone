// A small, deliberately limited palette matching the app's own
// "collaborator cursor" accent colors from the landing page — so the
// live cursors people see while editing feel like the same visual
// language as the rest of the product, not a random rainbow.
const PALETTE = [
  '#e85d4c', // cursor-coral
  '#3e9c6f', // cursor-green
  '#d4a94a', // cursor-amber
  '#5b7fd4', // a soft blue, to round out 4+ simultaneous collaborators
];

export function colorForUser(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
