from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SHEild AI 2.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase config
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str | None = None
    SUPABASE_JWT_ISSUER: str
    SUPABASE_JWT_AUDIENCE: str
    SUPABASE_JWKS_URL: str | None = None
    
    # Database
    DATABASE_URL: str
    
    # Mock Alert settings
    ALERT_PROVIDER: str = "mock"
    LOCATION_RETENTION_HOURS: int = 48

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
