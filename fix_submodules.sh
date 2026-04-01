#!/bin/bash
# ============================================================
# BRD Platform – Fix Submodule Issue
# This converts all submodule folders into regular folders
# so all code is visible and clickable on GitHub
#
# Run from inside BRD_Final2 folder:
#   chmod +x fix_submodules.sh
#   ./fix_submodules.sh
# ============================================================

set -e
ROOT_DIR="$(pwd)"

echo "========================================"
echo "  Fixing Git Submodule Issue"
echo "========================================"
echo ""
echo "This will make ALL code visible on GitHub."
echo ""

# All service directories
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

echo "[Step 1/4] Removing each service from git's submodule tracking..."
echo ""
for SERVICE in "${SERVICES[@]}"; do
  if [ -d "$ROOT_DIR/$SERVICE" ]; then
    # Remove from git index (untrack the submodule reference)
    git rm --cached "$SERVICE" 2>/dev/null && echo "  ✓ Untracked submodule: $SERVICE" || echo "  - Already untracked: $SERVICE"
  fi
done

echo ""
echo "[Step 2/4] Removing nested .git folders from each service..."
echo ""
for SERVICE in "${SERVICES[@]}"; do
  GIT_DIR="$ROOT_DIR/$SERVICE/.git"
  if [ -d "$GIT_DIR" ]; then
    rm -rf "$GIT_DIR"
    echo "  ✓ Removed .git from: $SERVICE"
  else
    echo "  - No .git in: $SERVICE"
  fi
done

# Remove .gitmodules if it exists
if [ -f "$ROOT_DIR/.gitmodules" ]; then
  rm -f "$ROOT_DIR/.gitmodules"
  echo ""
  echo "  ✓ Removed .gitmodules file"
fi

echo ""
echo "[Step 3/4] Adding ALL files to git and committing..."
cd "$ROOT_DIR"
git add -A
git status --short | head -20
echo "  ... (adding all files)"
git commit -m "Fix: Convert submodules to regular folders - all code now visible on GitHub"
echo "  ✓ Committed!"

echo ""
echo "[Step 4/4] Pushing to GitHub..."
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "master")
echo "  Pushing to branch: $BRANCH"
git push origin "$BRANCH"
echo "  ✓ Pushed!"

echo ""
echo "========================================"
echo "  ✅ DONE! All folders are now regular"
echo "     directories visible on GitHub."
echo ""
echo "  Check: https://github.com/vizz-bob/BRD_Final2"
echo "========================================"
