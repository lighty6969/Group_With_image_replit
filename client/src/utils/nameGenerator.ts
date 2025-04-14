// List of adjectives for username generation
const adjectives = [
  'Happy', 'Clever', 'Brave', 'Quiet', 'Friendly', 'Curious', 'Jolly', 'Silly',
  'Cool', 'Busy', 'Cozy', 'Dizzy', 'Fast', 'Fluffy', 'Funny', 'Goofy',
  'Jumpy', 'Lucky', 'Mighty', 'Shiny', 'Snappy', 'Speedy', 'Swift', 'Witty'
];

// List of nouns for username generation
const nouns = [
  'Tiger', 'Penguin', 'Giraffe', 'Koala', 'Dolphin', 'Fox', 'Elephant', 'Bee',
  'Lion', 'Panda', 'Whale', 'Dragon', 'Eagle', 'Hawk', 'Wolf', 'Badger', 
  'Bear', 'Otter', 'Rabbit', 'Hedgehog', 'Owl', 'Sloth', 'Turtle', 'Parrot'
];

/**
 * Generates a random username in the format of AdjectiveNounXX where XX is a number between 1 and 99
 * @returns A randomly generated username
 */
export function generateRandomUsername(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 99) + 1;
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}
