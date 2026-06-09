import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Auth ---
export const registerUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// --- Feeds ---
export const fetchFeeds = async () => {
  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const addFeed = async (url) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch feed metadata via Edge Function
  const { data: feedData, error: parseError } = await supabase.functions.invoke(
    "parse-rss",
    {
      body: { url },
    },
  );

  if (parseError || feedData.error)
    throw new Error("Invalid or unreachable RSS feed.");

  const domain = new URL(url).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const { data, error } = await supabase
    .from("feeds")
    .insert([
      { user_id: user.id, title: feedData.title || domain, url, favicon },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      throw new Error("This feed URL has already been added.");
    throw error;
  }
  return data;
};

export const deleteFeed = async (id) => {
  const { error } = await supabase.from("feeds").delete().eq("id", id);
  if (error) throw error;
};

// --- Articles (RSS Fetching) ---
export const fetchArticlesFromUrl = async (url) => {
  const { data, error } = await supabase.functions.invoke("parse-rss", {
    body: { url },
  });

  if (error) throw error;
  // If the Edge function caught an error and returned a 400, throw that specific message
  if (data && data.error) throw new Error(data.error);

  return data;
};
// --- Saved Articles ---
export const fetchSavedArticles = async () => {
  const { data, error } = await supabase
    .from("saved_articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const saveArticle = async (articleData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("saved_articles")
    .insert([
      {
        user_id: user.id,
        title: articleData.title,
        link: articleData.link,
        pub_date: articleData.pubDate,
        content: articleData.content,
        feed_title: articleData.feedTitle,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Article already saved.");
    throw error;
  }
  return data;
};

export const unsaveArticle = async (link) => {
  const { error } = await supabase
    .from("saved_articles")
    .delete()
    .eq("link", link);
  if (error) throw error;
};

// --- Curated Feeds ---
export const fetchCuratedFeeds = async () => {
  const { data, error } = await supabase.from("curated_feeds").select("*");
  if (error) throw error;

  // Group by category matching the existing API response structure
  return data.reduce((acc, feed) => {
    if (!acc[feed.category]) acc[feed.category] = [];
    acc[feed.category].push(feed);
    return acc;
  }, {});
};
