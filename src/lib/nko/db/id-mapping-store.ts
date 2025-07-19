import { ObjectId } from '../utils/object-id';

// Map to store string IDs to MongoDB-compatible IDs
const idMappings: Record<string, string> = {};

/**
 * Get MongoDB-compatible ID for a string ID
 */
export function getMongoDbId(stringId: string): string {
  if (!idMappings[stringId]) {
    idMappings[stringId] = ObjectId.generate();
  }
  return idMappings[stringId];
}

/**
 * Get string ID for a MongoDB ID
 */
export function getStringId(mongoId: string): string | undefined {
  for (const [stringId, mappedMongoId] of Object.entries(idMappings)) {
    if (mappedMongoId === mongoId) {
      return stringId;
    }
  }
  return undefined;
}

/**
 * Get all ID mappings
 */
export function getAllMappings(): Record<string, string> {
  return { ...idMappings };
}

// Pre-define some mappings for common lesson IDs
[
  "nko-history",
  "writing-system-basics",
  "nko-modern-world",
  "alphabet-vowels",
  "alphabet-consonants-1",
  "alphabet-consonants-2",
  "nasalized-vowels",
  "tone-marks",
  "hand-positioning",
  "letterforms",
  "digital-input",
  "connected-forms",
  "greetings-introductions",
  "numbers-counting",
  "time-expressions",
  "common-objects",
  "family-relationships",
  "food-dining",
  "travel-transportation",
  "work-education"
].forEach(id => getMongoDbId(id));
