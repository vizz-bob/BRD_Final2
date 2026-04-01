"""
BRD Platform – Docker Deployment Guide PDF Generator
Run: python3 docker/generate_pdf.py
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import datetime

OUTPUT = "BRD_Docker_Deployment_Guide.pdf"

# ── Colour palette ─────────────────────────────────────────
C_NAVY    = colors.HexColor("#1a3a5c")
C_BLUE    = colors.HexColor("#2563eb")
C_LIGHT   = colors.HexColor("#eff6ff")
C_GREEN   = colors.HexColor("#16a34a")
C_RED     = colors.HexColor("#dc2626")
C_ORANGE  = colors.HexColor("#ea580c")
C_GRAY    = colors.HexColor("#6b7280")
C_LGRAY   = colors.HexColor("#f3f4f6")
C_WHITE   = colors.white
C_BLACK   = colors.black

styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, parent=styles['Normal'], **kw)

# ── Custom styles ──────────────────────────────────────────
sTitle   = S("sTitle",   fontSize=26, textColor=C_WHITE,  alignment=TA_CENTER, spaceAfter=6,  fontName="Helvetica-Bold")
sSub     = S("sSub",     fontSize=13, textColor=C_LIGHT,  alignment=TA_CENTER, spaceAfter=4,  fontName="Helvetica")
sH1      = S("sH1",      fontSize=16, textColor=C_NAVY,   spaceBefore=14, spaceAfter=6,  fontName="Helvetica-Bold")
sH2      = S("sH2",      fontSize=13, textColor=C_BLUE,   spaceBefore=10, spaceAfter=4,  fontName="Helvetica-Bold")
sH3      = S("sH3",      fontSize=11, textColor=C_NAVY,   spaceBefore=8,  spaceAfter=3,  fontName="Helvetica-Bold")
sBody    = S("sBody",    fontSize=10, textColor=C_BLACK,  spaceAfter=4,  fontName="Helvetica",      leading=14)
sBullet  = S("sBullet",  fontSize=10, textColor=C_BLACK,  leftIndent=14, spaceAfter=3,  fontName="Helvetica",      leading=13)
sCode    = S("sCode",    fontSize=9,  textColor=C_NAVY,   backColor=C_LGRAY, leftIndent=10, rightIndent=10,
             spaceBefore=4, spaceAfter=4, fontName="Courier", leading=13, borderPadding=(4,6,4,6))
sNote    = S("sNote",    fontSize=9,  textColor=C_ORANGE, leftIndent=10, spaceAfter=3,  fontName="Helvetica-Oblique")
sWarn    = S("sWarn",    fontSize=9,  textColor=C_RED,    leftIndent=10, spaceAfter=3,  fontName="Helvetica-Bold")
sCenter  = S("sCenter",  fontSize=10, textColor=C_GRAY,   alignment=TA_CENTER, spaceAfter=4, fontName="Helvetica")

def HR(): return HRFlowable(width="100%", thickness=1, color=C_BLUE, spaceAfter=6, spaceBefore=6)
def SP(h=6): return Spacer(1, h)

def code_block(text):
    lines = text.strip().split('\n')
    out = []
    for line in lines:
        out.append(Paragraph(line.replace(' ', '&nbsp;').replace('<', '&lt;').replace('>', '&gt;'), sCode))
    return out

def table_style(header_color=C_NAVY):
    return TableStyle([
        ('BACKGROUND', (0,0), (-1,0), header_color),
        ('TEXTCOLOR',  (0,0), (-1,0), C_WHITE),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,0), 9),
        ('FONTNAME',   (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE',   (0,1), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_LGRAY]),
        ('GRID',       (0,0), (-1,-1), 0.5, C_GRAY),
        ('VALIGN',     (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING',(0,0),(-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING',(0,0), (-1,-1), 6),
    ])

def cover_page():
    story = []
    # Cover banner
    cover_data = [[Paragraph("BRD PLATFORM", sTitle)],
                  [Paragraph("Docker Deployment Guide", sSub)],
                  [Paragraph(f"Generated: {datetime.date.today().strftime('%B %d, %Y')}", sSub)],
                  [Paragraph("EC2 Instance: 13.232.219.91", sSub)]]
    t = Table(cover_data, colWidths=[16*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_NAVY),
        ('TOPPADDING',    (0,0),(-1,-1), 14),
        ('BOTTOMPADDING', (0,0),(-1,-1), 14),
        ('LEFTPADDING',   (0,0),(-1,-1), 20),
        ('RIGHTPADDING',  (0,0),(-1,-1), 20),
        ('ROUNDEDCORNERS', [8]),
    ]))
    story += [SP(60), t, SP(30)]

    # Quick summary box
    summary = [
        [Paragraph("PROJECT SUMMARY", S("ps", fontSize=11, fontName="Helvetica-Bold", textColor=C_NAVY))],
        [Paragraph("• 14 Django Backend Services  (ports 8000–8013)", sBody)],
        [Paragraph("• 12 React Frontend Services   (ports 3000–3011)", sBody)],
        [Paragraph("• 1 PostgreSQL Database Server (port 5432)", sBody)],
        [Paragraph("• 1 Redis Cache Server          (port 6379)", sBody)],
        [Paragraph("• 1 pgAdmin UI                  (port 5050)", sBody)],
        [Paragraph("• Single docker-compose.yml orchestrates everything", sBody)],
    ]
    ts = Table(summary, colWidths=[16*cm])
    ts.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_LIGHT),
        ('BACKGROUND', (0,1), (-1,-1), C_WHITE),
        ('BOX', (0,0),(-1,-1), 1, C_BLUE),
        ('TOPPADDING',    (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 6),
        ('LEFTPADDING',   (0,0),(-1,-1), 12),
    ]))
    story += [ts, PageBreak()]
    return story

def toc_section():
    story = [Paragraph("TABLE OF CONTENTS", sH1), HR()]
    toc_items = [
        ("1.", "Prerequisites & System Requirements"),
        ("2.", "Project Structure Overview"),
        ("3.", "Port Reference Map"),
        ("4.", "Pre-Deployment Setup"),
        ("5.", "Step-by-Step Deployment (Local Machine)"),
        ("6.", "Step-by-Step Deployment (AWS EC2)"),
        ("7.", "Database Setup & User Permissions"),
        ("8.", "Service Health Checks"),
        ("9.", "Useful Docker Commands"),
        ("10.","Troubleshooting"),
        ("11.","Environment Variables Reference"),
        ("12.","Re-deployment & Updates"),
    ]
    data = [[Paragraph(n, sBody), Paragraph(t, sBody)] for n,t in toc_items]
    t = Table(data, colWidths=[1.2*cm, 14.8*cm])
    t.setStyle(TableStyle([
        ('FONTNAME',      (0,0),(-1,-1), 'Helvetica'),
        ('FONTSIZE',      (0,0),(-1,-1), 10),
        ('ROWBACKGROUNDS',(0,0),(-1,-1), [C_WHITE, C_LGRAY]),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LEFTPADDING',   (0,0),(-1,-1), 6),
    ]))
    story += [t, PageBreak()]
    return story

def section_1():
    story = [Paragraph("1. PREREQUISITES & SYSTEM REQUIREMENTS", sH1), HR()]
    story.append(Paragraph("Install the following on the server/EC2 instance before beginning:", sBody))
    story.append(SP(4))
    reqs = [
        ["Tool", "Version", "Install Command"],
        ["Docker Engine", "24+", "sudo apt install docker.io"],
        ["Docker Compose", "v2 (plugin)", "sudo apt install docker-compose-plugin"],
        ["Git", "Latest", "sudo apt install git"],
        ["Node.js", "20+ (build only)", "nvm install 20"],
        ["Python", "3.12 (build only)", "sudo apt install python3.12"],
        ["curl / wget", "Any", "Pre-installed on Ubuntu"],
    ]
    t = Table([[Paragraph(c, sBody) for c in row] for row in reqs],
              colWidths=[4*cm, 3.5*cm, 8.5*cm])
    t.setStyle(table_style())
    story += [t, SP(8)]

    story.append(Paragraph("Minimum Server Specs (EC2 Recommended):", sH3))
    specs = [
        ["Component", "Minimum", "Recommended"],
        ["Instance Type", "t3.large", "t3.xlarge or c5.xlarge"],
        ["vCPUs", "2", "4"],
        ["RAM", "8 GB", "16 GB"],
        ["Storage (EBS)", "50 GB gp3", "100 GB gp3"],
        ["OS", "Ubuntu 22.04 LTS", "Ubuntu 22.04 LTS"],
    ]
    t2 = Table([[Paragraph(c, sBody) for c in row] for row in specs],
               colWidths=[4*cm, 3.5*cm, 8.5*cm])
    t2.setStyle(table_style())
    story += [t2, SP(8)]

    story.append(Paragraph("AWS Security Group – Required Inbound Rules:", sH3))
    sg = [
        ["Port(s)", "Protocol", "Source", "Purpose"],
        ["22",         "TCP", "Your IP", "SSH access"],
        ["80",         "TCP", "0.0.0.0/0", "HTTP (optional)"],
        ["443",        "TCP", "0.0.0.0/0", "HTTPS (optional)"],
        ["3000–3011",  "TCP", "0.0.0.0/0", "All Frontend services"],
        ["8000–8013",  "TCP", "0.0.0.0/0", "All Backend services"],
        ["5432",       "TCP", "Your IP (admin only)", "PostgreSQL (restrict access!)"],
        ["5050",       "TCP", "Your IP (admin only)", "pgAdmin"],
        ["6379",       "TCP", "VPC only", "Redis (internal only)"],
    ]
    t3 = Table([[Paragraph(c, sBody) for c in row] for row in sg],
               colWidths=[3*cm, 2.5*cm, 4.5*cm, 6*cm])
    t3.setStyle(table_style())
    story += [t3, PageBreak()]
    return story

def section_2():
    story = [Paragraph("2. PROJECT STRUCTURE OVERVIEW", sH1), HR()]
    story.append(Paragraph("The BRD_Final2 repository contains 26 services as sub-directories:", sBody))
    story += code_block("""BRD_Final2/
├── docker-compose.yml          ← Main orchestration file
├── .env                        ← Environment variables (DO NOT commit)
├── docker/
│   ├── entrypoint.sh           ← Shared Django startup script
│   ├── postgres-init.sql       ← DB creation + user permissions
│   ├── nginx-frontend.conf     ← Nginx config template
│   └── patch_settings.py       ← One-time settings patcher
│
├── BRD-MergedTenantMaster-Backend/   [port 8000]
├── BRD_MasterAdmin_Backend_1.1/      [port 8001]
├── BRD-TenantAdmin_backend_2.0/      [port 8002]
├── BRD-ChannelPartnerDashboard-Backend/ [port 8003]
├── BRD-SalesCRM-Dashboard-Backend/   [port 8004]
├── BRD-FraudTeam-Dashboard-Backend/  [port 8005]
├── BRD-OperationVerification-Backend/[port 8006]
├── BRD-Valuation-Dashboard-Backend/  [port 8007]
├── BRD-BorrowerApp-Backend/          [port 8008]
├── BRD-AgentsApp-Backend/            [port 8009]
├── BRD_CRM_1.1_BACKEND/              [port 8010]
├── BRD_FINANCE_DASHBOARD_Backend/    [port 8011]
├── BRD-LegalDashboard-Backend/       [port 8012]
├── BRD-website-main-backend/         [port 8013]
│
├── BRD-MergedTenantMaster-Frontend/  [port 3000]
├── BRD_TenantAdmin_Frontend_1.1/     [port 3001]
├── BRD_MasterAdmin_Frontend_1.1/     [port 3002]
├── BRD-Operation-Verification-Dashboard/ [port 3003]
├── BRD_SALES_CRM/                    [port 3004]
├── BRD_FINANCE_DASHBOARD/            [port 3005]
├── BRD-ChannelPartner-Dashboard/     [port 3006]
├── BRD-LEGAL-dashboard/              [port 3007]
├── BRD-FraudTeamDashboard/           [port 3008]
├── BRD-ValuationDashboard/           [port 3009]
├── BRD_CRM-1.1/                      [port 3010]
└── BRD-website-main/                 [port 3011]""")
    story.append(PageBreak())
    return story

def section_3():
    story = [Paragraph("3. PORT REFERENCE MAP", sH1), HR()]
    story.append(Paragraph("Infrastructure Services:", sH2))
    infra = [
        ["Service", "Container Name", "Host Port", "URL"],
        ["PostgreSQL",  "brd_postgres", "5432", "postgresql://localhost:5432"],
        ["Redis",       "brd_redis",    "6379", "redis://localhost:6379"],
        ["pgAdmin",     "brd_pgadmin",  "5050", "http://localhost:5050"],
    ]
    t = Table([[Paragraph(c, sBody) for c in row] for row in infra],
              colWidths=[4*cm, 4*cm, 2.5*cm, 5.5*cm])
    t.setStyle(table_style(C_GREEN))
    story += [t, SP(10)]

    story.append(Paragraph("Backend Services (Django / Gunicorn):", sH2))
    backends = [
        ["Service", "Container", "Port", "URL"],
        ["Merged Tenant+Master", "brd_merged_backend",        "8000","http://localhost:8000"],
        ["Master Admin",          "brd_master_backend",        "8001","http://localhost:8001"],
        ["Tenant Admin",          "brd_tenant_backend",        "8002","http://localhost:8002"],
        ["Channel Partner",       "brd_channel_partner_backend","8003","http://localhost:8003"],
        ["Sales CRM",             "brd_sales_crm_backend",     "8004","http://localhost:8004"],
        ["Fraud Team",            "brd_fraud_backend",         "8005","http://localhost:8005"],
        ["Operation Verify",      "brd_operation_backend",     "8006","http://localhost:8006"],
        ["Valuation",             "brd_valuation_backend",     "8007","http://localhost:8007"],
        ["Borrower App",          "brd_borrower_backend",      "8008","http://localhost:8008"],
        ["Agents App",            "brd_agents_backend",        "8009","http://localhost:8009"],
        ["CRM",                   "brd_crm_backend",           "8010","http://localhost:8010"],
        ["Finance Dashboard",     "brd_finance_backend",       "8011","http://localhost:8011"],
        ["Legal Dashboard",       "brd_legal_backend",         "8012","http://localhost:8012"],
        ["Website Main",          "brd_website_backend",       "8013","http://localhost:8013"],
    ]
    t2 = Table([[Paragraph(c, sBody) for c in row] for row in backends],
               colWidths=[4*cm, 5*cm, 1.5*cm, 5.5*cm])
    t2.setStyle(table_style())
    story += [t2, SP(10)]

    story.append(Paragraph("Frontend Services (React / Nginx):", sH2))
    frontends = [
        ["Service", "Container", "Port", "URL"],
        ["Merged Tenant+Master", "brd_merged_frontend",         "3000","http://localhost:3000"],
        ["Tenant Admin",          "brd_tenant_frontend",         "3001","http://localhost:3001"],
        ["Master Admin",          "brd_master_frontend",         "3002","http://localhost:3002"],
        ["Operation Verify",      "brd_operation_frontend",      "3003","http://localhost:3003"],
        ["Sales CRM",             "brd_sales_crm_frontend",      "3004","http://localhost:3004"],
        ["Finance Dashboard",     "brd_finance_frontend",        "3005","http://localhost:3005"],
        ["Channel Partner",       "brd_channel_partner_frontend","3006","http://localhost:3006"],
        ["Legal Dashboard",       "brd_legal_frontend",          "3007","http://localhost:3007"],
        ["Fraud Team",            "brd_fraud_frontend",          "3008","http://localhost:3008"],
        ["Valuation",             "brd_valuation_frontend",      "3009","http://localhost:3009"],
        ["CRM",                   "brd_crm_frontend",            "3010","http://localhost:3010"],
        ["Website Main",          "brd_website_frontend",        "3011","http://localhost:3011"],
    ]
    t3 = Table([[Paragraph(c, sBody) for c in row] for row in frontends],
               colWidths=[4*cm, 5*cm, 1.5*cm, 5.5*cm])
    t3.setStyle(table_style(C_ORANGE))
    story.append(t3)
    story.append(PageBreak())
    return story

def section_4():
    story = [Paragraph("4. PRE-DEPLOYMENT SETUP", sH1), HR()]

    story.append(Paragraph("Step 4.1 – Clone / Pull the Repository", sH2))
    story += code_block("""# If cloning fresh
git clone https://github.com/vizz-bob/BRD_Final2.git
cd BRD_Final2

# If already cloned – pull latest
cd BRD_Final2
git pull origin main""")

    story.append(Paragraph("Step 4.2 – Create / Edit the .env File", sH2))
    story.append(Paragraph("The .env file is already created in the repo root. Edit it with your values:", sBody))
    story += code_block("""nano .env

# Key variables to change:
POSTGRES_SUPERPASSWORD=your_strong_postgres_root_password
DB_PASSWORD=your_strong_app_db_password
DJANGO_SECRET_KEY=your_50_char_random_secret_key
PGADMIN_PASSWORD=your_pgadmin_password""")
    story.append(Paragraph("Note: Never commit .env to Git. It is in .gitignore.", sWarn))

    story.append(Paragraph("Step 4.3 – Verify Docker Installation", sH2))
    story += code_block("""docker --version          # Should be 24+
docker compose version    # Should be v2.x""")

    story.append(Paragraph("Step 4.4 – Configure Frontend API URLs", sH2))
    story.append(Paragraph(
        "Each React frontend has a .env or config file pointing to its backend API. "
        "Update the API base URL in each frontend's environment file before building:", sBody))
    story += code_block("""# Example for BRD-MergedTenantMaster-Frontend
echo "VITE_API_BASE_URL=http://13.232.219.91:8000" > BRD-MergedTenantMaster-Frontend/.env

# Example for BRD_MasterAdmin_Frontend_1.1
echo "VITE_API_BASE_URL=http://13.232.219.91:8001" > BRD_MasterAdmin_Frontend_1.1/.env

# Repeat for each frontend with its matching backend port
# Frontend:Backend port mapping:
# 3000 -> 8000  |  3001 -> 8002  |  3002 -> 8001
# 3003 -> 8006  |  3004 -> 8004  |  3005 -> 8011
# 3006 -> 8003  |  3007 -> 8012  |  3008 -> 8005
# 3009 -> 8007  |  3010 -> 8010  |  3011 -> 8013""")
    story.append(PageBreak())
    return story

def section_5():
    story = [Paragraph("5. STEP-BY-STEP: LOCAL DEPLOYMENT", sH1), HR()]
    story.append(Paragraph("Complete deployment on a local machine:", sBody))

    steps = [
        ("Step 1", "Open terminal in the BRD_Final2 project root directory"),
        ("Step 2", "Ensure Docker Desktop (Mac/Windows) or Docker Engine (Linux) is running"),
        ("Step 3", "Build all images and start all services in detached mode"),
        ("Step 4", "Wait 2-3 minutes for all services to start (first build takes longer)"),
        ("Step 5", "Verify all containers are running"),
        ("Step 6", "Check service health and access URLs"),
    ]

    for step, desc in steps:
        story.append(Paragraph(f"<b>{step}:</b> {desc}", sBody))

    story.append(Paragraph("Build and Start All Services:", sH2))
    story += code_block("""# Navigate to project root
cd BRD_Final2

# Build all images and start in background
docker compose up --build -d

# Alternatively, start only infrastructure first:
docker compose up -d postgres redis
# Wait for postgres to be healthy, then start all:
docker compose up --build -d""")

    story.append(Paragraph("Verify Running Containers:", sH2))
    story += code_block("""# List all running containers
docker compose ps

# Check logs for a specific service
docker compose logs -f merged-backend

# Check logs for all services
docker compose logs -f""")

    story.append(Paragraph("Access Your Services:", sH2))
    story += code_block("""# Open in browser:
http://localhost:3000  → Merged Tenant+Master Frontend
http://localhost:3002  → Master Admin Frontend
http://localhost:3001  → Tenant Admin Frontend
http://localhost:5050  → pgAdmin (DB management)

# Test API directly:
curl http://localhost:8000/api/
curl http://localhost:8001/api/""")
    story.append(PageBreak())
    return story

def section_6():
    story = [Paragraph("6. STEP-BY-STEP: AWS EC2 DEPLOYMENT", sH1), HR()]
    story.append(Paragraph("Complete production deployment on AWS EC2 (Ubuntu 22.04):", sBody))

    story.append(Paragraph("Step 6.1 – Connect to EC2 Instance", sH2))
    story += code_block("""ssh -i your-key.pem ubuntu@13.232.219.91""")

    story.append(Paragraph("Step 6.2 – Install Docker Engine on EC2", sH2))
    story += code_block("""# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \\
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) \\
  signed-by=/etc/apt/keyrings/docker.gpg] \\
  https://download.docker.com/linux/ubuntu \\
  $(lsb_release -cs) stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli \\
  containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group (avoid sudo)
sudo usermod -aG docker ubuntu
newgrp docker

# Verify
docker --version
docker compose version""")

    story.append(Paragraph("Step 6.3 – Clone Repository on EC2", sH2))
    story += code_block("""# Choose deployment directory
cd /home/ubuntu

# Clone the repository
git clone https://github.com/vizz-bob/BRD_Final2.git
cd BRD_Final2""")

    story.append(Paragraph("Step 6.4 – Configure Environment Variables", sH2))
    story += code_block("""# Edit .env file with production values
nano .env

# Update these values:
POSTGRES_SUPERPASSWORD=StrongProductionPassword123!
DB_PASSWORD=StrongAppPassword456!
DJANGO_SECRET_KEY=generate-50-char-random-string-here
PGADMIN_PASSWORD=AdminPass789!
EC2_IP=13.232.219.91""")

    story.append(Paragraph("Step 6.5 – Configure Frontend API URLs", sH2))
    story += code_block("""# Set API URLs to EC2 IP for each frontend
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

# ... repeat for all other frontends""")

    story.append(Paragraph("Step 6.6 – Build and Deploy", sH2))
    story += code_block("""# Build all images (takes 15-30 min first time)
docker compose up --build -d

# Monitor build progress
docker compose logs -f

# Check all services are running
docker compose ps""")

    story.append(Paragraph("Step 6.7 – Configure EC2 Security Group", sH2))
    story.append(Paragraph(
        "In AWS Console → EC2 → Security Groups → Inbound Rules, add:", sBody))
    story += code_block("""Type: Custom TCP   Port: 3000-3011   Source: 0.0.0.0/0  (Frontends)
Type: Custom TCP   Port: 8000-8013   Source: 0.0.0.0/0  (Backends)
Type: Custom TCP   Port: 5050        Source: Your IP     (pgAdmin)
Type: Custom TCP   Port: 5432        Source: Your IP     (PostgreSQL)""")

    story.append(Paragraph("Step 6.8 – Enable Auto-start on Reboot", sH2))
    story += code_block("""# Enable Docker to start on boot
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
sudo systemctl start brd-platform""")
    story.append(PageBreak())
    return story

def section_7():
    story = [Paragraph("7. DATABASE SETUP & USER PERMISSIONS", sH1), HR()]
    story.append(Paragraph(
        "PostgreSQL is automatically configured by docker/postgres-init.sql when the "
        "container starts for the first time. This script creates all 14 databases and "
        "grants full permissions to brd_user.", sBody))

    story.append(Paragraph("Databases Created Automatically:", sH2))
    dbs = [
        ["Database Name",      "Backend Service",              "Port"],
        ["brd_merged_db",      "Merged Tenant+Master Backend", "8000"],
        ["brd_master_db",      "Master Admin Backend",         "8001"],
        ["brd_tenant_db",      "Tenant Admin Backend",         "8002"],
        ["brd_channel_partner_db","Channel Partner Backend",   "8003"],
        ["brd_sales_crm_db",   "Sales CRM Backend",            "8004"],
        ["brd_fraud_db",       "Fraud Team Backend",           "8005"],
        ["brd_operation_db",   "Operation Verify Backend",     "8006"],
        ["brd_valuation_db",   "Valuation Backend",            "8007"],
        ["brd_borrower_db",    "Borrower App Backend",         "8008"],
        ["brd_agents_db",      "Agents App Backend",           "8009"],
        ["brd_crm_db",         "CRM Backend",                  "8010"],
        ["brd_finance_db",     "Finance Dashboard Backend",    "8011"],
        ["brd_legal_db",       "Legal Dashboard Backend",      "8012"],
        ["brd_website_db",     "Website Main Backend",         "8013"],
    ]
    t = Table([[Paragraph(c, sBody) for c in row] for row in dbs],
              colWidths=[5*cm, 7*cm, 4*cm])
    t.setStyle(table_style())
    story += [t, SP(10)]

    story.append(Paragraph("Manual Database Access (via psql):", sH2))
    story += code_block("""# Connect to PostgreSQL container
docker exec -it brd_postgres psql -U postgres

# List all databases
\\l

# Connect to a specific database
\\c brd_master_db

# Check brd_user permissions
\\du brd_user

# Verify tables after migrations
\\dt

# Exit psql
\\q""")

    story.append(Paragraph("Verify User Permissions:", sH2))
    story += code_block("""# Connect as brd_user and verify access
docker exec -it brd_postgres psql -U brd_user -d brd_master_db

# Check your current user
SELECT current_user, current_database();

# Should show brd_user and brd_master_db""")

    story.append(Paragraph("If Permissions Need to Be Reapplied:", sH2))
    story += code_block("""docker exec -it brd_postgres psql -U postgres

GRANT ALL PRIVILEGES ON DATABASE brd_master_db TO brd_user;
GRANT ALL ON SCHEMA public TO brd_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO brd_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO brd_user;
\\q""")
    story.append(PageBreak())
    return story

def section_8():
    story = [Paragraph("8. SERVICE HEALTH CHECKS", sH1), HR()]
    story.append(Paragraph("Verify all services are running correctly:", sBody))

    story.append(Paragraph("Check All Container Status:", sH2))
    story += code_block("""docker compose ps

# Expected output: all services should show "running" status
# NAME                        STATUS      PORTS
# brd_postgres                running     0.0.0.0:5432->5432/tcp
# brd_redis                   running     0.0.0.0:6379->6379/tcp
# brd_merged_backend           running     0.0.0.0:8000->8000/tcp
# brd_master_backend           running     0.0.0.0:8001->8000/tcp
# ... (all 29 services should show running)""")

    story.append(Paragraph("Test Backend API Endpoints:", sH2))
    story += code_block("""# Test each backend (from server or locally)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/
curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/
# ... check 8000 through 8013

# Quick health check script for all backends:
for port in $(seq 8000 8013); do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/ 2>/dev/null)
  echo "Port $port: HTTP $status"
done""")

    story.append(Paragraph("Test Frontend Services:", sH2))
    story += code_block("""# Quick health check for all frontends:
for port in $(seq 3000 3011); do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/ 2>/dev/null)
  echo "Port $port: HTTP $status"
done""")

    story.append(Paragraph("Check Database Connectivity:", sH2))
    story += code_block("""# Verify PostgreSQL is accepting connections
docker exec -it brd_postgres pg_isready -U postgres

# Check Redis
docker exec -it brd_redis redis-cli ping
# Should respond: PONG""")
    story.append(PageBreak())
    return story

def section_9():
    story = [Paragraph("9. USEFUL DOCKER COMMANDS", sH1), HR()]

    cmds = [
        ("Start all services", "docker compose up -d"),
        ("Stop all services", "docker compose down"),
        ("Restart a service", "docker compose restart merged-backend"),
        ("View all logs", "docker compose logs -f"),
        ("View specific service logs", "docker compose logs -f master-backend"),
        ("Rebuild a single service", "docker compose up --build -d master-backend"),
        ("Rebuild all services", "docker compose up --build -d"),
        ("Execute command in container", "docker exec -it brd_merged_backend bash"),
        ("Run Django management command", "docker exec -it brd_merged_backend python manage.py createsuperuser"),
        ("Run migrations manually", "docker exec -it brd_master_backend python manage.py migrate"),
        ("View container resource usage", "docker stats"),
        ("Remove all stopped containers", "docker compose down --volumes"),
        ("View container inspect", "docker inspect brd_postgres"),
        ("Copy file from container", "docker cp brd_merged_backend:/app/logs.txt ./"),
        ("Scale a service", "docker compose up -d --scale merged-backend=2"),
    ]

    data = [["Command Description", "Docker Command"]]
    for desc, cmd in cmds:
        data.append([Paragraph(desc, sBody), Paragraph(cmd.replace(' ', '&nbsp;'), sCode)])
    t = Table(data, colWidths=[5*cm, 11*cm])
    t.setStyle(table_style())
    story += [t, PageBreak()]
    return story

def section_10():
    story = [Paragraph("10. TROUBLESHOOTING", sH1), HR()]

    issues = [
        {
            "problem": "Container fails to start – database connection refused",
            "cause": "PostgreSQL container not ready when Django starts",
            "solution": """# Check postgres health
docker compose logs postgres

# Restart the failing backend after postgres is ready
docker compose restart merged-backend

# The entrypoint.sh retries migrations – check logs:
docker compose logs -f merged-backend""",
        },
        {
            "problem": "Port already in use (bind error)",
            "cause": "Another process is using the port",
            "solution": """# Find what's using port 8000
sudo lsof -i :8000
sudo netstat -tlnp | grep 8000

# Kill the process
sudo kill -9 <PID>

# Or change the port in docker-compose.yml
ports:
  - "8100:8000"   # change host port""",
        },
        {
            "problem": "Frontend shows blank page or 404",
            "cause": "Nginx not serving built files, or build failed",
            "solution": """# Check frontend build logs
docker compose logs merged-frontend

# Re-build the frontend
docker compose up --build -d merged-frontend

# Check nginx inside container
docker exec -it brd_merged_frontend nginx -t""",
        },
        {
            "problem": "Django migration errors",
            "cause": "Missing dependencies or conflicting migrations",
            "solution": """# Run migration manually
docker exec -it brd_master_backend python manage.py migrate --noinput

# Check migration status
docker exec -it brd_master_backend python manage.py showmigrations

# Fake initial migration if needed
docker exec -it brd_master_backend python manage.py migrate --fake-initial""",
        },
        {
            "problem": "Permission denied on entrypoint.sh",
            "cause": "Script not executable",
            "solution": """# Fix locally before build
chmod +x BRD-MergedTenantMaster-Backend/entrypoint.sh

# Or rebuild the image
docker compose up --build -d merged-backend""",
        },
        {
            "problem": "Out of disk space during build",
            "cause": "Docker image cache accumulation",
            "solution": """# Clean unused images and volumes
docker system prune -a
docker volume prune

# Check disk usage
df -h
docker system df""",
        },
    ]

    for item in issues:
        story.append(Paragraph(f"Problem: {item['problem']}", sH3))
        story.append(Paragraph(f"Cause: {item['cause']}", sNote))
        story += code_block(item['solution'])
        story.append(SP(6))

    story.append(PageBreak())
    return story

def section_11():
    story = [Paragraph("11. ENVIRONMENT VARIABLES REFERENCE", sH1), HR()]
    story.append(Paragraph("All variables are defined in the .env file in the project root:", sBody))

    env_vars = [
        ["Variable", "Description", "Default Value"],
        ["POSTGRES_SUPERUSER",    "PostgreSQL root user",           "postgres"],
        ["POSTGRES_SUPERPASSWORD","PostgreSQL root password",        "postgres_root_pass"],
        ["DB_USER",               "Application DB user",            "brd_user"],
        ["DB_PASSWORD",           "Application DB user password",   "Brd@Secure2024!"],
        ["DB_HOST",               "DB host (set in docker-compose)","postgres"],
        ["DB_PORT",               "DB port",                        "5432"],
        ["DJANGO_SECRET_KEY",     "Django secret key (CHANGE THIS!)","dev-secret-key"],
        ["SSO_SECRET_KEY",        "SSO signing key",                "(see .env)"],
        ["DEBUG",                 "Django debug mode",              "False"],
        ["PGADMIN_EMAIL",         "pgAdmin login email",            "admin@brd.com"],
        ["PGADMIN_PASSWORD",      "pgAdmin login password",         "admin123"],
        ["EC2_IP",                "EC2 public IP address",          "13.232.219.91"],
    ]
    t = Table([[Paragraph(c, sBody) for c in row] for row in env_vars],
              colWidths=[5*cm, 6*cm, 5*cm])
    t.setStyle(table_style())
    story += [t, SP(10)]

    story.append(Paragraph("Per-Backend Environment Variables (set in docker-compose.yml):", sH2))
    per_backend = [
        ["Variable",             "Description"],
        ["DB_NAME",              "Database name specific to each backend (e.g. brd_master_db)"],
        ["DJANGO_SETTINGS_MODULE","The Python dotted path to the settings module"],
        ["REDIS_URL",            "Redis connection URL – redis://redis:6379/0"],
        ["ALLOWED_HOSTS",        "Set to * for development; restrict in production"],
        ["CORS_ALLOWED_ORIGINS", "Frontend URLs allowed to make API calls"],
    ]
    t2 = Table([[Paragraph(c, sBody) for c in row] for row in per_backend],
               colWidths=[5*cm, 11*cm])
    t2.setStyle(table_style())
    story += [t2, PageBreak()]
    return story

def section_12():
    story = [Paragraph("12. RE-DEPLOYMENT & UPDATES", sH1), HR()]
    story.append(Paragraph("When you push code changes and need to re-deploy:", sBody))

    story.append(Paragraph("Update a Single Service:", sH2))
    story += code_block("""# Pull latest code
git pull origin main

# Rebuild and restart just the changed service
docker compose up --build -d master-backend

# Verify the update
docker compose logs -f master-backend""")

    story.append(Paragraph("Update All Services:", sH2))
    story += code_block("""# Pull latest code
git pull origin main

# Rebuild all images and restart all services
docker compose up --build -d

# This performs a rolling restart with minimal downtime""")

    story.append(Paragraph("Database Schema Changes:", sH2))
    story += code_block("""# After adding new models or changing fields:
# Migrations run automatically on service startup via entrypoint.sh

# To run manually:
docker exec -it brd_master_backend python manage.py makemigrations
docker exec -it brd_master_backend python manage.py migrate

# Apply migrations to all backends:
for svc in merged-backend master-backend tenant-backend channel-partner-backend; do
  docker exec -it brd_${svc//-/_} python manage.py migrate --noinput
done""")

    story.append(Paragraph("Create Django Superuser (One-Time):", sH2))
    story += code_block("""# Create admin user for Merged Backend
docker exec -it brd_merged_backend python manage.py createsuperuser

# Create admin user for Master Backend
docker exec -it brd_master_backend python manage.py createsuperuser

# Repeat for any backend that needs admin access
# Django admin panel: http://localhost:<port>/admin/""")

    story.append(Paragraph("Backup & Restore Database:", sH2))
    story += code_block("""# Backup all databases
docker exec brd_postgres pg_dumpall -U postgres > brd_backup_$(date +%Y%m%d).sql

# Restore from backup
docker exec -i brd_postgres psql -U postgres < brd_backup_20240401.sql

# Backup a single database
docker exec brd_postgres pg_dump -U postgres brd_master_db > master_db_backup.sql""")

    story.append(SP(10))
    story.append(HR())
    story.append(Paragraph(
        "This document was generated automatically on "
        f"{datetime.date.today().strftime('%B %d, %Y')} for the BRD Platform project. "
        "Keep this document confidential – it contains infrastructure details.",
        sCenter))
    return story

def build_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title="BRD Platform Docker Deployment Guide",
        author="BRD Platform Team",
    )

    story = []
    story += cover_page()
    story += toc_section()
    story += section_1()
    story += section_2()
    story += section_3()
    story += section_4()
    story += section_5()
    story += section_6()
    story += section_7()
    story += section_8()
    story += section_9()
    story += section_10()
    story += section_11()
    story += section_12()

    doc.build(story)
    print(f"PDF saved to: {output_path}")

if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else OUTPUT
    build_pdf(out)
