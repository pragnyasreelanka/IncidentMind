import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "incidentmind.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'open',
            category TEXT,
            ai_analysis TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()


def create_incident(
    title,
    description,
    severity="medium",
    category=None
):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO incidents
        (title, description, severity, category)
        VALUES (?, ?, ?, ?)
        """,
        (title, description, severity, category)
    )

    connection.commit()
    incident_id = cursor.lastrowid
    connection.close()

    return incident_id


def get_all_incidents():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT *
        FROM incidents
        ORDER BY created_at DESC
        """
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]


def get_incident(incident_id):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT *
        FROM incidents
        WHERE id = ?
        """,
        (incident_id,)
    ).fetchone()

    connection.close()

    return dict(row) if row else None


def update_ai_analysis(incident_id, analysis):
    connection = get_connection()

    connection.execute(
        """
        UPDATE incidents
        SET ai_analysis = ?
        WHERE id = ?
        """,
        (analysis, incident_id)
    )

    connection.commit()
    connection.close()