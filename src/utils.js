export function randomElement(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export function randomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// TODO: Is this a reasonable place for this?
export function tileStringify({ r, c }) {
  return `(${r}, ${c})`;
}
