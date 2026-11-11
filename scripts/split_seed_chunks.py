import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("seed", "scripts/seed_known_tools.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

all_tools = list(mod.TOOLS)
chunk_size = 15

for i in range(0, len(all_tools), chunk_size):
    chunk = all_tools[i : i + chunk_size]
    pubs = sorted({t["publisher"] for t in chunk})
    lines: list[str] = [
        "do $$",
        "declare",
        "  v_publisher_id uuid;",
        "  v_tool_id uuid;",
        "  v_type_id uuid;",
        "  v_source_id uuid;",
        "  v_cat_id uuid;",
        "  v_plat_id uuid;",
        "begin",
    ]
    for pub in pubs:
        lines.append(
            f"  insert into publishers (name) values ({mod.sql_str(pub)}) on conflict (name) do nothing;"
        )
    for t in chunk:
        lines.append(f"  -- {t['name']}")
        lines.append(
            f"  select id into v_publisher_id from publishers where name = {mod.sql_str(t['publisher'])};"
        )
        lines.append(
            "  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)"
        )
        lines.append("  values (")
        lines.append(
            f"    {mod.sql_str(t['name'])}, {mod.sql_str(t['slug'])}, v_publisher_id,"
        )
        lines.append(
            f"    {mod.sql_str(t['summary'])}, {mod.sql_str(t['description'])}, {mod.sql_str(t['url'])},"
        )
        lines.append(
            f"    'published', {mod.sql_str(t['pricing'])}, {mod.sql_str(t['price'])},"
        )
        lines.append(
            f"    {mod.bool_sql(t['api'])}, {mod.bool_sql(t['oss'])}, {mod.bool_sql(t['local'])},"
        )
        lines.append(
            f"    {mod.sql_array(t['kw'])}, {mod.sql_array(t['str'])}, {mod.sql_array(t['lim'])}, {mod.sql_array(t['aud'])},"
        )
        lines.append("    current_date")
        lines.append("  ) on conflict (slug) do nothing;")
        lines.append(
            f"  select id into v_tool_id from tools where slug = {mod.sql_str(t['slug'])};"
        )
        lines.append("  if v_tool_id is not null then")
        lines.append(
            f"    select id into v_type_id from solution_types where name = {mod.sql_str(t['type'])};"
        )
        lines.append("    if v_type_id is not null then")
        lines.append(
            "      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;"
        )
        lines.append("    end if;")
        lines.append(
            f"    insert into sources (url, publisher, source_type, reliability_level) values ({mod.sql_str(t['url'])}, {mod.sql_str(t['publisher'])}, 'official', 'A') on conflict (url) do nothing;"
        )
        lines.append(
            f"    select id into v_source_id from sources where url = {mod.sql_str(t['url'])};"
        )
        lines.append("    if v_source_id is not null then")
        lines.append(
            "      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;"
        )
        lines.append("    end if;")
        for idx, cat in enumerate(t["cats"]):
            primary = "true" if idx == 0 else "false"
            lines.append(
                f"    select id into v_cat_id from categories where name = {mod.sql_str(cat)};"
            )
            lines.append("    if v_cat_id is not null then")
            lines.append(
                f"      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, {primary}) on conflict do nothing;"
            )
            lines.append("    end if;")
        for plat in t["plats"]:
            lines.append(
                f"    select id into v_plat_id from platforms where label = {mod.sql_str(plat)};"
            )
            lines.append("    if v_plat_id is not null then")
            lines.append(
                "      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;"
            )
            lines.append("    end if;")
        lines.append("  end if;")
    lines.append("end $$;")
    out = Path(f"scripts/_seed_chunk_{i // chunk_size}.sql")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(out.name, len(chunk), out.stat().st_size)
