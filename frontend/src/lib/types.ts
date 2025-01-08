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
  feedLink: string;
  link: string;
  userId: string;
  updateFrequency: string;
  lastFetch: string | null;
  active: boolean;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Feed {
  feedLink: string;
  link: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  imageTitle: string;
  updated: string;
  updatedParsed: string | null;
  feedType: string;
  createdAt: string;
  updatedAt: string;
  items: FeedItem[];
}

export interface FeedItem {
  id: number;
  userId: string;
  title: string;
  description: string;
  feedLink: string;
  link: string;
  imageUrl: string;
  imageTitle: string;
  published: string;
  publishedParsed: string | null;
  updated: string;
  updatedParsed: string | null;
  guid: string;
  read: boolean;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}
