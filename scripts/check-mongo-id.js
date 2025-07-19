// This utility checks how MongoDB IDs are generated for lesson IDs
function getMongoDatabaseId(stringId) {
  // To make deterministic IDs from string IDs
  let hash = 0;
  for (let i = 0; i < stringId.length; i++) {
    const char = stringId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create a 12-byte hex string (MongoDB ObjectId format)
  let hexString = Math.abs(hash).toString(16).padStart(12, '0');
  if (hexString.length > 12) {
    hexString = hexString.substring(0, 12);
  }
  
  return hexString;
}

const lessonIds = [
  "alphabet-basics",
  "nko-history",
  "alphabet-vowels"
];

lessonIds.forEach(id => {
  console.log(`Lesson: ${id} -> MongoDB ID: ${getMongoDatabaseId(id)}`);
});
