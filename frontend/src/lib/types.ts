export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  title: string;
  site_name: string;
  url: string;
  author: string;
  description: string;
  image: string;
  content: string;
  publish_date: string;
  category: string;
  language: string;
  reading_time: number;
  scraped_at: string;
}
