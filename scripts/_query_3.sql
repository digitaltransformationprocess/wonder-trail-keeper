do $$
declare
  v_publisher_id uuid;
  v_tool_id uuid;
  v_type_id uuid;
  v_source_id uuid;
  v_cat_id uuid;
  v_plat_id uuid;
begin
  insert into publishers (name) values ('Chroma') on conflict (name) do nothing;
  insert into publishers (name) values ('CrewAI') on conflict (name) do nothing;
  insert into publishers (name) values ('Fireworks AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Gamma') on conflict (name) do nothing;
  insert into publishers (name) values ('Hugging Face') on conflict (name) do nothing;
  insert into publishers (name) values ('LlamaIndex') on conflict (name) do nothing;
  insert into publishers (name) values ('Make') on conflict (name) do nothing;
  insert into publishers (name) values ('Notion') on conflict (name) do nothing;
  insert into publishers (name) values ('Pinecone') on conflict (name) do nothing;
  insert into publishers (name) values ('Replicate') on conflict (name) do nothing;
  insert into publishers (name) values ('Significant Gravitas') on conflict (name) do nothing;
  insert into publishers (name) values ('Together AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Tome') on conflict (name) do nothing;
  insert into publishers (name) values ('Vercel') on conflict (name) do nothing;
  insert into publishers (name) values ('Weaviate') on conflict (name) do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.make.com', 'Make', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.make.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.crewai.com', 'CrewAI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.crewai.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://agpt.co', 'Significant Gravitas', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://agpt.co';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.llamaindex.ai', 'LlamaIndex', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.llamaindex.ai';
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
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.pinecone.io', 'Pinecone', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.pinecone.io';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
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
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://weaviate.io', 'Weaviate', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://weaviate.io';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
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
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.trychroma.com', 'Chroma', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.trychroma.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Data & Analytics';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://huggingface.co', 'Hugging Face', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://huggingface.co';
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
    select id into v_plat_id from platforms where label = 'Python';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Self-hosted';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://replicate.com', 'Replicate', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://replicate.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Image Generation';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.together.ai', 'Together AI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.together.ai';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://fireworks.ai', 'Fireworks AI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://fireworks.ai';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://sdk.vercel.ai', 'Vercel', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://sdk.vercel.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Coding & Development';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'JavaScript';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.notion.com/product/ai', 'Notion', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.notion.com/product/ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://gamma.app', 'Gamma', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://gamma.app';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://tome.app', 'Tome', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://tome.app';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
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
end $$;
