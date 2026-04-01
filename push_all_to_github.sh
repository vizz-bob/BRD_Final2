#!/bin/bash
# ============================================================
# BRD Platform – Push ALL Changes to GitHub
# Run this from inside your BRD_Final2 folder:
#   chmod +x push_all_to_github.sh
#   ./push_all_to_github.sh
# ============================================================
set -e

ROOT_DIR="$(pwd)"
COMMIT_MSG="Add Docker setup: Dockerfiles, docker-compose, entrypoint, DB init, settings patch"

echo "========================================"
echo "  BRD Platform – GitHub Push Script"
echo "========================================"
echo ""

# List of all service subdirectories (submodules)
SERVICES=(
  "BRD-MergedTenantMaster-Backend"
  "BRD_MasterAdmin_Backend_1.1"
  "BRD-TenantAdmin_backend_2.0"
  "BRD-ChannelPartnerDashboard-Backend"
  "BRD-SalesCRM-Dashboard-Backend"
  "BRD-FraudTeam-Dashboard-Backend"
  "BRD-OperationVerification-Backend"
  "BRD-Valuation-Dashboard-Backend"
  "BRD-BorrowerApp-Backend"
  "BRD-AgentsApp-Backend"
  "BRD_CRM_1.1_BACKEND"
  "BRD_FINANCE_DASHBOARD_Backend"
  "BRD-LegalDashboard-Backend"
  "BRD-website-main-backend"
  "BRD-MergedTenantMaster-Frontend"
  "BRD_TenantAdmin_Frontend_1.1"
  "BRD_MasterAdmin_Frontend_1.1"
  "BRD-Operation-Verification-Dashboard"
  "BRD_SALES_CRM"
  "BRD_FINANCE_DASHBOARD"
  "BRD-ChannelPartner-Dashboard"
  "BRD-LEGAL-dashboard"
  "BRD-FraudTeamDashboard"
  "BRD-ValuationDashboard"
  "BRD_CRM-1.1"
  "BRD-website-main"
)

echo "[1/3] Committing and pushing each service repository..."
echo ""

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_PATH="$ROOT_DIR/$SERVICE"

  if [ ! -d "$SERVICE_PATH/.git" ]; then
    echo "  [SKIP] $SERVICE — not a git repo"
    continue
  fi

  echo "  → $SERVICE"
  cd "$SERVICE_PATH"

  # Stage all new/modified files (Dockerfile, entrypoint.sh, nginx.conf, etc.)
  git add -A 2>/dev/null || true

  # Check if there's anything to commit
  if git diff --cached --quiet 2>/dev/null; then
    echo "     (no changes to commit)"
  else
    git commit -m "$COMMIT_MSG" 2>/dev/null || true
    echo "     ✓ committed"
  fi

  # Push to remote (uses whatever branch each sub-repo is on)
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  git push origin "$BRANCH" 2>/dev/null && echo "     ✓ pushed to $BRANCH" || echo "     ⚠ push skipped (no remote or already up to date)"

  cd "$ROOT_DIR"
done

echo ""
echo "[2/3] Committing root repo (docker-compose.yml, .env, docker/ folder)..."
cd "$ROOT_DIR"

# Add all root-level Docker files
git add docker-compose.yml .env docker/ BRD_Docker_Deployment_Guide.pdf 2>/dev/null || true
git add -A 2>/dev/null || true

if git diff --cached --quiet 2>/dev/null; then
  echo "  (no new root-level changes to commit)"
else
  git commit -m "$COMMIT_MSG" 2>/dev/null || true
  echo "  ✓ root repo committed"
fi

echo ""
echo "[3/3] Pushing root repository to GitHub..."
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "master")
git push origin "$BRANCH" && echo "  ✓ Root repo pushed!" || echo "  ⚠ Push failed — check your credentials"

echo ""
echo "========================================"
echo "  ✅ Done! Check GitHub:"
echo "  https://github.com/vizz-bob/BRD_Final2"
echo "========================================"
