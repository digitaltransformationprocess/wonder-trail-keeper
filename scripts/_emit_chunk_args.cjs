const fs = require('fs');
const i = Number(process.argv[2]);
const q = fs.readFileSync(
  `c:/Users/bilal/Desktop/the new idea/wonder-trail-keeper/scripts/_seed_chunk_${i}.sql`,
  'utf8'
);
process.stdout.write(JSON.stringify({ name: `seed_known_tools_chunk_${i}`, query: q }));
