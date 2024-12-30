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