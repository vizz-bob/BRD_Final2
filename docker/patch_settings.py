"""
BRD Platform – Settings Patcher
=================================
Appends PostgreSQL database configuration (read from environment variables)
to all Django settings.py files so they work with Docker/PostgreSQL.

Run this once from the BRD_Final2 root:
    python docker/patch_settings.py
"""
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (backend_dir, settings_file_relative_to_backend)
BACKENDS = [
    ("BRD-MergedTenantMaster-Backend",      "brd_platform/settings.py"),
    ("BRD_MasterAdmin_Backend_1.1",          "brd_platform/settings.py"),
    ("BRD-TenantAdmin_backend_2.0",          "brd_platform/settings.py"),
    ("BRD-ChannelPartnerDashboard-Backend",  "ChannelPartner/settings.py"),
    ("BRD-SalesCRM-Dashboard-Backend",       "sales_crm_dashboard/settings.py"),
    ("BRD-FraudTeam-Dashboard-Backend",      "fraud_backend/settings.py"),
    ("BRD-OperationVerification-Backend",    "BRD_OPERATION/settings.py"),
    ("BRD-Valuation-Dashboard-Backend",      "valuation/settings.py"),
    ("BRD-BorrowerApp-Backend",              "borrower/settings.py"),
    ("BRD-AgentsApp-Backend",                "mobile_app/settings.py"),
    ("BRD_CRM_1.1_BACKEND",                  "brd_crm/settings.py"),
    ("BRD_FINANCE_DASHBOARD_Backend",        "backend/settings.py"),
    ("BRD-LegalDashboard-Backend",           "Legal_Dashboard/settings.py"),
    ("BRD-website-main-backend",             "config/settings.py"),
]

POSTGRES_BLOCK = '''
# ─── Docker / PostgreSQL Database (injected by patch_settings.py) ───
import os as _os
_USE_POSTGRES = _os.environ.get("DB_HOST")
if _USE_POSTGRES:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": _os.environ.get("DB_NAME", "brd_db"),
            "USER": _os.environ.get("DB_USER", "brd_user"),
            "PASSWORD": _os.environ.get("DB_PASSWORD", ""),
            "HOST": _os.environ.get("DB_HOST", "localhost"),
            "PORT": _os.environ.get("DB_PORT", "5432"),
            "OPTIONS": {
                "connect_timeout": 10,
            },
        }
    }
# ────────────────────────────────────────────────────────────────────
'''

MARKER = "# ─── Docker / PostgreSQL Database (injected by patch_settings.py) ───"


def patch_settings(backend_dir, settings_rel):
    settings_path = os.path.join(BASE_DIR, backend_dir, settings_rel)
    if not os.path.isfile(settings_path):
        print(f"  [SKIP] Not found: {settings_path}")
        return

    with open(settings_path, "r", encoding="utf-8") as f:
        content = f.read()

    if MARKER in content:
        print(f"  [SKIP] Already patched: {backend_dir}/{settings_rel}")
        return

    with open(settings_path, "a", encoding="utf-8") as f:
        f.write(POSTGRES_BLOCK)

    print(f"  [OK]   Patched: {backend_dir}/{settings_rel}")


if __name__ == "__main__":
    print("Patching Django settings.py files for PostgreSQL support...\n")
    for (backend_dir, settings_rel) in BACKENDS:
        patch_settings(backend_dir, settings_rel)
    print("\nDone! All settings files patched.")
