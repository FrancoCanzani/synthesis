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

export interface FeedItem {
  id: number;
  userId?: string;
  title?: string;
  description?: string;
  content?: string;
  feedLink?: string;
  link?: string;
  imageUrl?: string;
  imageTitle?: string;
  published?: string;
  publishedParsed?: string; // ISO date string
  updated?: string;
  updatedParsed?: string; // ISO date string
  guid?: string;
  read: boolean;
  starred: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  feed: {
    title?: string;
    description?: string;
    imageUrl?: string;
    feedType?: string;
  };
}
