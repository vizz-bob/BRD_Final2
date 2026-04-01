-- ============================================================
-- BRD Platform – PostgreSQL Initialisation Script
-- Creates all service databases and grants permissions to brd_user
-- This runs automatically when the postgres container starts for the first time
-- ============================================================

-- Create the application user
CREATE USER brd_user WITH PASSWORD 'Brd@Secure2024!';

-- ─────────────────────────────────────────────
-- Master-Admin Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_master_db;
GRANT ALL PRIVILEGES ON DATABASE brd_master_db TO brd_user;
ALTER DATABASE brd_master_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Tenant-Admin Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_tenant_db;
GRANT ALL PRIVILEGES ON DATABASE brd_tenant_db TO brd_user;
ALTER DATABASE brd_tenant_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Merged Tenant+Master Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_merged_db;
GRANT ALL PRIVILEGES ON DATABASE brd_merged_db TO brd_user;
ALTER DATABASE brd_merged_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Channel Partner Dashboard Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_channel_partner_db;
GRANT ALL PRIVILEGES ON DATABASE brd_channel_partner_db TO brd_user;
ALTER DATABASE brd_channel_partner_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Sales CRM Dashboard Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_sales_crm_db;
GRANT ALL PRIVILEGES ON DATABASE brd_sales_crm_db TO brd_user;
ALTER DATABASE brd_sales_crm_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Fraud Team Dashboard Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_fraud_db;
GRANT ALL PRIVILEGES ON DATABASE brd_fraud_db TO brd_user;
ALTER DATABASE brd_fraud_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Operation Verification Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_operation_db;
GRANT ALL PRIVILEGES ON DATABASE brd_operation_db TO brd_user;
ALTER DATABASE brd_operation_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Valuation Dashboard Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_valuation_db;
GRANT ALL PRIVILEGES ON DATABASE brd_valuation_db TO brd_user;
ALTER DATABASE brd_valuation_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Borrower App Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_borrower_db;
GRANT ALL PRIVILEGES ON DATABASE brd_borrower_db TO brd_user;
ALTER DATABASE brd_borrower_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Agents App Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_agents_db;
GRANT ALL PRIVILEGES ON DATABASE brd_agents_db TO brd_user;
ALTER DATABASE brd_agents_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- CRM Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_crm_db;
GRANT ALL PRIVILEGES ON DATABASE brd_crm_db TO brd_user;
ALTER DATABASE brd_crm_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Finance Dashboard Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_finance_db;
GRANT ALL PRIVILEGES ON DATABASE brd_finance_db TO brd_user;
ALTER DATABASE brd_finance_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Legal Dashboard Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_legal_db;
GRANT ALL PRIVILEGES ON DATABASE brd_legal_db TO brd_user;
ALTER DATABASE brd_legal_db OWNER TO brd_user;

-- ─────────────────────────────────────────────
-- Website Main Backend
-- ─────────────────────────────────────────────
CREATE DATABASE brd_website_db;
GRANT ALL PRIVILEGES ON DATABASE brd_website_db TO brd_user;
ALTER DATABASE brd_website_db OWNER TO brd_user;

-- Grant schema-level permissions (PostgreSQL 15+)
\connect brd_master_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_tenant_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_merged_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_channel_partner_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_sales_crm_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_fraud_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_operation_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_valuation_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_borrower_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_agents_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_crm_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_finance_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_legal_db
GRANT ALL ON SCHEMA public TO brd_user;

\connect brd_website_db
GRANT ALL ON SCHEMA public TO brd_user;
