from django.apps import AppConfig

class IntegrationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'integrations'

    def ready(self):
        # Self-healing database check to prevent 500 crashes
        # COMMENTED OUT: This runs during app initialization and breaks migrations
        # try:
        #     from django.db import connection
        #     # Use raw SQL to ensure columns exist without relying on migrations
        #     # SQLite specific PRAGMA check
        #     with connection.cursor() as cursor:
        #         cursor.execute("PRAGMA table_info(tenants)")
        #         columns = [row[1] for row in cursor.fetchall()]
        #         
        #         if not columns:
        #             return # Table might not exist yet
        #
        #         if 'is_api_activated' not in columns:
        #             print("🚧 Self-Healing: Adding 'is_api_activated' to tenants table...")
        #             cursor.execute("ALTER TABLE tenants ADD COLUMN is_api_activated BOOLEAN DEFAULT 0")
        #         
        #         if 'api_status' not in columns:
        #             print("🚧 Self-Healing: Adding 'api_status' to tenants table...")
        #             cursor.execute("ALTER TABLE tenants ADD COLUMN api_status VARCHAR(20) DEFAULT 'Inactive'")
        #         
        #         if 'api_activated_at' not in columns:
        #             print("🚧 Self-Healing: Adding 'api_activated_at' to tenants table...")
        #             cursor.execute("ALTER TABLE tenants ADD COLUMN api_activated_at DATETIME")
        # except Exception as e:
        #     # Don't crash the whole app if this fails
        #     print(f"⚠️ Self-Healing Notice: {str(e)}")
        pass
