do $$
declare
  v_publisher_id uuid;
  v_tool_id uuid;
  v_type_id uuid;
  v_source_id uuid;
  v_cat_id uuid;
  v_plat_id uuid;
begin
  insert into publishers (name) values ('ByteDance') on conflict (name) do nothing;
  insert into publishers (name) values ('Descript') on conflict (name) do nothing;
  insert into publishers (name) values ('Fireflies.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Framer') on conflict (name) do nothing;
  insert into publishers (name) values ('HeyGen') on conflict (name) do nothing;
  insert into publishers (name) values ('Krisp') on conflict (name) do nothing;
  insert into publishers (name) values ('Kuaishou') on conflict (name) do nothing;
  insert into publishers (name) values ('Luma AI') on conflict (name) do nothing;
  insert into publishers (name) values ('Murf.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('OpenAI') on conflict (name) do nothing;
  insert into publishers (name) values ('Otter.ai') on conflict (name) do nothing;
  insert into publishers (name) values ('Suno') on conflict (name) do nothing;
  insert into publishers (name) values ('Synthesia') on conflict (name) do nothing;
  insert into publishers (name) values ('Udio') on conflict (name) do nothing;
  insert into publishers (name) values ('Zapier') on conflict (name) do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.framer.com/ai/', 'Framer', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.framer.com/ai/';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Design & Creativity';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://openai.com/sora', 'OpenAI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://openai.com/sora';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://kling.ai', 'Kuaishou', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://kling.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://lumalabs.ai/dream-machine', 'Luma AI', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://lumalabs.ai/dream-machine';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.synthesia.io', 'Synthesia', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.synthesia.io';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.heygen.com', 'HeyGen', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.heygen.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.descript.com', 'Descript', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.descript.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.capcut.com', 'ByteDance', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.capcut.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Video Generation';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://suno.com', 'Suno', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://suno.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://www.udio.com', 'Udio', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://www.udio.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Web';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://murf.ai', 'Murf.ai', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://murf.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://krisp.ai', 'Krisp', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://krisp.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, false) on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'Windows';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
    end if;
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://otter.ai', 'Otter.ai', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://otter.ai';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Productivity';
    if v_cat_id is not null then
      insert into tool_categories (tool_id, category_id, is_primary) values (v_tool_id, v_cat_id, true) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Audio & Music';
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
    select id into v_plat_id from platforms where label = 'macOS';
    if v_plat_id is not null then
      insert into tool_platforms (tool_id, platform_id, status) values (v_tool_id, v_plat_id, 'available') on conflict do nothing;
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://fireflies.ai', 'Fireflies.ai', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://fireflies.ai';
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
      insert into tool_types (tool_id, solution_type_id, is_primary) values (v_tool_id, v_type_id, true) on conflict do nothing;
    end if;
    insert into sources (url, publisher, source_type, reliability_level) values ('https://zapier.com', 'Zapier', 'official', 'A') on conflict (url) do nothing;
    select id into v_source_id from sources where url = 'https://zapier.com';
    if v_source_id is not null then
      insert into tool_sources (tool_id, source_id, claim_key, verified_at) values (v_tool_id, v_source_id, 'general', current_date) on conflict do nothing;
    end if;
    select id into v_cat_id from categories where name = 'Automation & Agents';
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
end $$;
