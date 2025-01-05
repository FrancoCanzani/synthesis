export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  public: boolean;
  public_id: string | null;
  deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  site_name: string;
  url: string;
  author: string;
  excerpt: string;
  image: string;
  favicon: string;
  content: string;
  text_content: string;
  published_time: string;
  modified_time: string;
  language: string;
  length: number;
  scraped_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface FeedSource {
  link: string;
  source_link: string;
  user_id: string;
  update_frequency: string;
  last_fetch: string | null;
  active: boolean;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface Feed {
  link: string;
  source_link: string;
  user_id: string;
  title: string;
  description: string;
  updated: string;
  updated_parsed: string | null;
  feed_type: string;
  created_at: string;
  updated_at: string;
  items: FeedItem[];
}

export interface FeedItem {
  id: number;
  source_link: string;
  user_id: string;
  title: string;
  description: string;
  link: string;
  published: string;
  published_parsed: string;
  updated: string;
  updated_parsed: string | null;
  guid: string;
  read: boolean;
  starred: boolean;
  created_at: string;
  updated_at: string;
}
