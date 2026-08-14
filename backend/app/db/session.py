"""Database session and connection management for OpsPulse AI."""
import sqlite3
import logging
from typing import Any, Optional
import duckdb
from backend.app.config import settings

logger = logging.getLogger("opspulse.db")


class DatabaseManager:
    """Unified database connection manager supporting DuckDB and SQLite."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or str(settings.DB_PATH)
        self._duck_conn: Optional[duckdb.DuckDBPyConnection] = None
        self._sqlite_conn: Optional[sqlite3.Connection] = None
        self.engine_type = "duckdb"

    def get_connection(self) -> duckdb.DuckDBPyConnection:
        """Get or initialize a thread-safe DuckDB connection."""
        try:
            if self._duck_conn is None:
                settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
                self._duck_conn = duckdb.connect(database=self.db_path, read_only=False)
            return self._duck_conn
        except Exception as e:
            logger.warning(f"DuckDB connection fallback to in-memory: {e}")
            if self._duck_conn is None:
                self._duck_conn = duckdb.connect(database=":memory:")
            return self._duck_conn

    def init_schema(self) -> None:
        """Initialize table schemas from schema.sql."""
        schema_path = settings.BASE_DIR / "backend" / "app" / "db" / "schema.sql"
        if not schema_path.exists():
            raise FileNotFoundError(f"Schema file not found at {schema_path}")

        sql_content = schema_path.read_text(encoding="utf-8")
        conn = self.get_connection()
        
        # Split and execute non-empty statements
        statements = [s.strip() for s in sql_content.split(";") if s.strip()]
        for stmt in statements:
            try:
                conn.execute(stmt)
            except Exception as e:
                logger.error(f"Error executing schema statement: {stmt[:60]}... -> {e}")
                raise e
        logger.info("Database schema initialized successfully.")

    def execute(self, query: str, params: Optional[list | tuple | dict] = None) -> list[dict[str, Any]]:
        """Execute a query and return results as a list of dicts."""
        conn = self.get_connection()
        try:
            if params:
                cursor = conn.execute(query, params)
            else:
                cursor = conn.execute(query)
            
            # Check if query returned rows
            if cursor.description is not None:
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
            return []
        except Exception as e:
            logger.error(f"SQL execution error for '{query[:100]}': {e}")
            raise e

    def execute_non_query(self, statement: str, params: Optional[list | tuple | dict] = None) -> None:
        """Execute insert/update/delete statement."""
        conn = self.get_connection()
        if params:
            conn.execute(statement, params)
        else:
            conn.execute(statement)

    def close(self) -> None:
        """Close connection."""
        if self._duck_conn is not None:
            try:
                self._duck_conn.close()
            except Exception:
                pass
            self._duck_conn = None


# Global singleton instance
db_manager = DatabaseManager()
