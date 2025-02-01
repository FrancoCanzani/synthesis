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
  userId: string;
  title: string;
  siteName: string;
  url: string;
  author: string;
  excerpt: string;
  image: string;
  favicon: string;
  content: string;
  textContent: string;
  publishedTime: string;
  modifiedTime: string;
  language: string;
  length: number;
  scrapedAt: string;
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

export interface Email {
  id: number;
  recipient: string;
  recipientAlias: string;
  sender: string;
  fromName: string;
  subject: string;
  bodyPlain: string;
  strippedText: string;
  strippedHTML: string;
  attachmentCount: number;
  timestamp: number;
  token: string;
  signature: string;
  starred: boolean;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
