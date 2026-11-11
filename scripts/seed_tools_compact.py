"""Generate compact tool-only then relations SQL."""
from __future__ import annotations

import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("seed", "scripts/seed_known_tools.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

tools = mod.TOOLS
pubs = sorted({t["publisher"] for t in tools})

# Part A: publishers + tools only
a: list[str] = ["begin;"]
for pub in pubs:
    a.append(
        f"insert into publishers (name) values ({mod.sql_str(pub)}) on conflict (name) do nothing;"
    )
for t in tools:
    a.append(
        "insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at) "
        f"select {mod.sql_str(t['name'])}, {mod.sql_str(t['slug'])}, p.id, {mod.sql_str(t['summary'])}, {mod.sql_str(t['description'])}, {mod.sql_str(t['url'])}, "
        f"'published', {mod.sql_str(t['pricing'])}, {mod.sql_str(t['price'])}, {mod.bool_sql(t['api'])}, {mod.bool_sql(t['oss'])}, {mod.bool_sql(t['local'])}, "
        f"{mod.sql_array(t['kw'])}, {mod.sql_array(t['str'])}, {mod.sql_array(t['lim'])}, {mod.sql_array(t['aud'])}, current_date "
        f"from publishers p where p.name = {mod.sql_str(t['publisher'])} "
        "on conflict (slug) do nothing;"
    )
a.append("commit;")
Path("scripts/_seed_A_tools.sql").write_text("\n".join(a) + "\n", encoding="utf-8")

# Part B: types/categories/platforms/sources in smaller batches
batch = 20
for bi in range(0, len(tools), batch):
    chunk = tools[bi : bi + batch]
    b: list[str] = ["begin;"]
    for t in chunk:
        slug = mod.sql_str(t["slug"])
        url = mod.sql_str(t["url"])
        pub = mod.sql_str(t["publisher"])
        typ = mod.sql_str(t["type"])
        b.append(
            f"insert into tool_types (tool_id, solution_type_id, is_primary) "
            f"select t.id, st.id, true from tools t, solution_types st "
            f"where t.slug = {slug} and st.name = {typ} on conflict do nothing;"
        )
        b.append(
            f"insert into sources (url, publisher, source_type, reliability_level) "
            f"values ({url}, {pub}, 'official', 'A') on conflict (url) do nothing;"
        )
        b.append(
            f"insert into tool_sources (tool_id, source_id, claim_key, verified_at) "
            f"select t.id, s.id, 'general', current_date from tools t, sources s "
            f"where t.slug = {slug} and s.url = {url} on conflict do nothing;"
        )
        for idx, cat in enumerate(t["cats"]):
            primary = "true" if idx == 0 else "false"
            b.append(
                f"insert into tool_categories (tool_id, category_id, is_primary) "
                f"select t.id, c.id, {primary} from tools t, categories c "
                f"where t.slug = {slug} and c.name = {mod.sql_str(cat)} on conflict do nothing;"
            )
        for plat in t["plats"]:
            b.append(
                f"insert into tool_platforms (tool_id, platform_id, status) "
                f"select t.id, p.id, 'available' from tools t, platforms p "
                f"where t.slug = {slug} and p.label = {mod.sql_str(plat)} on conflict do nothing;"
            )
    b.append("commit;")
    out = Path(f"scripts/_seed_B_rel_{bi // batch}.sql")
    out.write_text("\n".join(b) + "\n", encoding="utf-8")
    print(out.name, out.stat().st_size)

print("A", Path("scripts/_seed_A_tools.sql").stat().st_size, "tools", len(tools))
