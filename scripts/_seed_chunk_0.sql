do $$
declare
  v_publisher_id uuid;
  v_tool_id uuid;
  v_type_id uuid;
  v_source_id uuid;
  v_cat_id uuid;
  v_plat_id uuid;
begin
  insert into publishers (name) values ('Amazon') on conflict (name) do nothing;
  insert into publishers (name) values ('Apple') on conflict (name) do nothing;
  insert into publishers (name) values ('Character.AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Cohere') on conflict (name) do nothing;
  insert into publishers (name) values ('Groq') on conflict (name) do nothing;
  insert into publishers (name) values ('Inflection AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Meta') on conflict (name) do nothing;
  insert into publishers (name) values ('Microsoft') on conflict (name) do nothing;
  insert into publishers (name) values ('OpenRouter') on conflict (name) do nothing;
  insert into publishers (name) values ('Phind') on conflict (name) do nothing;
  insert into publishers (name) values ('Quora') on conflict (name) do nothing;
  insert into publishers (name) values ('Tabnine') on conflict (name) do nothing;
  insert into publishers (name) values ('Windsurf') on conflict (name) do nothing;
  insert into publishers (name) values ('You.com') on conflict (name) do nothing;
  -- Microsoft Copilot
  select id into v_publisher_id from publishers where name = 'Microsoft';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Microsoft Copilot', 'microsoft-copilot', v_publisher_id,
    'Microsoft''s AI assistant across Windows, Edge, Microsoft 365 and Bing.', 'Copilot helps with writing, research, coding and productivity inside Microsoft products and on the web.', 'https://copilot.microsoft.com',
    'published', 'Freemium', 'Free / Copilot Pro',
    true, false, false,
    ARRAY['assistant', 'microsoft', 'bing']::text[], ARRAY['Deep Microsoft 365 integration', 'Web grounding']::text[], ARRAY['Feature set varies by plan and product']::text[], ARRAY['Professionals', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'microsoft-copilot';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://copilot.microsoft.com', 'Microsoft', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://copilot.microsoft.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
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
  -- Meta AI
  select id into v_publisher_id from publishers where name = 'Meta';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Meta AI', 'meta-ai', v_publisher_id,
    'Meta''s consumer AI assistant powered by Llama models across Meta apps.', 'Meta AI is available in WhatsApp, Messenger, Instagram and on the web for chat, image generation and search-style answers.', 'https://www.meta.ai',
    'published', 'Free', 'Free',
    false, false, false,
    ARRAY['meta', 'llama', 'assistant']::text[], ARRAY['Free access', 'Integrated in Meta apps']::text[], ARRAY['Availability varies by country']::text[], ARRAY['Consumers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'meta-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.meta.ai', 'Meta', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.meta.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
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
  -- Llama
  select id into v_publisher_id from publishers where name = 'Meta';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Llama', 'llama', v_publisher_id,
    'Meta''s family of open-weight large language models.', 'Llama models are widely used for open and self-hosted LLM deployments, fine-tuning and research.', 'https://www.llama.com',
    'published', 'Open source', 'Open weights / commercial terms apply',
    false, true, true,
    ARRAY['llm', 'open-weight', 'meta']::text[], ARRAY['Strong open ecosystem', 'Runnable locally']::text[], ARRAY['License and compute requirements vary by version']::text[], ARRAY['Developers', 'Researchers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'llama';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Model';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.llama.com', 'Meta', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.llama.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Character.AI
  select id into v_publisher_id from publishers where name = 'Character.AI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Character.AI', 'character-ai', v_publisher_id,
    'Chat platform for conversational characters and roleplay personas.', 'Character.AI lets users create and chat with AI characters for entertainment, practice and creative writing.', 'https://character.ai',
    'published', 'Freemium', 'Free / c.ai+',
    false, false, false,
    ARRAY['characters', 'chat', 'roleplay']::text[], ARRAY['Large character ecosystem', 'Engaging conversations']::text[], ARRAY['Not designed as a factual research tool']::text[], ARRAY['Consumers', 'Creators']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'character-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://character.ai', 'Character.AI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://character.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
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
  -- Poe
  select id into v_publisher_id from publishers where name = 'Quora';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Poe', 'poe', v_publisher_id,
    'Multi-bot chat platform aggregating many AI models in one app.', 'Poe by Quora provides access to multiple third-party and custom bots with a shared chat interface and subscriptions.', 'https://poe.com',
    'published', 'Freemium', 'Free / Poe subscription',
    true, false, false,
    ARRAY['multi-model', 'bots', 'quora']::text[], ARRAY['Many models in one place', 'Bot creation']::text[], ARRAY['Usage limits depend on subscription']::text[], ARRAY['Power users', 'Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'poe';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://poe.com', 'Quora', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://poe.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
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
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Pi
  select id into v_publisher_id from publishers where name = 'Inflection AI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Pi', 'pi', v_publisher_id,
    'Personal AI companion focused on supportive conversation.', 'Pi is Inflection''s conversational assistant designed for friendly, helpful everyday dialogue.', 'https://pi.ai',
    'published', 'Free', 'Free',
    false, false, false,
    ARRAY['companion', 'chat']::text[], ARRAY['Natural conversational tone']::text[], ARRAY['Less oriented to heavy productivity workflows']::text[], ARRAY['Consumers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'pi';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://pi.ai', 'Inflection AI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://pi.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
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
  -- You.com
  select id into v_publisher_id from publishers where name = 'You.com';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'You.com', 'you-com', v_publisher_id,
    'AI search engine and assistant with modes for research and writing.', 'You.com combines search and generative answers with apps and agents for productivity tasks.', 'https://you.com',
    'published', 'Freemium', 'Free / Pro',
    true, false, false,
    ARRAY['search', 'assistant']::text[], ARRAY['Search + chat', 'Developer API']::text[], ARRAY['Result quality depends on query and mode']::text[], ARRAY['Researchers', 'Professionals']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'you-com';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://you.com', 'You.com', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://you.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Phind
  select id into v_publisher_id from publishers where name = 'Phind';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Phind', 'phind', v_publisher_id,
    'AI search and coding assistant for developers.', 'Phind specializes in technical answers, code generation and developer-oriented search.', 'https://www.phind.com',
    'published', 'Freemium', 'Free / Pro',
    true, false, false,
    ARRAY['developer', 'search', 'code']::text[], ARRAY['Strong for technical questions']::text[], ARRAY['Best on coding/research use cases']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'phind';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.phind.com', 'Phind', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.phind.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Groq
  select id into v_publisher_id from publishers where name = 'Groq';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Groq', 'groq', v_publisher_id,
    'Ultra-fast LLM inference platform powered by LPU hardware.', 'Groq provides low-latency inference APIs for popular open models.', 'https://groq.com',
    'published', 'Freemium', 'Free tier / paid usage',
    true, false, false,
    ARRAY['inference', 'fast', 'api']::text[], ARRAY['Very low latency', 'Simple API']::text[], ARRAY['Model catalog depends on Groq availability']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'groq';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://groq.com', 'Groq', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://groq.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- OpenRouter
  select id into v_publisher_id from publishers where name = 'OpenRouter';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'OpenRouter', 'openrouter', v_publisher_id,
    'Unified API gateway to many third-party LLMs.', 'OpenRouter routes chat and completion requests across multiple model providers with one API.', 'https://openrouter.ai',
    'published', 'Paid', 'Pay-as-you-go',
    true, false, false,
    ARRAY['gateway', 'multi-model', 'api']::text[], ARRAY['Broad model access', 'Single integration']::text[], ARRAY['Pricing and latency vary by upstream model']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'openrouter';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'API';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://openrouter.ai', 'OpenRouter', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://openrouter.ai';
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
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Cohere
  select id into v_publisher_id from publishers where name = 'Cohere';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Cohere', 'cohere', v_publisher_id,
    'Enterprise LLM platform for RAG, agents and language APIs.', 'Cohere offers Command models, embeddings and tools for building production language applications.', 'https://cohere.com',
    'published', 'Freemium', 'Trial / paid usage',
    true, false, false,
    ARRAY['enterprise', 'rag', 'embeddings']::text[], ARRAY['Enterprise focus', 'RAG tooling']::text[], ARRAY['Best with API integration work']::text[], ARRAY['Enterprises', 'Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'cohere';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://cohere.com', 'Cohere', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://cohere.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Amazon Q
  select id into v_publisher_id from publishers where name = 'Amazon';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Amazon Q', 'amazon-q', v_publisher_id,
    'AWS generative AI assistant for building and business work.', 'Amazon Q helps developers and employees with AWS, coding and workplace questions inside Amazon services.', 'https://aws.amazon.com/q/',
    'published', 'Paid', 'To verify',
    true, false, false,
    ARRAY['aws', 'assistant', 'enterprise']::text[], ARRAY['AWS ecosystem integration']::text[], ARRAY['Centered on Amazon/AWS workflows']::text[], ARRAY['Developers', 'Enterprises']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'amazon-q';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://aws.amazon.com/q/', 'Amazon', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://aws.amazon.com/q/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Apple Intelligence
  select id into v_publisher_id from publishers where name = 'Apple';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Apple Intelligence', 'apple-intelligence', v_publisher_id,
    'On-device and Private Cloud Compute AI features across Apple platforms.', 'Apple Intelligence powers writing tools, image features and system assistants on supported Apple devices.', 'https://www.apple.com/apple-intelligence/',
    'published', 'Free', 'Included on supported devices',
    false, false, true,
    ARRAY['apple', 'on-device', 'privacy']::text[], ARRAY['System-level integration', 'Privacy emphasis']::text[], ARRAY['Requires supported Apple hardware/OS']::text[], ARRAY['Consumers', 'Professionals']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'apple-intelligence';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.apple.com/apple-intelligence/', 'Apple', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.apple.com/apple-intelligence/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Windsurf
  select id into v_publisher_id from publishers where name = 'Windsurf';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Windsurf', 'windsurf', v_publisher_id,
    'AI-native IDE (formerly Codeium) for agentic coding.', 'Windsurf is an AI coding editor focused on cascade-style agents and in-editor assistance.', 'https://windsurf.com',
    'published', 'Freemium', 'Free / Pro',
    false, false, false,
    ARRAY['ide', 'coding-agent', 'codeium']::text[], ARRAY['Agentic editing workflows']::text[], ARRAY['Desktop IDE required']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'windsurf';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://windsurf.com', 'Windsurf', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://windsurf.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
  -- Tabnine
  select id into v_publisher_id from publishers where name = 'Tabnine';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Tabnine', 'tabnine', v_publisher_id,
    'AI code completion assistant with privacy-oriented deployment options.', 'Tabnine provides code completions and chat for IDEs, including team and enterprise controls.', 'https://www.tabnine.com',
    'published', 'Freemium', 'Free / Pro / Enterprise',
    false, false, true,
    ARRAY['autocomplete', 'ide', 'privacy']::text[], ARRAY['IDE coverage', 'Enterprise/privacy options']::text[], ARRAY['Quality depends on project context']::text[], ARRAY['Developers', 'Enterprises']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'tabnine';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Extension';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.tabnine.com', 'Tabnine', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.tabnine.com';
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
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
  end if;
end $$;
