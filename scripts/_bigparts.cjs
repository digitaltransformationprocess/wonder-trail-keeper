const fs = require('fs');
const out =
  'c:/Users/bilal/.cursor/projects/c-Users-bilal-Desktop-the-new-idea-wonder-trail-keeper/agent-tools';
const PART = 12000;

for (const i of [1, 2, 3, 4]) {
  const q = fs.readFileSync(
    `c:/Users/bilal/Desktop/the new idea/wonder-trail-keeper/scripts/_seed_chunk_${i}.sql`,
    'utf8'
  );
  const b64 = Buffer.from(q, 'utf8').toString('base64');
  const dir = `${out}/bigparts-${i}`;
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (let off = 0; off < b64.length; off += PART, n++) {
    const p = b64.slice(off, off + PART);
    const sql = `insert into _seed_stage(chunk_i, part_n, b64) values (${i},${n},'${p}');`;
    fs.writeFileSync(`${dir}/p${n}.sql`, sql);
  }
  // execute reconstructed SQL
  const runSql = `DO $migration$
DECLARE q text;
BEGIN
  SELECT convert_from(decode(string_agg(b64, '' ORDER BY part_n), 'base64'), 'utf8') INTO q
  FROM _seed_stage WHERE chunk_i = ${i};
  IF q IS NULL OR length(q) < 100 THEN
    RAISE EXCEPTION 'missing staged SQL for chunk % (got %)', ${i}, coalesce(length(q),0);
  END IF;
  EXECUTE q;
END
$migration$;`;
  fs.writeFileSync(`${dir}/run.sql`, runSql);
  console.log(JSON.stringify({ chunk: i, parts: n, partBytes: PART, runBytes: runSql.length }));
}
