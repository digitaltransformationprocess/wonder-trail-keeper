import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("seed", "scripts/seed_known_tools.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

lines: list[str] = []
for t in mod.TOOLS:
    slug = mod.sql_str(t["slug"])
    typ = mod.sql_str(t["type"])
    cat = mod.sql_str(t["cats"][0])
    lines.append(
        "insert into tool_types (tool_id, solution_type_id, is_primary) "
        f"select t.id, st.id, true from tools t, solution_types st where t.slug = {slug} and st.name = {typ} "
        "on conflict do nothing;"
    )
    lines.append(
        "insert into tool_categories (tool_id, category_id, is_primary) "
        f"select t.id, c.id, true from tools t, categories c where t.slug = {slug} and c.name = {cat} "
        "on conflict do nothing;"
    )

parts = 4
n = (len(lines) + parts - 1) // parts
for i in range(parts):
    chunk = "\n".join(lines[i * n : (i + 1) * n])
    out = Path(f"scripts/_typecat_{i}.sql")
    out.write_text(chunk + "\n", encoding="utf-8")
    print(out.name, out.stat().st_size)
