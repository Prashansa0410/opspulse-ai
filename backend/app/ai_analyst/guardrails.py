"""SQL Safety Guardrails and Query Sanitization Engine for OpsPulse AI."""
import re
import logging
import sqlparse
from sqlparse.sql import Statement
from backend.app.config import settings

logger = logging.getLogger("opspulse.ai.guardrails")

# Forbidden SQL keywords and command types
FORBIDDEN_KEYWORDS = {
    "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE",
    "CREATE", "REPLACE", "GRANT", "REVOKE", "ATTACH", "LOAD",
    "COPY", "INSTALL", "EXPORT", "IMPORT", "PRAGMA", "VACUUM",
    "EXEC", "EXECUTE", "MERGE"
}

ALLOWED_TABLES = {
    "regions", "warehouses", "carriers", "products", "customers",
    "inventory", "orders", "order_items", "shipments", "delivery_events",
    "payments", "support_tickets", "fct_daily_kpis",
    "fct_warehouse_performance", "fct_carrier_performance",
    "fct_regional_performance", "fct_anomaly_events",
    "fct_simulations", "dq_audit_log"
}


class SQLSecurityException(Exception):
    """Raised when an unsafe or malicious SQL query is detected."""
    pass


class SQLGuardrailEngine:
    """Enforces strict read-only execution, keyword whitelisting, and row limits on generated SQL."""

    @classmethod
    def validate_and_sanitize(cls, sql_query: str) -> str:
        """Validate query safety and inject limit clause if omitted."""
        cleaned = sql_query.strip()
        if not cleaned:
            raise SQLSecurityException("Empty SQL query provided.")

        # 1. Parse statement
        parsed = sqlparse.parse(cleaned)
        if not parsed:
            raise SQLSecurityException("Unable to parse SQL query.")

        if len(parsed) > 1:
            raise SQLSecurityException("Multiple SQL statements are strictly forbidden.")

        stmt = parsed[0]
        first_token = stmt.get_type()

        if first_token != "SELECT":
            raise SQLSecurityException(f"Only SELECT queries are permitted. Detected statement type: {first_token}")

        # 2. Check for forbidden keywords using regex word boundary
        upper_query = cleaned.upper()
        for kw in FORBIDDEN_KEYWORDS:
            pattern = rf"\b{kw}\b"
            if re.search(pattern, upper_query):
                raise SQLSecurityException(f"Destructive or modifying keyword '{kw}' is prohibited.")

        # 3. Prevent comments that could hide payload injections
        if "--" in cleaned or "/*" in cleaned:
            raise SQLSecurityException("SQL comments are not permitted in analytical queries.")

        # 4. Enforce LIMIT clause
        has_limit = bool(re.search(r"\bLIMIT\s+\d+\b", upper_query))
        if not has_limit:
            cleaned = cleaned.rstrip(";")
            cleaned += f" LIMIT {settings.MAX_SQL_ROWS_RETURNED}"

        logger.info(f"SQL passed guardrail validation: {cleaned}")
        return cleaned


sql_guardrails = SQLGuardrailEngine()
