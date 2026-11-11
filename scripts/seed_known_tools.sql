-- Seed well-known AI tools (idempotent by slug)
do $$
declare
  v_publisher_id uuid;
  v_tool_id uuid;
  v_type_id uuid;
  v_source_id uuid;
  v_cat_id uuid;
  v_plat_id uuid;
  v_primary boolean;
begin
  insert into publishers (name) values ('AI21 Labs') on conflict (name) do nothing;
  insert into publishers (name) values ('Adobe') on conflict (name) do nothing;
  insert into publishers (name) values ('Aider') on conflict (name) do nothing;
  insert into publishers (name) values ('Allen Institute for AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Amazon') on conflict (name) do nothing;
  insert into publishers (name) values ('Anthropic') on conflict (name) do nothing;
  insert into publishers (name) values ('Anysphere') on conflict (name) do nothing;
  insert into publishers (name) values ('Apple') on conflict (name) do nothing;
  insert into publishers (name) values ('Black Forest Labs') on conflict (name) do nothing;
  insert into publishers (name) values ('ByteDance') on conflict (name) do nothing;
  insert into publishers (name) values ('Canva') on conflict (name) do nothing;
  insert into publishers (name) values ('Character.AI') on conflict (name) do nothing;
  insert into publishers (name) values ('ChatPDF') on conflict (name) do nothing;
  insert into publishers (name) values ('Chroma') on conflict (name) do nothing;
  insert into publishers (name) values ('Cohere') on conflict (name) do nothing;
  insert into publishers (name) values ('Consensus') on conflict (name) do nothing;
  insert into publishers (name) values ('Continue') on conflict (name) do nothing;
  insert into publishers (name) values ('Copy.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('CrewAI') on conflict (name) do nothing;
  insert into publishers (name) values ('Descript') on conflict (name) do nothing;
  insert into publishers (name) values ('Elicit') on conflict (name) do nothing;
  insert into publishers (name) values ('Fireflies.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Fireworks AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Framer') on conflict (name) do nothing;
  insert into publishers (name) values ('Gamma') on conflict (name) do nothing;
  insert into publishers (name) values ('GitHub') on conflict (name) do nothing;
  insert into publishers (name) values ('Google') on conflict (name) do nothing;
  insert into publishers (name) values ('Grammarly') on conflict (name) do nothing;
  insert into publishers (name) values ('Groq') on conflict (name) do nothing;
  insert into publishers (name) values ('HeyGen') on conflict (name) do nothing;
  insert into publishers (name) values ('Hugging Face') on conflict (name) do nothing;
  insert into publishers (name) values ('Inflection AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Krea') on conflict (name) do nothing;
  insert into publishers (name) values ('Krisp') on conflict (name) do nothing;
  insert into publishers (name) values ('Kuaishou') on conflict (name) do nothing;
  insert into publishers (name) values ('Leonardo.Ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Linear') on conflict (name) do nothing;
  insert into publishers (name) values ('LlamaIndex') on conflict (name) do nothing;
  insert into publishers (name) values ('Lovable') on conflict (name) do nothing;
  insert into publishers (name) values ('Luma AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Make') on conflict (name) do nothing;
  insert into publishers (name) values ('Manus') on conflict (name) do nothing;
  insert into publishers (name) values ('Mem') on conflict (name) do nothing;
  insert into publishers (name) values ('Meta') on conflict (name) do nothing;
  insert into publishers (name) values ('Microsoft') on conflict (name) do nothing;
  insert into publishers (name) values ('Murf.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Notion') on conflict (name) do nothing;
  insert into publishers (name) values ('OpenAI') on conflict (name) do nothing;
  insert into publishers (name) values ('OpenRouter') on conflict (name) do nothing;
  insert into publishers (name) values ('Otter.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Perplexity') on conflict (name) do nothing;
  insert into publishers (name) values ('Phind') on conflict (name) do nothing;
  insert into publishers (name) values ('Pinecone') on conflict (name) do nothing;
  insert into publishers (name) values ('QuillBot') on conflict (name) do nothing;
  insert into publishers (name) values ('Quora') on conflict (name) do nothing;
  insert into publishers (name) values ('Recraft') on conflict (name) do nothing;
  insert into publishers (name) values ('Replicate') on conflict (name) do nothing;
  insert into publishers (name) values ('Replit') on conflict (name) do nothing;
  insert into publishers (name) values ('Significant Gravitas') on conflict (name) do nothing;
  insert into publishers (name) values ('Sourcegraph') on conflict (name) do nothing;
  insert into publishers (name) values ('StackBlitz') on conflict (name) do nothing;
  insert into publishers (name) values ('Suno') on conflict (name) do nothing;
  insert into publishers (name) values ('Synthesia') on conflict (name) do nothing;
  insert into publishers (name) values ('Tabnine') on conflict (name) do nothing;
  insert into publishers (name) values ('Together AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Tome') on conflict (name) do nothing;
  insert into publishers (name) values ('Udio') on conflict (name) do nothing;
  insert into publishers (name) values ('Vercel') on conflict (name) do nothing;
  insert into publishers (name) values ('Weaviate') on conflict (name) do nothing;
  insert into publishers (name) values ('Windsurf') on conflict (name) do nothing;
  insert into publishers (name) values ('Writesonic') on conflict (name) do nothing;
  insert into publishers (name) values ('You.com') on conflict (name) do nothing;
  insert into publishers (name) values ('Zapier') on conflict (name) do nothing;

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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://copilot.microsoft.com', 'Microsoft', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://copilot.microsoft.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.meta.ai', 'Meta', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.meta.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.llama.com', 'Meta', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.llama.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://character.ai', 'Character.AI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://character.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://poe.com', 'Quora', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://poe.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://pi.ai', 'Inflection AI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://pi.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://you.com', 'You.com', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://you.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.phind.com', 'Phind', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.phind.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://groq.com', 'Groq', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://groq.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://openrouter.ai', 'OpenRouter', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://openrouter.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://cohere.com', 'Cohere', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://cohere.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://aws.amazon.com/q/', 'Amazon', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://aws.amazon.com/q/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.apple.com/apple-intelligence/', 'Apple', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.apple.com/apple-intelligence/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://windsurf.com', 'Windsurf', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://windsurf.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.tabnine.com', 'Tabnine', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.tabnine.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'VS Code';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JetBrains';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://sourcegraph.com/cody', 'Sourcegraph', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://sourcegraph.com/cody';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'VS Code';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JetBrains';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://continue.dev', 'Continue', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://continue.dev';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'VS Code';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JetBrains';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://aider.chat', 'Aider', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://aider.chat';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://v0.dev', 'Vercel', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://v0.dev';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://bolt.new', 'StackBlitz', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://bolt.new';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://lovable.dev', 'Lovable', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://lovable.dev';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://replit.com/ai', 'Replit', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://replit.com/ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://aws.amazon.com/q/developer/', 'Amazon', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://aws.amazon.com/q/developer/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'VS Code';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JetBrains';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://leonardo.ai', 'Leonardo.Ai', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://leonardo.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.krea.ai', 'Krea', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.krea.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://blackforestlabs.ai', 'Black Forest Labs', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://blackforestlabs.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.adobe.com/products/firefly.html', 'Adobe', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.adobe.com/products/firefly.html';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.canva.com/magic/', 'Canva', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.canva.com/magic/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.recraft.ai', 'Recraft', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.recraft.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.bing.com/images/create', 'Microsoft', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.bing.com/images/create';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Framer AI
  select id into v_publisher_id from publishers where name = 'Framer';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Framer AI', 'framer-ai', v_publisher_id,
    'AI website generation and editing features inside Framer.', 'Framer AI helps generate site sections and copy while designing production websites in Framer.', 'https://www.framer.com/ai/',
    'published', 'Paid', 'Included in Framer plans',
    false, false, false,
    ARRAY['website', 'no-code', 'framer']::text[], ARRAY['Design-quality web output']::text[], ARRAY['Tied to Framer ecosystem']::text[], ARRAY['Designers', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'framer-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.framer.com/ai/', 'Framer', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.framer.com/ai/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Sora
  select id into v_publisher_id from publishers where name = 'OpenAI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Sora', 'sora', v_publisher_id,
    'OpenAI''s text-to-video generation model and product.', 'Sora generates videos from text prompts and is offered through OpenAI''s consumer/product surfaces where available.', 'https://openai.com/sora',
    'published', 'Paid', 'To verify',
    false, false, false,
    ARRAY['text-to-video', 'openai']::text[], ARRAY['High-profile video quality']::text[], ARRAY['Access and limits vary by rollout']::text[], ARRAY['Creators', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'sora';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Model';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://openai.com/sora', 'OpenAI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://openai.com/sora';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Kling AI
  select id into v_publisher_id from publishers where name = 'Kuaishou';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Kling AI', 'kling-ai', v_publisher_id,
    'Text-to-video and image-to-video generation platform.', 'Kling is a generative video system known for longer clips and cinematic motion, offered via web apps/partners.', 'https://kling.ai',
    'published', 'Freemium', 'To verify',
    false, false, false,
    ARRAY['text-to-video', 'china', 'kling']::text[], ARRAY['Strong motion generation']::text[], ARRAY['Availability/account requirements vary']::text[], ARRAY['Creators']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'kling-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://kling.ai', 'Kuaishou', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://kling.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Luma Dream Machine
  select id into v_publisher_id from publishers where name = 'Luma AI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Luma Dream Machine', 'luma-dream-machine', v_publisher_id,
    'Fast AI video generation from text and images.', 'Dream Machine by Luma generates short videos and supports creative iteration for filmmakers and marketers.', 'https://lumalabs.ai/dream-machine',
    'published', 'Freemium', 'Free / paid plans',
    true, false, false,
    ARRAY['video', 'luma', 'dream-machine']::text[], ARRAY['Accessible video generation']::text[], ARRAY['Clip length/quality depend on plan']::text[], ARRAY['Creators', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'luma-dream-machine';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://lumalabs.ai/dream-machine', 'Luma AI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://lumalabs.ai/dream-machine';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Synthesia
  select id into v_publisher_id from publishers where name = 'Synthesia';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Synthesia', 'synthesia', v_publisher_id,
    'AI video platform for avatar presenters and training content.', 'Synthesia creates talking-head videos from scripts with stock or custom avatars for L&D and marketing.', 'https://www.synthesia.io',
    'published', 'Paid', 'Paid plans',
    true, false, false,
    ARRAY['avatars', 'training', 'enterprise']::text[], ARRAY['Business-ready avatars', 'Multilingual']::text[], ARRAY['Less suited to cinematic open-ended video']::text[], ARRAY['Enterprises', 'L&D', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'synthesia';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.synthesia.io', 'Synthesia', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.synthesia.io';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- HeyGen
  select id into v_publisher_id from publishers where name = 'HeyGen';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'HeyGen', 'heygen', v_publisher_id,
    'AI avatar video generation for marketing and localization.', 'HeyGen turns scripts into presenter videos and supports translation/lip-sync style workflows.', 'https://www.heygen.com',
    'published', 'Freemium', 'Free trial / paid plans',
    true, false, false,
    ARRAY['avatar', 'localization', 'video']::text[], ARRAY['Avatar marketing videos', 'Localization features']::text[], ARRAY['Subscription required for serious volume']::text[], ARRAY['Marketers', 'SMB']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'heygen';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.heygen.com', 'HeyGen', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.heygen.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Descript
  select id into v_publisher_id from publishers where name = 'Descript';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Descript', 'descript', v_publisher_id,
    'AI video/podcast editor with transcription-first editing and Overdub.', 'Descript lets creators edit media by editing text, with AI tools for cleaning audio, avatars and clips.', 'https://www.descript.com',
    'published', 'Freemium', 'Free / paid plans',
    false, false, false,
    ARRAY['transcription', 'podcast', 'overdub']::text[], ARRAY['Text-based editing', 'Strong podcast workflow']::text[], ARRAY['Desktop/web app learning curve']::text[], ARRAY['Creators', 'Podcasters']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'descript';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.descript.com', 'Descript', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.descript.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- CapCut
  select id into v_publisher_id from publishers where name = 'ByteDance';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'CapCut', 'capcut', v_publisher_id,
    'Popular video editor with AI effects, captions and generative features.', 'CapCut is widely used for short-form editing with auto captions, effects and AI-assisted tools.', 'https://www.capcut.com',
    'published', 'Freemium', 'Free / Pro',
    false, false, false,
    ARRAY['short-form', 'captions', 'editor']::text[], ARRAY['Beginner-friendly', 'Strong mobile/desktop apps']::text[], ARRAY['Some features tied to Pro / ecosystem']::text[], ARRAY['Creators', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'capcut';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.capcut.com', 'ByteDance', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.capcut.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Suno
  select id into v_publisher_id from publishers where name = 'Suno';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Suno', 'suno', v_publisher_id,
    'AI music generator that creates songs from text prompts.', 'Suno generates full songs with vocals and instrumentals from simple prompts for creators and hobbyists.', 'https://suno.com',
    'published', 'Freemium', 'Free / Pro',
    false, false, false,
    ARRAY['music', 'songs', 'vocals']::text[], ARRAY['Full-song generation', 'Easy prompting']::text[], ARRAY['Commercial rights depend on plan']::text[], ARRAY['Creators', 'Musicians']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'suno';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://suno.com', 'Suno', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://suno.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Udio
  select id into v_publisher_id from publishers where name = 'Udio';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Udio', 'udio', v_publisher_id,
    'AI music creation platform for generating and extending songs.', 'Udio focuses on high-quality AI music generation and iterative composition.', 'https://www.udio.com',
    'published', 'Freemium', 'To verify',
    false, false, false,
    ARRAY['music', 'composition']::text[], ARRAY['High musical quality']::text[], ARRAY['Usage/plan limits apply']::text[], ARRAY['Creators', 'Musicians']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'udio';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.udio.com', 'Udio', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.udio.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Murf
  select id into v_publisher_id from publishers where name = 'Murf.ai';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Murf', 'murf', v_publisher_id,
    'AI voiceover studio with realistic text-to-speech voices.', 'Murf helps teams create voiceovers for videos, courses and ads using generative speech.', 'https://murf.ai',
    'published', 'Freemium', 'Free trial / paid plans',
    true, false, false,
    ARRAY['tts', 'voiceover', 'studio']::text[], ARRAY['Business voiceover workflow']::text[], ARRAY['Naturalness varies by voice/language']::text[], ARRAY['Marketers', 'L&D']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'murf';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://murf.ai', 'Murf.ai', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://murf.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Krisp
  select id into v_publisher_id from publishers where name = 'Krisp';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Krisp', 'krisp', v_publisher_id,
    'AI noise cancellation and meeting assistant for calls.', 'Krisp removes background noise and provides meeting productivity features like notes/transcripts depending on plan.', 'https://krisp.ai',
    'published', 'Freemium', 'Free / paid plans',
    false, false, false,
    ARRAY['noise-cancellation', 'meetings']::text[], ARRAY['Excellent noise removal']::text[], ARRAY['Desktop app required']::text[], ARRAY['Professionals', 'Remote teams']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'krisp';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://krisp.ai', 'Krisp', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://krisp.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Otter.ai
  select id into v_publisher_id from publishers where name = 'Otter.ai';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Otter.ai', 'otter-ai', v_publisher_id,
    'AI meeting transcription and notes assistant.', 'Otter records/transcribes meetings and generates summaries and action items for teams.', 'https://otter.ai',
    'published', 'Freemium', 'Free / Pro / Business',
    false, false, false,
    ARRAY['transcription', 'meetings', 'notes']::text[], ARRAY['Meeting-centric workflow']::text[], ARRAY['Accuracy depends on audio quality']::text[], ARRAY['Professionals', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'otter-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://otter.ai', 'Otter.ai', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://otter.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Fireflies.ai
  select id into v_publisher_id from publishers where name = 'Fireflies.ai';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Fireflies.ai', 'fireflies', v_publisher_id,
    'AI meeting notetaker that joins calls and summarizes conversations.', 'Fireflies captures meeting audio/transcripts across major video call platforms and surfaces searchable notes.', 'https://fireflies.ai',
    'published', 'Freemium', 'Free / paid plans',
    true, false, false,
    ARRAY['meeting-bot', 'crm', 'notes']::text[], ARRAY['Works across meeting apps', 'Searchable transcript hub']::text[], ARRAY['Bot-in-call workflow may not suit all teams']::text[], ARRAY['Sales', 'Teams']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'fireflies';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://fireflies.ai', 'Fireflies.ai', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://fireflies.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Zapier
  select id into v_publisher_id from publishers where name = 'Zapier';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Zapier', 'zapier', v_publisher_id,
    'Automation platform with AI actions, agents and natural-language zaps.', 'Zapier connects thousands of apps and increasingly uses AI to build workflows and agents across SaaS tools.', 'https://zapier.com',
    'published', 'Freemium', 'Free / paid plans',
    true, false, false,
    ARRAY['automation', 'no-code', 'integrations']::text[], ARRAY['Huge app ecosystem', 'Accessible automation']::text[], ARRAY['Complex logic can get expensive']::text[], ARRAY['SMB', 'Ops', 'Marketers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'zapier';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://zapier.com', 'Zapier', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://zapier.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Make
  select id into v_publisher_id from publishers where name = 'Make';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Make', 'make', v_publisher_id,
    'Visual automation platform (formerly Integromat) with advanced scenarios.', 'Make lets teams build sophisticated multi-step integrations with a visual scenario builder.', 'https://www.make.com',
    'published', 'Freemium', 'Free / paid plans',
    true, false, false,
    ARRAY['automation', 'scenarios', 'integromat']::text[], ARRAY['Powerful visual logic', 'Developer-friendly']::text[], ARRAY['Steeper learning curve than basic zap tools']::text[], ARRAY['Ops', 'Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'make';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.make.com', 'Make', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.make.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- CrewAI
  select id into v_publisher_id from publishers where name = 'CrewAI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'CrewAI', 'crewai', v_publisher_id,
    'Framework for orchestrating multi-agent AI crews.', 'CrewAI helps developers define role-based agents that collaborate on tasks in Python workflows.', 'https://www.crewai.com',
    'published', 'Open source', 'Open source / cloud options',
    true, true, true,
    ARRAY['multi-agent', 'orchestration', 'python']::text[], ARRAY['Agent role abstractions']::text[], ARRAY['Requires engineering to productionize']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'crewai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Framework';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.crewai.com', 'CrewAI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.crewai.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- AutoGPT
  select id into v_publisher_id from publishers where name = 'Significant Gravitas';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'AutoGPT', 'autogpt', v_publisher_id,
    'Open-source autonomous agent project for goal-driven task loops.', 'AutoGPT popularized agent loops that plan and execute tasks with tools and memory components.', 'https://agpt.co',
    'published', 'Open source', 'Free (model costs separate)',
    false, true, true,
    ARRAY['agents', 'autonomous', 'open-source']::text[], ARRAY['Community pioneer', 'Hackable']::text[], ARRAY['Can be unreliable/costly without guardrails']::text[], ARRAY['Developers', 'Researchers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'autogpt';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Open source';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://agpt.co', 'Significant Gravitas', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://agpt.co';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- LlamaIndex
  select id into v_publisher_id from publishers where name = 'LlamaIndex';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'LlamaIndex', 'llamaindex', v_publisher_id,
    'Data framework for building LLM RAG and agent applications.', 'LlamaIndex provides connectors, indexes and query workflows to ground LLMs on private data.', 'https://www.llamaindex.ai',
    'published', 'Open source', 'Open source / cloud',
    true, true, true,
    ARRAY['rag', 'indexing', 'agents']::text[], ARRAY['Rich data connectors', 'RAG abstractions']::text[], ARRAY['Needs engineering ownership']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'llamaindex';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Framework';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.llamaindex.ai', 'LlamaIndex', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.llamaindex.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Pinecone
  select id into v_publisher_id from publishers where name = 'Pinecone';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Pinecone', 'pinecone', v_publisher_id,
    'Managed vector database for semantic search and RAG.', 'Pinecone stores embeddings and serves similarity search for AI applications at scale.', 'https://www.pinecone.io',
    'published', 'Freemium', 'Free tier / paid',
    true, false, false,
    ARRAY['vector-db', 'rag', 'embeddings']::text[], ARRAY['Managed scaling', 'Simple API']::text[], ARRAY['Vendor lock-in vs self-hosted vectors']::text[], ARRAY['Developers', 'Enterprises']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'pinecone';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.pinecone.io', 'Pinecone', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.pinecone.io';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Weaviate
  select id into v_publisher_id from publishers where name = 'Weaviate';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Weaviate', 'weaviate', v_publisher_id,
    'Open-source vector database with hybrid search and cloud offering.', 'Weaviate supports vector and hybrid retrieval for building AI search and RAG systems.', 'https://weaviate.io',
    'published', 'Open source', 'Open source / Weaviate Cloud',
    true, true, true,
    ARRAY['vector-db', 'hybrid-search', 'oss']::text[], ARRAY['Open-source + cloud', 'Hybrid search']::text[], ARRAY['Ops overhead if self-hosting']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'weaviate';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://weaviate.io', 'Weaviate', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://weaviate.io';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Chroma
  select id into v_publisher_id from publishers where name = 'Chroma';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Chroma', 'chroma', v_publisher_id,
    'Developer-friendly open-source embedding database.', 'Chroma is commonly used for local/prototyping RAG pipelines and lightweight vector storage.', 'https://www.trychroma.com',
    'published', 'Open source', 'Free / hosted options',
    true, true, true,
    ARRAY['vector-db', 'local', 'rag']::text[], ARRAY['Easy local DX']::text[], ARRAY['Less battle-tested than managed enterprise DBs at huge scale']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'chroma';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Open source';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.trychroma.com', 'Chroma', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.trychroma.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Hugging Face
  select id into v_publisher_id from publishers where name = 'Hugging Face';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Hugging Face', 'huggingface', v_publisher_id,
    'Central hub for open models, datasets, Spaces and ML tooling.', 'Hugging Face hosts models and apps, plus libraries like Transformers for building AI systems.', 'https://huggingface.co',
    'published', 'Freemium', 'Free / Hub & Inference paid plans',
    true, true, true,
    ARRAY['models', 'transformers', 'datasets']::text[], ARRAY['Largest open model ecosystem', 'Spaces demos']::text[], ARRAY['Quality varies widely across hosted models']::text[], ARRAY['Developers', 'Researchers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'huggingface';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://huggingface.co', 'Hugging Face', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://huggingface.co';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Replicate
  select id into v_publisher_id from publishers where name = 'Replicate';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Replicate', 'replicate', v_publisher_id,
    'API platform to run open-source ML models in the cloud.', 'Replicate lets developers run community models for image, video, audio and text via simple APIs.', 'https://replicate.com',
    'published', 'Paid', 'Pay-per-run',
    true, false, false,
    ARRAY['model-hosting', 'api', 'oss-models']::text[], ARRAY['Easy model APIs', 'Broad model zoo']::text[], ARRAY['Cost can grow with heavy usage']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'replicate';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://replicate.com', 'Replicate', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://replicate.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Together AI
  select id into v_publisher_id from publishers where name = 'Together AI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Together AI', 'together-ai', v_publisher_id,
    'Fast inference and training cloud for open models.', 'Together AI provides APIs and infrastructure to run and fine-tune open-source LLMs.', 'https://www.together.ai',
    'published', 'Paid', 'Usage-based',
    true, false, false,
    ARRAY['inference', 'open-models', 'fine-tune']::text[], ARRAY['Open-model focus', 'Developer API']::text[], ARRAY['Requires account/billing setup']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'together-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.together.ai', 'Together AI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.together.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Fireworks AI
  select id into v_publisher_id from publishers where name = 'Fireworks AI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Fireworks AI', 'fireworks-ai', v_publisher_id,
    'Production inference platform for open and custom models.', 'Fireworks offers low-latency inference APIs and deployment tooling for generative models.', 'https://fireworks.ai',
    'published', 'Paid', 'Usage-based',
    true, false, false,
    ARRAY['inference', 'serverless', 'api']::text[], ARRAY['Production inference focus']::text[], ARRAY['Paid platform']::text[], ARRAY['Developers', 'Enterprises']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'fireworks-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://fireworks.ai', 'Fireworks AI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://fireworks.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Vercel AI SDK
  select id into v_publisher_id from publishers where name = 'Vercel';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Vercel AI SDK', 'vercel-ai-sdk', v_publisher_id,
    'TypeScript SDK for building AI products with streaming UIs.', 'The Vercel AI SDK standardizes model integrations and helpers for chat UIs across providers.', 'https://sdk.vercel.ai',
    'published', 'Open source', 'Free (provider costs separate)',
    true, true, false,
    ARRAY['typescript', 'streaming', 'sdk']::text[], ARRAY['Great frontend DX', 'Provider adapters']::text[], ARRAY['Centered on JS/TS apps']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'vercel-ai-sdk';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Framework';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://sdk.vercel.ai', 'Vercel', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://sdk.vercel.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Notion AI
  select id into v_publisher_id from publishers where name = 'Notion';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Notion AI', 'notion-ai', v_publisher_id,
    'AI writing, summarization and Q&A features inside Notion workspaces.', 'Notion AI helps draft content, summarize notes and answer questions over workspace pages.', 'https://www.notion.com/product/ai',
    'published', 'Paid', 'Add-on / included in some plans',
    false, false, false,
    ARRAY['notes', 'workspace', 'writing']::text[], ARRAY['Native Notion context']::text[], ARRAY['Requires Notion workspace']::text[], ARRAY['Teams', 'Professionals']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'notion-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.notion.com/product/ai', 'Notion', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.notion.com/product/ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Gamma
  select id into v_publisher_id from publishers where name = 'Gamma';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Gamma', 'gamma', v_publisher_id,
    'AI tool for generating presentations, docs and webpages.', 'Gamma creates polished decks and documents from prompts with fast restyling and editing.', 'https://gamma.app',
    'published', 'Freemium', 'Free / Plus / Pro',
    false, false, false,
    ARRAY['presentations', 'docs', 'slides']::text[], ARRAY['Beautiful defaults', 'Fast deck generation']::text[], ARRAY['Less ideal for highly custom brand systems']::text[], ARRAY['Professionals', 'Marketers', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'gamma';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://gamma.app', 'Gamma', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://gamma.app';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Tome
  select id into v_publisher_id from publishers where name = 'Tome';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Tome', 'tome', v_publisher_id,
    'AI-native storytelling and presentation format.', 'Tome generates narrative presentations and visual stories from prompts.', 'https://tome.app',
    'published', 'Freemium', 'To verify',
    false, false, false,
    ARRAY['presentations', 'storytelling']::text[], ARRAY['Narrative-first decks']::text[], ARRAY['Feature set has evolved over time']::text[], ARRAY['Professionals', 'Founders']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'tome';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://tome.app', 'Tome', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://tome.app';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Copy.ai
  select id into v_publisher_id from publishers where name = 'Copy.ai';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Copy.ai', 'copy-ai', v_publisher_id,
    'AI go-to-market platform for sales and marketing content workflows.', 'Copy.ai generates marketing copy and GTM workflows using AI agents and templates.', 'https://www.copy.ai',
    'published', 'Freemium', 'Free / paid plans',
    true, false, false,
    ARRAY['copywriting', 'gtm', 'sales']::text[], ARRAY['GTM workflow focus']::text[], ARRAY['Output needs brand editing']::text[], ARRAY['Marketers', 'Sales']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'copy-ai';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.copy.ai', 'Copy.ai', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.copy.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Writesonic
  select id into v_publisher_id from publishers where name = 'Writesonic';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Writesonic', 'writesonic', v_publisher_id,
    'AI writing and SEO content platform.', 'Writesonic helps create articles, ads and SEO-oriented content with templates and assistants.', 'https://writesonic.com',
    'published', 'Freemium', 'Free trial / paid plans',
    true, false, false,
    ARRAY['seo', 'copywriting', 'articles']::text[], ARRAY['SEO content tooling']::text[], ARRAY['Quality varies; human edit recommended']::text[], ARRAY['Marketers', 'SMB']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'writesonic';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://writesonic.com', 'Writesonic', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://writesonic.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Grammarly
  select id into v_publisher_id from publishers where name = 'Grammarly';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Grammarly', 'grammarly', v_publisher_id,
    'AI writing assistant for grammar, tone and clarity across apps.', 'Grammarly offers writing suggestions, rewrites and generative help in browser and desktop integrations.', 'https://www.grammarly.com',
    'published', 'Freemium', 'Free / Premium / Business',
    true, false, false,
    ARRAY['grammar', 'tone', 'writing']::text[], ARRAY['Ubiquitous integrations', 'Strong editing UX']::text[], ARRAY['Generative depth below full chat LLMs']::text[], ARRAY['Professionals', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'grammarly';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Extension';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.grammarly.com', 'Grammarly', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.grammarly.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'iOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Android';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- QuillBot
  select id into v_publisher_id from publishers where name = 'QuillBot';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'QuillBot', 'quillbot', v_publisher_id,
    'Paraphrasing and academic writing assistant.', 'QuillBot provides paraphrasing, grammar checking and summarization tools popular with students and writers.', 'https://quillbot.com',
    'published', 'Freemium', 'Free / Premium',
    false, false, false,
    ARRAY['paraphrase', 'grammar', 'academic']::text[], ARRAY['Easy paraphrasing modes']::text[], ARRAY['Not a full research agent']::text[], ARRAY['Students', 'Writers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'quillbot';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://quillbot.com', 'QuillBot', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://quillbot.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Wordtune
  select id into v_publisher_id from publishers where name = 'AI21 Labs';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Wordtune', 'wordtune', v_publisher_id,
    'AI rewriting tool for clearer and more natural sentences.', 'Wordtune helps rewrite selected text for tone and clarity in place.', 'https://www.wordtune.com',
    'published', 'Freemium', 'Free / Premium',
    false, false, false,
    ARRAY['rewrite', 'tone', 'ai21']::text[], ARRAY['Inline rewriting']::text[], ARRAY['Focused on sentence/paragraph rewrite']::text[], ARRAY['Professionals', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'wordtune';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Extension';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.wordtune.com', 'AI21 Labs', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.wordtune.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Mem
  select id into v_publisher_id from publishers where name = 'Mem';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Mem', 'mem', v_publisher_id,
    'AI notes app that organizes knowledge automatically.', 'Mem captures notes and uses AI to resurface relevant information without heavy manual organization.', 'https://mem.ai',
    'published', 'Paid', 'To verify',
    false, false, false,
    ARRAY['notes', 'knowledge', 'second-brain']::text[], ARRAY['Low-friction capture']::text[], ARRAY['Smaller ecosystem than Notion']::text[], ARRAY['Professionals']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'mem';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://mem.ai', 'Mem', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://mem.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Perplexity Pages
  select id into v_publisher_id from publishers where name = 'Perplexity';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Perplexity Pages', 'perplexity-pages', v_publisher_id,
    'AI-assisted long-form pages created from Perplexity research.', 'Pages lets users turn research threads into structured articles with citations-oriented workflow.', 'https://www.perplexity.ai/pages',
    'published', 'Freemium', 'Depends on Perplexity plan',
    false, false, false,
    ARRAY['research', 'articles', 'citations']::text[], ARRAY['Research-to-article flow']::text[], ARRAY['Tied to Perplexity ecosystem']::text[], ARRAY['Researchers', 'Writers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'perplexity-pages';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.perplexity.ai/pages', 'Perplexity', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.perplexity.ai/pages';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- ChatPDF
  select id into v_publisher_id from publishers where name = 'ChatPDF';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'ChatPDF', 'chatpdf', v_publisher_id,
    'Chat with PDF documents using AI Q&A.', 'ChatPDF lets users upload PDFs and ask questions grounded in the document content.', 'https://www.chatpdf.com',
    'published', 'Freemium', 'Free / Plus',
    true, false, false,
    ARRAY['pdf', 'rag', 'documents']::text[], ARRAY['Simple PDF Q&A']::text[], ARRAY['Large/complex docs may need chunk care']::text[], ARRAY['Students', 'Professionals']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'chatpdf';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.chatpdf.com', 'ChatPDF', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.chatpdf.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Consensus
  select id into v_publisher_id from publishers where name = 'Consensus';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Consensus', 'consensus', v_publisher_id,
    'AI search engine for scientific research papers.', 'Consensus answers questions using academic papers and highlights evidence-oriented results.', 'https://consensus.app',
    'published', 'Freemium', 'Free / Premium',
    false, false, false,
    ARRAY['science', 'papers', 'evidence']::text[], ARRAY['Academic focus']::text[], ARRAY['Coverage limited to indexed literature']::text[], ARRAY['Researchers', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'consensus';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://consensus.app', 'Consensus', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://consensus.app';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Elicit
  select id into v_publisher_id from publishers where name = 'Elicit';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Elicit', 'elicit', v_publisher_id,
    'AI research assistant for literature review workflows.', 'Elicit helps find papers, extract findings and structure literature reviews with AI.', 'https://elicit.com',
    'published', 'Freemium', 'Free / paid plans',
    false, false, false,
    ARRAY['literature-review', 'papers', 'research']::text[], ARRAY['Research workflow tooling']::text[], ARRAY['Not a substitute for domain expertise']::text[], ARRAY['Researchers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'elicit';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://elicit.com', 'Elicit', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://elicit.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Semantic Scholar
  select id into v_publisher_id from publishers where name = 'Allen Institute for AI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Semantic Scholar', 'semantic-scholar', v_publisher_id,
    'AI-augmented academic search engine and paper graph.', 'Semantic Scholar indexes scientific literature with AI-assisted discovery features and APIs.', 'https://www.semanticscholar.org',
    'published', 'Free', 'Free',
    true, false, false,
    ARRAY['papers', 'academic-search', 'allenai']::text[], ARRAY['Strong scholarly index', 'API access']::text[], ARRAY['Discovery, not full-text generation']::text[], ARRAY['Researchers', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'semantic-scholar';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://www.semanticscholar.org', 'Allen Institute for AI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.semanticscholar.org';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- GitHub Models
  select id into v_publisher_id from publishers where name = 'GitHub';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'GitHub Models', 'github-models', v_publisher_id,
    'GitHub playground and API access for popular AI models.', 'GitHub Models lets developers try and integrate models in the GitHub ecosystem.', 'https://github.com/marketplace/models',
    'published', 'Freemium', 'To verify',
    true, false, false,
    ARRAY['github', 'models', 'playground']::text[], ARRAY['Native GitHub workflow']::text[], ARRAY['Model availability evolves']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'github-models';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Platform';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://github.com/marketplace/models', 'GitHub', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://github.com/marketplace/models';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Gemini CLI
  select id into v_publisher_id from publishers where name = 'Google';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Gemini CLI', 'gemini-cli', v_publisher_id,
    'Command-line interface to use Gemini models in developer workflows.', 'Gemini CLI brings Google Gemini assistance into terminal-centric development workflows.', 'https://github.com/google-gemini/gemini-cli',
    'published', 'Free', 'Free (API usage may apply)',
    true, true, false,
    ARRAY['cli', 'gemini', 'google']::text[], ARRAY['Terminal-native Gemini access']::text[], ARRAY['Requires Google AI credentials']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'gemini-cli';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://github.com/google-gemini/gemini-cli', 'Google', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://github.com/google-gemini/gemini-cli';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Linux';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Claude Artifacts
  select id into v_publisher_id from publishers where name = 'Anthropic';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Claude Artifacts', 'claude-artifacts', v_publisher_id,
    'Interactive artifact canvases inside Claude for apps, docs and visuals.', 'Artifacts let Claude users iterate on generated apps, documents and components in a side panel experience.', 'https://claude.ai',
    'published', 'Freemium', 'Included with Claude plans',
    false, false, false,
    ARRAY['artifacts', 'claude', 'canvas']::text[], ARRAY['Great for iterative making']::text[], ARRAY['Feature of Claude product, not standalone']::text[], ARRAY['Developers', 'Professionals']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'claude-artifacts';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://claude.ai', 'Anthropic', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://claude.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- ChatGPT Canvas
  select id into v_publisher_id from publishers where name = 'OpenAI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'ChatGPT Canvas', 'chatgpt-canvas', v_publisher_id,
    'Collaborative editing canvas inside ChatGPT for writing and coding.', 'Canvas provides a side-by-side workspace to refine documents and code with ChatGPT.', 'https://chatgpt.com',
    'published', 'Freemium', 'Included with ChatGPT plans',
    false, false, false,
    ARRAY['canvas', 'chatgpt', 'editing']::text[], ARRAY['Inline collaborative editing']::text[], ARRAY['Feature of ChatGPT product, not standalone']::text[], ARRAY['Professionals', 'Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'chatgpt-canvas';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://chatgpt.com', 'OpenAI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://chatgpt.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Manus
  select id into v_publisher_id from publishers where name = 'Manus';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Manus', 'manus', v_publisher_id,
    'Autonomous AI agent product for executing multi-step computer tasks.', 'Manus is an agent-style assistant positioned for end-to-end task execution in a managed product experience.', 'https://manus.im',
    'published', 'Not disclosed', 'To verify',
    false, false, false,
    ARRAY['agent', 'autonomous', 'tasks']::text[], ARRAY['End-to-end agent positioning']::text[], ARRAY['Access and capabilities evolving rapidly']::text[], ARRAY['Professionals', 'Early adopters']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'manus';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Agent';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://manus.im', 'Manus', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://manus.im';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- OpenAI Operator
  select id into v_publisher_id from publishers where name = 'OpenAI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'OpenAI Operator', 'operator', v_publisher_id,
    'OpenAI agent that can use a browser to perform tasks for users.', 'Operator is OpenAI''s computer-using agent experience for navigating web interfaces and completing workflows.', 'https://openai.com/index/introducing-operator/',
    'published', 'Paid', 'To verify',
    false, false, false,
    ARRAY['browser-agent', 'cua', 'openai']::text[], ARRAY['Browser task automation']::text[], ARRAY['Limited rollout / plan requirements']::text[], ARRAY['Professionals', 'Power users']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'operator';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Agent';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://openai.com/index/introducing-operator/', 'OpenAI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://openai.com/index/introducing-operator/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- ChatGPT Deep Research
  select id into v_publisher_id from publishers where name = 'OpenAI';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'ChatGPT Deep Research', 'deep-research', v_publisher_id,
    'ChatGPT mode for longer, multi-step web research reports.', 'Deep Research runs extended research-style workflows and compiles structured findings inside ChatGPT.', 'https://chatgpt.com',
    'published', 'Paid', 'Included with qualifying ChatGPT plans',
    false, false, false,
    ARRAY['research', 'chatgpt', 'reports']::text[], ARRAY['Multi-step research automation']::text[], ARRAY['Plan-gated feature']::text[], ARRAY['Analysts', 'Professionals']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'deep-research';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://chatgpt.com', 'OpenAI', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://chatgpt.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Gemini Deep Research
  select id into v_publisher_id from publishers where name = 'Google';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Gemini Deep Research', 'gemini-deep-research', v_publisher_id,
    'Gemini feature for multi-step research reports with Google grounding.', 'Deep Research in Gemini explores topics across sources and produces structured research outputs.', 'https://gemini.google.com',
    'published', 'Paid', 'Included with qualifying Google plans',
    false, false, false,
    ARRAY['research', 'gemini', 'google']::text[], ARRAY['Google ecosystem grounding']::text[], ARRAY['Plan/availability dependent']::text[], ARRAY['Professionals', 'Students']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'gemini-deep-research';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://gemini.google.com', 'Google', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://gemini.google.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'AI Assistants';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Cursor Bugbot
  select id into v_publisher_id from publishers where name = 'Anysphere';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Cursor Bugbot', 'cursor-bugbot', v_publisher_id,
    'Cursor''s AI code review agent for pull requests.', 'Bugbot reviews pull requests and comments on potential bugs and regressions in GitHub workflows.', 'https://cursor.com',
    'published', 'Paid', 'To verify',
    false, false, false,
    ARRAY['code-review', 'pr', 'cursor']::text[], ARRAY['PR-native review assistance']::text[], ARRAY['Cursor/GitHub setup required']::text[], ARRAY['Developers']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'cursor-bugbot';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Agent';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://cursor.com', 'Anysphere', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://cursor.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;

  -- Linear Asks
  select id into v_publisher_id from publishers where name = 'Linear';
  insert into tools (name, slug, publisher_id, summary, description, official_url, status, pricing_model, price_display, api_available, open_source, local_available, keywords, strengths, limits, audience, last_verified_at)
  values (
    'Linear Asks', 'linear-asks', v_publisher_id,
    'AI assistance features inside Linear for issue tracking workflows.', 'Linear''s AI features help teams draft, search and triage product work inside Linear.', 'https://linear.app',
    'published', 'Paid', 'Included in Linear plans',
    false, false, false,
    ARRAY['project-management', 'issues', 'linear']::text[], ARRAY['Native PM workflow']::text[], ARRAY['Tied to Linear product']::text[], ARRAY['Product teams']::text[],
    current_date
  ) on conflict (slug) do nothing;
  select id into v_tool_id from tools where slug = 'linear-asks';
  if v_tool_id is not null then
    select id into v_type_id from solution_types where name = 'Tool';
    if v_type_id is not null then
      insert into tool_types (tool_id, solution_type_id, is_primary)
      values (v_tool_id, v_type_id, true)
      on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level)
    values ('https://linear.app', 'Linear', 'official', 'A')
    on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://linear.app';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at)
      values (v_tool_id, v_source_id, 'general', current_date)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, true)
      on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Business & Marketing';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary)
      values (v_tool_id, v_cat_id, false)
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status)
      values (v_tool_id, v_plat_id, 'available')
      on conflict do nothing;
    end if;
  end if;
end $$;
