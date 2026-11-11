do $$
declare
  v_publisher_id uuid;
  v_tool_id uuid;
  v_type_id uuid;
  v_source_id uuid;
  v_cat_id uuid;
  v_plat_id uuid;
begin
  insert into publishers (name) values ('AI21 Labs') on conflict (name) do nothing;
  insert into publishers (name) values ('Allen Institute for AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Anthropic') on conflict (name) do nothing;
  insert into publishers (name) values ('ChatPDF') on conflict (name) do nothing;
  insert into publishers (name) values ('Consensus') on conflict (name) do nothing;
  insert into publishers (name) values ('Copy.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Elicit') on conflict (name) do nothing;
  insert into publishers (name) values ('GitHub') on conflict (name) do nothing;
  insert into publishers (name) values ('Google') on conflict (name) do nothing;
  insert into publishers (name) values ('Grammarly') on conflict (name) do nothing;
  insert into publishers (name) values ('Mem') on conflict (name) do nothing;
  insert into publishers (name) values ('OpenAI') on conflict (name) do nothing;
  insert into publishers (name) values ('Perplexity') on conflict (name) do nothing;
  insert into publishers (name) values ('QuillBot') on conflict (name) do nothing;
  insert into publishers (name) values ('Writesonic') on conflict (name) do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.copy.ai', 'Copy.ai', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.copy.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://writesonic.com', 'Writesonic', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://writesonic.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.grammarly.com', 'Grammarly', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.grammarly.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://quillbot.com', 'QuillBot', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://quillbot.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.wordtune.com', 'AI21 Labs', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.wordtune.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Writing & Content';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://mem.ai', 'Mem', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://mem.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.perplexity.ai/pages', 'Perplexity', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.perplexity.ai/pages';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.chatpdf.com', 'ChatPDF', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.chatpdf.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://consensus.app', 'Consensus', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://consensus.app';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://elicit.com', 'Elicit', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://elicit.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.semanticscholar.org', 'Allen Institute for AI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.semanticscholar.org';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Research & Education';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://github.com/marketplace/models', 'GitHub', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://github.com/marketplace/models';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://github.com/google-gemini/gemini-cli', 'Google', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://github.com/google-gemini/gemini-cli';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://claude.ai', 'Anthropic', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://claude.ai';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://chatgpt.com', 'OpenAI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://chatgpt.com';
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
  end if;
end $$;
