import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Vercel's writable filesystem is temporary and is exposed through /tmp.
# Locally, keep using shop.db so the existing project remains easy to run.
if os.environ.get("VERCEL"):
    DATABASE_PATH = Path("/tmp/flipkart_shop.db")
else:
    DATABASE_PATH = Path(
        os.environ.get("DATABASE_PATH", str(BASE_DIR / "shop.db"))
    )


def get_db_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()

    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS google_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_sub TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    conn.commit()
    conn.close()
