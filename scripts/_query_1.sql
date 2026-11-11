do $$
declare
  v_publisher_id uuid;
  v_tool_id uuid;
  v_type_id uuid;
  v_source_id uuid;
  v_cat_id uuid;
  v_plat_id uuid;
begin
  insert into publishers (name) values ('Adobe') on conflict (name) do nothing;
  insert into publishers (name) values ('Aider') on conflict (name) do nothing;
  insert into publishers (name) values ('Amazon') on conflict (name) do nothing;
  insert into publishers (name) values ('Black Forest Labs') on conflict (name) do nothing;
  insert into publishers (name) values ('Canva') on conflict (name) do nothing;
  insert into publishers (name) values ('Continue') on conflict (name) do nothing;
  insert into publishers (name) values ('Krea') on conflict (name) do nothing;
  insert into publishers (name) values ('Leonardo.Ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Lovable') on conflict (name) do nothing;
  insert into publishers (name) values ('Microsoft') on conflict (name) do nothing;
  insert into publishers (name) values ('Recraft') on conflict (name) do nothing;
  insert into publishers (name) values ('Replit') on conflict (name) do nothing;
  insert into publishers (name) values ('Sourcegraph') on conflict (name) do nothing;
  insert into publishers (name) values ('StackBlitz') on conflict (name) do nothing;
  insert into publishers (name) values ('Vercel') on conflict (name) do nothing;
  -- Cody
  select id into v_publisher_id from publishers where name = 'Sourcegraph';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Cody', 'cody', v_publisher_id,
    'AI coding assistant that uses codebase context from Sourcegraph.', 'Cody helps developers search, explain and write code with awareness of large codebases.', 'https://sourcegraph.com/cody',
    'published', 'Freemium', 'Free / paid plans',
    false, false, false,
    ARRAY['codebase', 'assistant', 'sourcegraph']::text[], ARRAY['Strong codebase context']::text[], ARRAY['Best with Sourcegraph setup']::text[], ARRAY['Developers', 'Enterprises']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'cody';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Extension';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://sourcegraph.com/cody', 'Sourcegraph', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://sourcegraph.com/cody';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'VS Code';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JetBrains';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Continue
  select id into v_publisher_id from publishers where name = 'Continue';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Continue', 'continue-dev', v_publisher_id,
    'Open-source IDE extension to pair-program with local or cloud LLMs.', 'Continue lets developers chat and edit code inside VS Code/JetBrains using configurable model providers.', 'https://continue.dev',
    'published', 'Open source', 'Free',
    false, true, true,
    ARRAY['open-source', 'ide', 'local-llm']::text[], ARRAY['Model flexibility', 'Local-friendly']::text[], ARRAY['Requires model provider configuration']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'continue-dev';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Open source';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://continue.dev', 'Continue', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://continue.dev';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'VS Code';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JetBrains';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Aider
  select id into v_publisher_id from publishers where name = 'Aider';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Aider', 'aider', v_publisher_id,
    'Open-source AI pair programmer that edits code from the terminal.', 'Aider works with git repositories to apply LLM-proposed code changes from a CLI workflow.', 'https://aider.chat',
    'published', 'Open source', 'Free (model costs separate)',
    false, true, true,
    ARRAY['cli', 'git', 'pair-programming']::text[], ARRAY['Git-native workflow', 'Works with many models']::text[], ARRAY['Terminal-centric UX']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'aider';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Open source';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://aider.chat', 'Aider', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://aider.chat';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- v0
  select id into v_publisher_id from publishers where name = 'Vercel';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'v0', 'v0', v_publisher_id,
    'Vercel AI tool for generating UI from natural language prompts.', 'v0 generates React/Tailwind interfaces and iterates on UI with chat.', 'https://v0.dev',
    'published', 'Freemium', 'Free / premium credits',
    false, false, false,
    ARRAY['ui', 'react', 'vercel']::text[], ARRAY['Fast UI prototyping', 'Modern frontend stack']::text[], ARRAY['Focused on web UI generation']::text[], ARRAY['Developers', 'Designers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'v0';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://v0.dev', 'Vercel', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://v0.dev';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Bolt.new
  select id into v_publisher_id from publishers where name = 'StackBlitz';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Bolt.new', 'bolt-new', v_publisher_id,
    'In-browser AI app builder that scaffolds and runs full-stack projects.', 'Bolt.new uses StackBlitz WebContainers so AI can create and iterate on apps directly in the browser.', 'https://bolt.new',
    'published', 'Freemium', 'Free / paid plans',
    false, false, false,
    ARRAY['app-builder', 'webcontainers', 'fullstack']::text[], ARRAY['Instant in-browser runtime']::text[], ARRAY['Browser/runtime constraints apply']::text[], ARRAY['Developers', 'Founders']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'bolt-new';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://bolt.new', 'StackBlitz', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://bolt.new';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Lovable
  select id into v_publisher_id from publishers where name = 'Lovable';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Lovable', 'lovable', v_publisher_id,
    'AI app builder for shipping full-stack web apps from prompts.', 'Lovable generates and edits application UIs and backends through an AI-first builder experience.', 'https://lovable.dev',
    'published', 'Freemium', 'To verify',
    false, false, false,
    ARRAY['app-builder', 'nocode', 'fullstack']::text[], ARRAY['Fast MVP creation']::text[], ARRAY['Best for greenfield web apps']::text[], ARRAY['Founders', 'Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'lovable';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://lovable.dev', 'Lovable', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://lovable.dev';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Replit Ghostwriter
  select id into v_publisher_id from publishers where name = 'Replit';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Replit Ghostwriter', 'replit-ghostwriter', v_publisher_id,
    'Replit''s AI coding features inside the Replit IDE.', 'Ghostwriter / Replit AI assists with completions, explanations and generation inside Replit projects.', 'https://replit.com/ai',
    'published', 'Freemium', 'Included in Replit plans',
    false, false, false,
    ARRAY['replit', 'ide', 'coding']::text[], ARRAY['Integrated cloud IDE']::text[], ARRAY['Tied to Replit environment']::text[], ARRAY['Developers', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'replit-ghostwriter';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://replit.com/ai', 'Replit', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://replit.com/ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Amazon Q Developer
  select id into v_publisher_id from publishers where name = 'Amazon';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Amazon Q Developer', 'amazon-q-developer', v_publisher_id,
    'AWS AI coding assistant formerly known as CodeWhisperer.', 'Amazon Q Developer provides code suggestions, security scanning and AWS-oriented coding help in IDEs.', 'https://aws.amazon.com/q/developer/',
    'published', 'Freemium', 'Free tier / Pro',
    false, false, false,
    ARRAY['aws', 'code-suggestions', 'security']::text[], ARRAY['AWS knowledge', 'Security scans']::text[], ARRAY['Strongest in AWS contexts']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'amazon-q-developer';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Extension';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://aws.amazon.com/q/developer/', 'Amazon', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://aws.amazon.com/q/developer/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'VS Code';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JetBrains';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Leonardo.Ai
  select id into v_publisher_id from publishers where name = 'Leonardo.Ai';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Leonardo.Ai', 'leonardo-ai', v_publisher_id,
    'AI image generation platform with finetuned models and creative tools.', 'Leonardo offers text-to-image generation, model training and assets for game/design workflows.', 'https://leonardo.ai',
    'published', 'Freemium', 'Free tokens / paid plans',
    true, false, false,
    ARRAY['image', 'finetune', 'game-art']::text[], ARRAY['Creative model catalog', 'Asset workflow']::text[], ARRAY['Credit-based usage']::text[], ARRAY['Designers', 'Game creators']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'leonardo-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://leonardo.ai', 'Leonardo.Ai', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://leonardo.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Krea
  select id into v_publisher_id from publishers where name = 'Krea';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Krea', 'krea', v_publisher_id,
    'Real-time and creative AI image generation studio.', 'Krea focuses on interactive image generation and enhancement tools for creatives.', 'https://www.krea.ai',
    'published', 'Freemium', 'To verify',
    false, false, false,
    ARRAY['realtime', 'image', 'creative']::text[], ARRAY['Interactive generation']::text[], ARRAY['Web-first workflow']::text[], ARRAY['Designers', 'Artists']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'krea';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.krea.ai', 'Krea', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.krea.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- FLUX
  select id into v_publisher_id from publishers where name = 'Black Forest Labs';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'FLUX', 'flux', v_publisher_id,
    'High-quality image generation models from Black Forest Labs.', 'FLUX models are used for text-to-image generation via partners and APIs, with open and commercial variants.', 'https://blackforestlabs.ai',
    'published', 'Not disclosed', 'To verify',
    true, true, true,
    ARRAY['flux', 'text-to-image', 'bfl']::text[], ARRAY['Strong image quality', 'Open/commercial options']::text[], ARRAY['Access depends on provider/license']::text[], ARRAY['Developers', 'Creatives']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'flux';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Model';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://blackforestlabs.ai', 'Black Forest Labs', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://blackforestlabs.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Adobe Firefly
  select id into v_publisher_id from publishers where name = 'Adobe';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Adobe Firefly', 'adobe-firefly', v_publisher_id,
    'Adobe''s generative AI image and creative tools integrated into Creative Cloud.', 'Firefly provides generative fill, text-to-image and other creative AI features with commercial-safe positioning by Adobe.', 'https://www.adobe.com/products/firefly.html',
    'published', 'Freemium', 'Free generative credits / Creative Cloud',
    true, false, false,
    ARRAY['adobe', 'generative-fill', 'creative-cloud']::text[], ARRAY['Creative Cloud integration', 'Commercial focus']::text[], ARRAY['Credits and plan limits apply']::text[], ARRAY['Designers', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'adobe-firefly';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.adobe.com/products/firefly.html', 'Adobe', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.adobe.com/products/firefly.html';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Canva Magic Studio
  select id into v_publisher_id from publishers where name = 'Canva';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Canva Magic Studio', 'canva-magic-studio', v_publisher_id,
    'Canva''s suite of generative AI design and content tools.', 'Magic Studio includes Magic Design, Magic Write, background removal and other AI features inside Canva.', 'https://www.canva.com/magic/',
    'published', 'Freemium', 'Free / Canva Pro',
    false, false, false,
    ARRAY['design', 'templates', 'magic-studio']::text[], ARRAY['Easy for non-designers', 'Template ecosystem']::text[], ARRAY['Advanced controls are limited vs pro design tools']::text[], ARRAY['Marketers', 'SMB', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'canva-magic-studio';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.canva.com/magic/', 'Canva', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.canva.com/magic/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Recraft
  select id into v_publisher_id from publishers where name = 'Recraft';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Recraft', 'recraft', v_publisher_id,
    'AI design tool for brand-consistent images, icons and illustrations.', 'Recraft helps teams generate and edit vector/raster graphics with style consistency.', 'https://www.recraft.ai',
    'published', 'Freemium', 'To verify',
    true, false, false,
    ARRAY['vector', 'brand', 'illustration']::text[], ARRAY['Design-system friendly outputs']::text[], ARRAY['To verify for complex print workflows']::text[], ARRAY['Designers', 'Brands']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'recraft';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.recraft.ai', 'Recraft', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.recraft.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Bing Image Creator
  select id into v_publisher_id from publishers where name = 'Microsoft';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Bing Image Creator', 'bing-image-creator', v_publisher_id,
    'Microsoft''s DALL·E-powered image generator in Bing/Copilot.', 'Bing Image Creator generates images from text prompts via Microsoft Copilot/Bing experiences.', 'https://www.bing.com/images/create',
    'published', 'Free', 'Free with Microsoft account',
    false, false, false,
    ARRAY['bing', 'dalle', 'images']::text[], ARRAY['Easy free access']::text[], ARRAY['Boost/credit limits and content filters']::text[], ARRAY['Consumers', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'bing-image-creator';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.bing.com/images/create', 'Microsoft', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.bing.com/images/create';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
end $$;
