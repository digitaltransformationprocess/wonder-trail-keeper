const fs = require('fs');
const path = 'c:/Users/bilal/Desktop/the new idea/wonder-trail-keeper/scripts';
const outDir =
  'c:/Users/bilal/.cursor/projects/c-Users-bilal-Desktop-the-new-idea-wonder-trail-keeper/agent-tools';
const PART = 2500;

for (const i of [1, 2, 3, 4]) {
  const q = fs.readFileSync(`${path}/_seed_chunk_${i}.sql`, 'utf8');
  const b64 = Buffer.from(q, 'utf8').toString('base64');
  const parts = [];
  for (let n = 0; n * PART < b64.length; n++) {
    parts.push(b64.slice(n * PART, (n + 1) * PART));
  }
  // Write individual part insert files for MCP execute_sql
  fs.mkdirSync(`${outDir}/stage-${i}`, { recursive: true });
  parts.forEach((p, n) => {
    const sql = `insert into _seed_stage(chunk_i, part_n, b64) values (${i},${n},'${p}');`;
    fs.writeFileSync(`${outDir}/stage-${i}/part-${n}.sql`, sql);
  });
  fs.writeFileSync(
    `${outDir}/stage-${i}/meta.json`,
    JSON.stringify({ chunk: i, parts: parts.length, sqlBytes: q.length })
  );
  console.log('chunk', i, 'parts', parts.length);
}
