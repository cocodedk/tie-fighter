#!/bin/sh
# Run after the first successful CI run, with gh authenticated as a repository admin.
set -eu
repo='cocodedk/tie-fighter'
actual_repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
[ "$actual_repo" = "$repo" ] || { echo "Expected $repo, found $actual_repo." >&2; exit 1; }
gh repo edit "$repo" --delete-branch-on-merge --enable-squash-merge \
  --enable-rebase-merge --enable-merge-commit=false
gh api --method PUT "/repos/$repo/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
echo 'Protected main: verify required, PR with zero approvals, admin bypass allowed.'
