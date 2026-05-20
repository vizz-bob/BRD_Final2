BRD PLATFORM

Docker Deployment Guide

Generated: April 01, 2026

EC2 Instance: 13.232.219.91

PROJECT SUMMARY
• 14 Django Backend Services (ports 8000–8013)
• 12 React Frontend Services (ports 3000–3011)
• 1 PostgreSQL Database Server (port 5432)
• 1 Redis Cache Server (port 6379)
• 1 pgAdmin UI (port 5050)
• Single docker-compose.yml orchestrates everything

TABLE OF CONTENTS
1. Prerequisites & System Requirements
2. Project Structure Overview
3. Port Reference Map
4. Pre-Deployment Setup
5. Step-by-Step Deployment (Local Machine)
6. Step-by-Step Deployment (AWS EC2)
7. Database Setup & User Permissions
8. Service Health Checks
9. Useful Docker Commands
10. Troubleshooting
11. Environment Variables Reference
12. Re-deployment & Updates

    
1. PREREQUISITES & SYSTEM REQUIREMENTS
   
Install the following on the server/EC2 instance before beginning:

Tool Version Install Command

Docker Engine 24+ sudo apt install docker.io

Docker Compose v2 (plugin) sudo apt install docker-compose-plugin

Git Latest sudo apt install git

Node.js 20+ (build only) nvm install 20

Python 3.12 (build only) sudo apt install python3.12

curl / wget Any Pre-installed on Ubuntu

Minimum Server Specs (EC2 Recommended):

Component Minimum Recommended

Instance Type t3.large t3.xlarge or c5.xlarge

vCPUs 2 4

RAM 8 GB 16 GB

Storage (EBS) 50 GB gp3 100 GB gp3

OS Ubuntu 22.04 LTS Ubuntu 22.04 LTS

AWS Security Group – Required Inbound Rules:

Port(s) Protocol Source Purpose

22 TCP Your IP SSH access

80 TCP 0.0.0.0/0 HTTP (optional)

443 TCP 0.0.0.0/0 HTTPS (optional)

3000–3011 TCP 0.0.0.0/0 All Frontend services

8000–8013 TCP 0.0.0.0/0 All Backend services

5432 TCP Your IP (admin only) PostgreSQL (restrict access!)

5050 TCP Your IP (admin only) pgAdmin

6379 TCP VPC only Redis (internal only)

3. PROJECT STRUCTURE OVERVIEW
4. 
The BRD_Final2 repository contains 26 services as sub-directories:

BRD_Final2/

■■■ docker-compose.yml ← Main orchestration file

■■■ .env ← Environment variables (DO NOT commit)

■■■ docker/

■■■ entrypoint.sh ← Shared Django startup script

■■■ postgres-init.sql ← DB creation + user permissions

■■■ nginx-frontend.conf ← Nginx config template

■■■ patch_settings.py ← One-time settings patcher

■■■ BRD-MergedTenantMaster-Backend/ [port 8000]

■■■ BRD_MasterAdmin_Backend_1.1/ [port 8001]

■■■ BRD-TenantAdmin_backend_2.0/ [port 8002]

■■■ BRD-ChannelPartnerDashboard-Backend/ [port 8003]

■■■ BRD-SalesCRM-Dashboard-Backend/ [port 8004]

■■■ BRD-FraudTeam-Dashboard-Backend/ [port 8005]

■■■ BRD-OperationVerification-Backend/[port 8006]

■■■ BRD-Valuation-Dashboard-Backend/ [port 8007]

■■■ BRD-BorrowerApp-Backend/ [port 8008]

■■■ BRD-AgentsApp-Backend/ [port 8009]

■■■ BRD_CRM_1.1_BACKEND/ [port 8010]

■■■ BRD_FINANCE_DASHBOARD_Backend/ [port 8011]

■■■ BRD-LegalDashboard-Backend/ [port 8012]

■■■ BRD-website-main-backend/ [port 8013]
■
■■■ BRD-MergedTenantMaster-Frontend/ [port 3000]

■■■ BRD_TenantAdmin_Frontend_1.1/ [port 3001]

■■■ BRD_MasterAdmin_Frontend_1.1/ [port 3002]

■■■ BRD-Operation-Verification-Dashboard/ [port 3003]

■■■ BRD_SALES_CRM/ [port 3004]

■■■ BRD_FINANCE_DASHBOARD/ [port 3005]

■■■ BRD-ChannelPartner-Dashboard/ [port 3006]

■■■ BRD-LEGAL-dashboard/ [port 3007]

■■■ BRD-FraudTeamDashboard/ [port 3008]

■■■ BRD-ValuationDashboard/ [port 3009]

■■■ BRD_CRM-1.1/ [port 3010]

■■■ BRD-website-main/ [port 3011]


6. PORT REFERENCE MAP
   
Infrastructure Services:
Service Container Name Host Port URL
PostgreSQL brd_postgres 5432 postgresql://localhost:5432
Redis brd_redis 6379 redis://localhost:6379
pgAdmin brd_pgadmin 5050 http://localhost:5050
Backend Services (Django / Gunicorn):
Service Container Port URL
Merged
Tenant+Master
brd_merged_backend 8000 http://localhost:8000
Master Admin brd_master_backend 8001 http://localhost:8001
Tenant Admin brd_tenant_backend 8002 http://localhost:8002
Channel Partner brd_channel_partner_backe
nd
8003 http://localhost:8003
Sales CRM brd_sales_crm_backend 8004 http://localhost:8004
Fraud Team brd_fraud_backend 8005 http://localhost:8005
Operation Verify brd_operation_backend 8006 http://localhost:8006
Valuation brd_valuation_backend 8007 http://localhost:8007
Borrower App brd_borrower_backend 8008 http://localhost:8008
Agents App brd_agents_backend 8009 http://localhost:8009
CRM brd_crm_backend 8010 http://localhost:8010
Finance Dashboard brd_finance_backend 8011 http://localhost:8011
Legal Dashboard brd_legal_backend 8012 http://localhost:8012
Website Main brd_website_backend 8013 http://localhost:8013
Frontend Services (React / Nginx):
Service Container Port URL
Merged
Tenant+Master
brd_merged_frontend 3000 http://localhost:3000
Tenant Admin brd_tenant_frontend 3001 http://localhost:3001
Master Admin brd_master_frontend 3002 http://localhost:3002
Operation Verify brd_operation_frontend 3003 http://localhost:3003
Sales CRM brd_sales_crm_frontend 3004 http://localhost:3004
Finance Dashboard brd_finance_frontend 3005 http://localhost:3005
Channel Partner brd_channel_partner_fronten
d
3006 http://localhost:3006
Legal Dashboard brd_legal_frontend 3007 http://localhost:3007
Fraud Team brd_fraud_frontend 3008 http://localhost:3008
Valuation brd_valuation_frontend 3009 http://localhost:3009
CRM brd_crm_frontend 3010 http://localhost:3010
Website Main brd_website_frontend 3011 http://localhost:3011
8. PRE-DEPLOYMENT SETUP
Step 4.1 – Clone / Pull the Repository
# If cloning fresh
git clone https://github.com/vizz-bob/BRD_Final2.git
cd BRD_Final2
# If already cloned – pull latest
cd BRD_Final2
git pull origin main
Step 4.2 – Create / Edit the .env File
The .env file is already created in the repo root. Edit it with your values:
nano .env
# Key variables to change:
POSTGRES_SUPERPASSWORD=your_strong_postgres_root_password
DB_PASSWORD=your_strong_app_db_password
DJANGO_SECRET_KEY=your_50_char_random_secret_key
PGADMIN_PASSWORD=your_pgadmin_password
Note: Never commit .env to Git. It is in .gitignore.
Step 4.3 – Verify Docker Installation
docker --version # Should be 24+
docker compose version # Should be v2.x
Step 4.4 – Configure Frontend API URLs
Each React frontend has a .env or config file pointing to its backend API. Update the API base URL in
each frontend's environment file before building:
# Example for BRD-MergedTenantMaster-Frontend
echo "VITE_API_BASE_URL=http://13.232.219.91:8000" > BRD-MergedTenantMaster-Fronten
d/.env
# Example for BRD_MasterAdmin_Frontend_1.1
echo "VITE_API_BASE_URL=http://13.232.219.91:8001" > BRD_MasterAdmin_Frontend_1.1/.
env
# Repeat for each frontend with its matching backend port
# Frontend:Backend port mapping:
# 3000 -> 8000 | 3001 -> 8002 | 3002 -> 8001
# 3003 -> 8006 | 3004 -> 8004 | 3005 -> 8011
# 3006 -> 8003 | 3007 -> 8012 | 3008 -> 8005
# 3009 -> 8007 | 3010 -> 8010 | 3011 -> 8013
5. STEP-BY-STEP: LOCAL DEPLOYMENT
Complete deployment on a local machine:
Step 1: Open terminal in the BRD_Final2 project root directory
Step 2: Ensure Docker Desktop (Mac/Windows) or Docker Engine (Linux) is running
Step 3: Build all images and start all services in detached mode
Step 4: Wait 2-3 minutes for all services to start (first build takes longer)
Step 5: Verify all containers are running
Step 6: Check service health and access URLs
Build and Start All Services:
# Navigate to project root
cd BRD_Final2
# Build all images and start in background
docker compose up --build -d
# Alternatively, start only infrastructure first:
docker compose up -d postgres redis
# Wait for postgres to be healthy, then start all:
docker compose up --build -d
Verify Running Containers:
# List all running containers
docker compose ps
# Check logs for a specific service
docker compose logs -f merged-backend
# Check logs for all services
docker compose logs -f
Access Your Services:
# Open in browser:
http://localhost:3000 → Merged Tenant+Master Frontend
http://localhost:3002 → Master Admin Frontend
http://localhost:3001 → Tenant Admin Frontend
http://localhost:5050 → pgAdmin (DB management)
# Test API directly:
curl http://localhost:8000/api/
curl http://localhost:8001/api/
6. STEP-BY-STEP: AWS EC2 DEPLOYMENT
Complete production deployment on AWS EC2 (Ubuntu 22.04):
Step 6.1 – Connect to EC2 Instance
ssh -i your-key.pem ubuntu@13.232.219.91
Step 6.2 – Install Docker Engine on EC2
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y
# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release
# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) \
signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli \
containerd.io docker-buildx-plugin docker-compose-plugin
# Add ubuntu user to docker group (avoid sudo)
sudo usermod -aG docker ubuntu
newgrp docker
# Verify
docker --version
docker compose version
Step 6.3 – Clone Repository on EC2
# Choose deployment directory
cd /home/ubuntu
# Clone the repository
git clone https://github.com/vizz-bob/BRD_Final2.git
cd BRD_Final2
Step 6.4 – Configure Environment Variables
# Edit .env file with production values
nano .env
# Update these values:
POSTGRES_SUPERPASSWORD=StrongProductionPassword123!
DB_PASSWORD=StrongAppPassword456!
DJANGO_SECRET_KEY=generate-50-char-random-string-here
PGADMIN_PASSWORD=AdminPass789!
EC2_IP=13.232.219.91
Step 6.5 – Configure Frontend API URLs
# Set API URLs to EC2 IP for each frontend
# Replace localhost with your EC2 IP in each frontend's env file
cat > BRD-MergedTenantMaster-Frontend/.env << EOF
VITE_API_BASE_URL=http://13.232.219.91:8000
EOF
cat > BRD_MasterAdmin_Frontend_1.1/.env << EOF
VITE_API_BASE_URL=http://13.232.219.91:8001
EOF
cat > BRD-TenantAdmin_backend_2.0/.env << EOF
VITE_API_BASE_URL=http://13.232.219.91:8002
EOF
# ... repeat for all other frontends
Step 6.6 – Build and Deploy
# Build all images (takes 15-30 min first time)
docker compose up --build -d
# Monitor build progress
docker compose logs -f
# Check all services are running
docker compose ps
Step 6.7 – Configure EC2 Security Group
In AWS Console → EC2 → Security Groups → Inbound Rules, add:
Type: Custom TCP Port: 3000-3011 Source: 0.0.0.0/0 (Frontends)
Type: Custom TCP Port: 8000-8013 Source: 0.0.0.0/0 (Backends)
Type: Custom TCP Port: 5050 Source: Your IP (pgAdmin)
Type: Custom TCP Port: 5432 Source: Your IP (PostgreSQL)
Step 6.8 – Enable Auto-start on Reboot
# Enable Docker to start on boot
sudo systemctl enable docker
# Create systemd service for compose
sudo tee /etc/systemd/system/brd-platform.service << EOF
[Unit]
Description=BRD Platform Docker Compose
Requires=docker.service
After=docker.service
[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/BRD_Final2
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable brd-platform
sudo systemctl start brd-platform
7. DATABASE SETUP & USER PERMISSIONS
PostgreSQL is automatically configured by docker/postgres-init.sql when the container starts for the first
time. This script creates all 14 databases and grants full permissions to brd_user.
Databases Created Automatically:
Database Name Backend Service Port
brd_merged_db Merged Tenant+Master Backend 8000
brd_master_db Master Admin Backend 8001
brd_tenant_db Tenant Admin Backend 8002
brd_channel_partner_db Channel Partner Backend 8003
brd_sales_crm_db Sales CRM Backend 8004
brd_fraud_db Fraud Team Backend 8005
brd_operation_db Operation Verify Backend 8006
brd_valuation_db Valuation Backend 8007
brd_borrower_db Borrower App Backend 8008
brd_agents_db Agents App Backend 8009
brd_crm_db CRM Backend 8010
brd_finance_db Finance Dashboard Backend 8011
brd_legal_db Legal Dashboard Backend 8012
brd_website_db Website Main Backend 8013
Manual Database Access (via psql):
# Connect to PostgreSQL container
docker exec -it brd_postgres psql -U postgres
# List all databases
\l
# Connect to a specific database
\c brd_master_db
# Check brd_user permissions
\du brd_user
# Verify tables after migrations
\dt
# Exit psql
\q
Verify User Permissions:
# Connect as brd_user and verify access
docker exec -it brd_postgres psql -U brd_user -d brd_master_db
# Check your current user
SELECT current_user, current_database();
# Should show brd_user and brd_master_db
If Permissions Need to Be Reapplied:
docker exec -it brd_postgres psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE brd_master_db TO brd_user;
GRANT ALL ON SCHEMA public TO brd_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO brd_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO brd_user;
\q
8. SERVICE HEALTH CHECKS
Verify all services are running correctly:
Check All Container Status:
docker compose ps
# Expected output: all services should show "running" status
# NAME STATUS PORTS
# brd_postgres running 0.0.0.0:5432->5432/tcp
# brd_redis running 0.0.0.0:6379->6379/tcp
# brd_merged_backend running 0.0.0.0:8000->8000/tcp
# brd_master_backend running 0.0.0.0:8001->8000/tcp
# ... (all 29 services should show running)
Test Backend API Endpoints:
# Test each backend (from server or locally)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/
# ... check 8000 through 8013
# Quick health check script for all backends:
for port in $(seq 8000 8013); do
status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/ 2>/dev/nu
ll)
echo "Port $port: HTTP $status"
done
Test Frontend Services:
# Quick health check for all frontends:
for port in $(seq 3000 3011); do
status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/ 2>/dev/nu
ll)
echo "Port $port: HTTP $status"
done
Check Database Connectivity:
# Verify PostgreSQL is accepting connections
docker exec -it brd_postgres pg_isready -U postgres
# Check Redis
docker exec -it brd_redis redis-cli ping
# Should respond: PONG
9. USEFUL DOCKER COMMANDS
Command Description Docker Command
Start all services docker compose up -d
Stop all services docker compose down
Restart a service docker compose restart merged-backend
View all logs docker compose logs -f
View specific service logs docker compose logs -f master-backend
Rebuild a single service docker compose up --build -d master-backend
Rebuild all services docker compose up --build -d
Execute command in
container
docker exec -it brd_merged_backend bash
Run Django management
command
docker exec -it brd_merged_backend python manage.py
createsuperuser
Run migrations manually docker exec -it brd_master_backend python manage.py
migrate
View container resource
usage
docker stats
Remove all stopped
containers
docker compose down --volumes
View container inspect docker inspect brd_postgres
Copy file from container docker cp brd_merged_backend:/app/logs.txt ./
Scale a service docker compose up -d --scale merged-backend=2
10. TROUBLESHOOTING
Problem: Container fails to start – database connection refused
Cause: PostgreSQL container not ready when Django starts
# Check postgres health
docker compose logs postgres
# Restart the failing backend after postgres is ready
docker compose restart merged-backend
# The entrypoint.sh retries migrations – check logs:
docker compose logs -f merged-backend
Problem: Port already in use (bind error)
Cause: Another process is using the port
# Find what's using port 8000
sudo lsof -i :8000
sudo netstat -tlnp | grep 8000
# Kill the process
sudo kill -9 <PID> # Or change the port in docker-compose.yml
ports:
- "8100:8000" # change host port
Problem: Frontend shows blank page or 404
Cause: Nginx not serving built files, or build failed
# Check frontend build logs
docker compose logs merged-frontend
# Re-build the frontend
docker compose up --build -d merged-frontend
# Check nginx inside container
docker exec -it brd_merged_frontend nginx -t
Problem: Django migration errors
Cause: Missing dependencies or conflicting migrations
# Run migration manually
docker exec -it brd_master_backend python manage.py migrate --noinput
# Check migration status
docker exec -it brd_master_backend python manage.py showmigrations
# Fake initial migration if needed
docker exec -it brd_master_backend python manage.py migrate --fake-initial
Problem: Permission denied on entrypoint.sh
Cause: Script not executable
# Fix locally before build
chmod +x BRD-MergedTenantMaster-Backend/entrypoint.sh
# Or rebuild the image
docker compose up --build -d merged-backend
Problem: Out of disk space during build
Cause: Docker image cache accumulation
# Clean unused images and volumes
docker system prune -a
docker volume prune
# Check disk usage
df -h
docker system df
11. ENVIRONMENT VARIABLES REFERENCE
All variables are defined in the .env file in the project root:
Variable Description Default Value
POSTGRES_SUPERUSER PostgreSQL root user postgres
POSTGRES_SUPERPASS
WORD
PostgreSQL root password postgres_root_pass
DB_USER Application DB user brd_user
DB_PASSWORD Application DB user password Brd@Secure2024!
DB_HOST DB host (set in docker-compose) postgres
DB_PORT DB port 5432
DJANGO_SECRET_KEY Django secret key (CHANGE
THIS!)
dev-secret-key
SSO_SECRET_KEY SSO signing key (see .env)
DEBUG Django debug mode False
PGADMIN_EMAIL pgAdmin login email admin@brd.com
PGADMIN_PASSWORD pgAdmin login password admin123
EC2_IP EC2 public IP address 13.232.219.91
Per-Backend Environment Variables (set in docker-compose.yml):
Variable Description
DB_NAME Database name specific to each backend (e.g. brd_master_db)
DJANGO_SETTINGS_MOD
ULE
The Python dotted path to the settings module
REDIS_URL Redis connection URL – redis://redis:6379/0
ALLOWED_HOSTS Set to * for development; restrict in production
CORS_ALLOWED_ORIGIN
S
Frontend URLs allowed to make API calls
12. RE-DEPLOYMENT & UPDATES
When you push code changes and need to re-deploy:
Update a Single Service:
# Pull latest code
git pull origin main
# Rebuild and restart just the changed service
docker compose up --build -d master-backend
# Verify the update
docker compose logs -f master-backend
Update All Services:
# Pull latest code
git pull origin main
# Rebuild all images and restart all services
docker compose up --build -d
# This performs a rolling restart with minimal downtime
Database Schema Changes:
# After adding new models or changing fields:
# Migrations run automatically on service startup via entrypoint.sh
# To run manually:
docker exec -it brd_master_backend python manage.py makemigrations
docker exec -it brd_master_backend python manage.py migrate
# Apply migrations to all backends:
for svc in merged-backend master-backend tenant-backend channel-partner-backend; do
docker exec -it brd_${svc//-/_} python manage.py migrate --noinput
done
Create Django Superuser (One-Time):
# Create admin user for Merged Backend
docker exec -it brd_merged_backend python manage.py createsuperuser
# Create admin user for Master Backend
docker exec -it brd_master_backend python manage.py createsuperuser
# Repeat for any backend that needs admin access
# Django admin panel: http://localhost:<port>/admin/
Backup & Restore Database:
# Backup all databases
docker exec brd_postgres pg_dumpall -U postgres > brd_backup_$(date +%Y%m%d).sql
# Restore from backup
docker exec -i brd_postgres psql -U postgres < brd_backup_20240401.sql
# Backup a single database
docker exec brd_postgres pg_dump -U postgres brd_master_db > master_db_backup.sql
This document was generated automatically on April 01, 2026 for the BRD Platform project. Keep this
document confidential – it contains infrastructure details.
