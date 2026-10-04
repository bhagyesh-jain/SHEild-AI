import os

class Settings:
    PROJECT_NAME: str = "SHEild AI 2.0 Backend"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sheild_ai.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-sheild-ai-2026")
    FCM_SERVER_KEY: str = os.getenv("FCM_SERVER_KEY", "mock-fcm-server-key")
    DEFAULT_USER_ID: str = "user-123"
    DEFAULT_GUARDIAN_ID: str = "guardian-456"

settings = Settings()
