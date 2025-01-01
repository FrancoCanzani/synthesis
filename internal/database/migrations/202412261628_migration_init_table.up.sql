CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
		user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        public BOOLEAN NOT NULL DEFAULT FALSE,
        public_id TEXT,
        deleted BOOLEAN NOT NULL DEFAULT FALSE,
        deleted_at DATETIME,
        created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
    )

CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
		user_id INTEGER NOT NULL,
        title TEXT,
        site_name TEXT,
        url TEXT NOT NULL,
        author TEXT,
		excerpt TEXT,
		image TEXT,
		favicon TEXT,
		content TEXT,
		text_content TEXT,
		published_time DATETIME,
		modified_time DATETIME,
		language TEXT,
		length INTEGER,
		scraped_at DATETIME NOT NULL
)