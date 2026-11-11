const fs = require('fs');
const path = require('path');

const outDir =
  'c:/Users/bilal/.cursor/projects/c-Users-bilal-Desktop-the-new-idea-wonder-trail-keeper/agent-tools';
const PART = 2000;

for (const i of [1, 2, 3, 4]) {
  const q = fs.readFileSync(
    `c:/Users/bilal/Desktop/the new idea/wonder-trail-keeper/scripts/_seed_chunk_${i}.sql`,
    'utf8'
  );
  const b64 = Buffer.from(q, 'utf8').toString('base64');
  const dir = path.join(outDir, `stage-${i}`);
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (let off = 0; off < b64.length; off += PART, n++) {
    const p = b64.slice(off, off + PART);
    const sql = `insert into _seed_stage(chunk_i, part_n, b64) values (${i},${n},'${p}');`;
    fs.writeFileSync(path.join(dir, `part-${String(n).padStart(3, '0')}.sql`), sql);
  }
  fs.writeFileSync(
    path.join(dir, 'meta.json'),
    JSON.stringify({ chunk: i, parts: n, sqlBytes: q.length, b64Bytes: b64.length })
  );
  // Migration that runs reconstructed SQL — records wrapper, not file body.
  // Also write the apply payload that IS the full file contents for MCP.
  fs.writeFileSync(
    path.join(outDir, `apply-chunk-${i}.json`),
    JSON.stringify({ name: `seed_known_tools_chunk_${i}`, query: q })
  );
  console.log(JSON.stringify({ chunk: i, parts: n, sqlBytes: q.length }));
}
