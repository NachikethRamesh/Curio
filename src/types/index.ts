export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  x_handle: string | null;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  position: number;
  is_public: boolean;
  created_at: string;
}

export interface Tweet {
  id: string;
  author_handle: string | null;
  author_name: string | null;
  content: string | null;
  embed_html: string | null;
  tweet_url: string;
  created_at: string | null;
  fetched_at: string;
}

export interface CollectionTweet {
  id: string;
  collection_id: string;
  tweet_id: string;
  position: number;
  added_at: string;
}

export interface CollectionWithTweets extends Collection {
  tweets: Tweet[];
}
