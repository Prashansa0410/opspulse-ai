"""User management and authentication service interacting with analytical database."""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from backend.app.db.session import db_manager
from backend.app.auth.models import UserRole, UserProfile, DemoUserItem
from backend.app.auth.security import hash_password, verify_password

logger = logging.getLogger("opspulse.auth")


class AuthService:
    """Authentication and User Persistence service."""

    def __init__(self):
        self._initialized = False

    def ensure_schema_and_seed(self) -> None:
        """Create users table if not exists and seed default demo accounts."""
        if self._initialized:
            return

        conn = db_manager.get_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id VARCHAR(50) PRIMARY KEY,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(150) NOT NULL,
                role VARCHAR(50) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Check existing count
        count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if count == 0:
            logger.info("Seeding default RBAC demo accounts...")
            demo_accounts = [
                (
                    "USR_EXEC_01",
                    "exec@opspulse.ai",
                    hash_password("Executive123!"),
                    "Sarah Connor (VP Operations)",
                    UserRole.EXECUTIVE.value,
                    True,
                    datetime.now(timezone.utc)
                ),
                (
                    "USR_OPS_01",
                    "ops@opspulse.ai",
                    hash_password("OpsManager123!"),
                    "Vikram Malhotra (Lead Ops Manager)",
                    UserRole.OPS_MANAGER.value,
                    True,
                    datetime.now(timezone.utc)
                ),
                (
                    "USR_ANALYST_01",
                    "analyst@opspulse.ai",
                    hash_password("DataAnalyst123!"),
                    "Ananya Sharma (Senior Data Scientist)",
                    UserRole.DATA_ANALYST.value,
                    True,
                    datetime.now(timezone.utc)
                ),
            ]

            for user in demo_accounts:
                conn.execute("""
                    INSERT INTO users (user_id, email, password_hash, full_name, role, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                """, list(user))
            logger.info("Demo accounts successfully seeded with bcrypt hashes.")

        self._initialized = True

    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Fetch user record by email."""
        self.ensure_schema_and_seed()
        conn = db_manager.get_connection()
        row = conn.execute("""
            SELECT user_id, email, password_hash, full_name, role, is_active, created_at
            FROM users
            WHERE LOWER(email) = LOWER(?);
        """, [email.strip()]).fetchone()

        if not row:
            return None

        cols = ["user_id", "email", "password_hash", "full_name", "role", "is_active", "created_at"]
        return dict(zip(cols, row))

    def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        """Fetch user profile by user_id."""
        self.ensure_schema_and_seed()
        conn = db_manager.get_connection()
        row = conn.execute("""
            SELECT user_id, email, full_name, role, is_active, created_at
            FROM users
            WHERE user_id = ?;
        """, [user_id]).fetchone()

        if not row:
            return None

        return UserProfile(
            user_id=row[0],
            email=row[1],
            full_name=row[2],
            role=UserRole(row[3]),
            is_active=bool(row[4]),
            created_at=str(row[5]) if row[5] else None
        )

    def authenticate_user(self, email: str, password: str) -> Optional[UserProfile]:
        """Verify user credentials against stored bcrypt hash."""
        user_record = self.get_user_by_email(email)
        if not user_record:
            return None

        if not user_record.get("is_active", True):
            return None

        if not verify_password(password, user_record["password_hash"]):
            return None

        return UserProfile(
            user_id=user_record["user_id"],
            email=user_record["email"],
            full_name=user_record["full_name"],
            role=UserRole(user_record["role"]),
            is_active=bool(user_record["is_active"]),
            created_at=str(user_record["created_at"]) if user_record["created_at"] else None
        )

    def create_user(self, email: str, password: str, full_name: str, role: UserRole) -> UserProfile:
        """Register a new user with hashed password."""
        self.ensure_schema_and_seed()
        existing = self.get_user_by_email(email)
        if existing:
            raise ValueError(f"User with email '{email}' already exists")

        user_id = f"USR_{uuid.uuid4().hex[:8].upper()}"
        hashed = hash_password(password)
        now = datetime.now(timezone.utc)

        conn = db_manager.get_connection()
        conn.execute("""
            INSERT INTO users (user_id, email, password_hash, full_name, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, [user_id, email.strip().lower(), hashed, full_name.strip(), role.value, True, now])

        return UserProfile(
            user_id=user_id,
            email=email.strip().lower(),
            full_name=full_name.strip(),
            role=role,
            is_active=True,
            created_at=str(now)
        )

    def get_demo_users(self) -> list[DemoUserItem]:
        """Return available pre-configured demo user options for 1-click login."""
        return [
            DemoUserItem(
                role=UserRole.EXECUTIVE,
                email="exec@opspulse.ai",
                password="Executive123!",
                label="Executive / VP Ops",
                description="Access to headline KPIs, revenue risk, and multi-stage attribution overview."
            ),
            DemoUserItem(
                role=UserRole.OPS_MANAGER,
                email="ops@opspulse.ai",
                password="OpsManager123!",
                label="Operations Manager",
                description="Authorized to execute What-If simulations, triage anomalies, and reallocate volume."
            ),
            DemoUserItem(
                role=UserRole.DATA_ANALYST,
                email="analyst@opspulse.ai",
                password="DataAnalyst123!",
                label="Data Analyst / ML Lead",
                description="Authorized to inspect ML risk models, run SQL tool analyses, and audit Data Quality."
            )
        ]


# Singleton instance
auth_service = AuthService()
