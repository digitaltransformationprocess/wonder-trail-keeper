import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("seed", "scripts/seed_known_tools.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

tools = mod.TOOLS
bs = 8
for i in range(0, len(tools), bs):
    chunk = tools[i : i + bs]
    lines: list[str] = []
    for t in chunk:
        slug = mod.sql_str(t["slug"])
        url = mod.sql_str(t["url"])
        pub = mod.sql_str(t["publisher"])
        typ = mod.sql_str(t["type"])
        lines.append(
            "insert into tool_types (tool_id, solution_type_id, is_primary) "
            f"select t.id, st.id, true from tools t, solution_types st where t.slug = {slug} and st.name = {typ} "
            "on conflict do nothing;"
        )
        lines.append(
            "insert into sources (url, publisher, source_type, reliability_level) "
            f"values ({url}, {pub}, 'official', 'A') on conflict (url) do nothing;"
        )
        lines.append(
            "insert into tool_sources (tool_id, source_id, claim_key, verified_at) "
            f"select t.id, s.id, 'general', current_date from tools t, sources s where t.slug = {slug} and s.url = {url} "
            "on conflict do nothing;"
        )
        for idx, cat in enumerate(t["cats"]):
            primary = "true" if idx == 0 else "false"
            lines.append(
                "insert into tool_categories (tool_id, category_id, is_primary) "
                f"select t.id, c.id, {primary} from tools t, categories c where t.slug = {slug} and c.name = {mod.sql_str(cat)} "
                "on conflict do nothing;"
            )
        for plat in t["plats"]:
            lines.append(
                "insert into tool_platforms (tool_id, platform_id, status) "
                f"select t.id, p.id, 'available' from tools t, platforms p where t.slug = {slug} and p.label = {mod.sql_str(plat)} "
                "on conflict do nothing;"
            )
    out = Path(f"scripts/_rel_{i // bs}.sql")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(out.name, len(chunk), out.stat().st_size)
