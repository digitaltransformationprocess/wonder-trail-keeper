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
  // Batch into groups of 5 inserts (~10KB each batch)
  const batches = [];
  for (let b = 0; b < parts.length; b += 5) {
    const group = parts.slice(b, b + 5);
    const sql = group
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8').trim())
      .join('\n');
    batches.push(sql);
  }
  batches.forEach((sql, idx) => {
    fs.writeFileSync(
      path.join(outDir, `batch-chunk-${i}-${idx}.sql`),
      sql
    );
  });
  // Also write the apply_migration wrapper
  const wrap = `DO $migration$\nDECLARE q text;\nBEGIN\n  SELECT convert_from(decode(string_agg(b64, '' ORDER BY part_n), 'base64'), 'utf8') INTO q\n  FROM _seed_stage WHERE chunk_i = ${i};\n  IF q IS NULL OR length(q) < 100 THEN\n    RAISE EXCEPTION 'missing staged SQL for chunk %', ${i};\n  END IF;\n  EXECUTE q;\nEND\n$migration$;`;
  fs.writeFileSync(path.join(outDir, `wrap-chunk-${i}.sql`), wrap);

  // Full file contents for apply_migration (preferred)
  const full = fs.readFileSync(
    `c:/Users/bilal/Desktop/the new idea/wonder-trail-keeper/scripts/_seed_chunk_${i}.sql`,
    'utf8'
  );
  fs.writeFileSync(
    path.join(outDir, `full-chunk-${i}.sql`),
    full
  );
  console.log(
    JSON.stringify({
      chunk: i,
      batches: batches.length,
      batchSizes: batches.map((s) => s.length),
      fullSize: full.length,
    })
  );
}
