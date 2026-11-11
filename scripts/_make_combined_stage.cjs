const fs = require('fs');
const path = require('path');
const outDir =
  'c:/Users/bilal/.cursor/projects/c-Users-bilal-Desktop-the-new-idea-wonder-trail-keeper/agent-tools';

for (const i of [1, 2, 3, 4]) {
  const dir = path.join(outDir, `stage-${i}`);
  const parts = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('part-'))
    .sort();
  const sql =
    `delete from _seed_stage where chunk_i = ${i};\n` +
    parts
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8').trim())
      .join('\n');
  fs.writeFileSync(path.join(outDir, `combined-stage-${i}.sql`), sql);
  console.log(i, sql.length);
}
