import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("seed", "scripts/seed_known_tools.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

tools = mod.TOOLS
size = 20
for i in range(0, len(tools), size):
    chunk = tools[i : i + size]
    pubs = sorted({t["publisher"] for t in chunk})
    lines = ["begin;"]
    for pub in pubs:
        lines.append(
            f"insert into publishers (name) values ({mod.sql_str(pub)}) on conflict (name) do nothing;"
        )
    for t in chunk:
        lines.append(
            "insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at) "
            f"select {mod.sql_str(t['name'])}, {mod.sql_str(t['slug'])}, p.id, {mod.sql_str(t['summary'])}, {mod.sql_str(t['description'])}, {mod.sql_str(t['url'])}, "
            f"'published', {mod.sql_str(t['pricing'])}, {mod.sql_str(t['price'])}, {mod.bool_sql(t['api'])}, {mod.bool_sql(t['oss'])}, {mod.bool_sql(t['local'])}, "
            f"{mod.sql_array(t['kw'])}, {mod.sql_array(t['str'])}, {mod.sql_array(t['lim'])}, {mod.sql_array(t['aud'])}, current_date "
            f"from publishers p where p.name = {mod.sql_str(t['publisher'])} "
            "on conflict (slug) do nothing;"
        )
    lines.append("commit;")
    out = Path(f"scripts/_seed_A_{i // size}.sql")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(out.name, len(chunk), out.stat().st_size)
