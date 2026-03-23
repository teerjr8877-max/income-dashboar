#!/usr/bin/env bash
set -euo pipefail

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No git remote named origin is configured for this repository." >&2
  exit 1
fi

BRANCH="gh-pages"
WORKTREE_DIR=".gh-pages-worktree"
rm -rf "$WORKTREE_DIR"
git worktree add --force "$WORKTREE_DIR" --detach
trap 'git worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || true' EXIT

rm -rf "$WORKTREE_DIR"/* "$WORKTREE_DIR"/.??* 2>/dev/null || true
cp -R dist/. "$WORKTREE_DIR"/
cd "$WORKTREE_DIR"
git init >/dev/null 2>&1
if git remote get-url origin >/dev/null 2>&1; then
  git remote remove origin
fi
git remote add origin "$(git -C .. remote get-url origin)"
git checkout -B "$BRANCH"
git add .
git -c user.name='OpenAI Codex' -c user.email='codex@openai.com' commit -m 'Deploy WealthOS to GitHub Pages' >/dev/null 2>&1 || true
git push --force origin "$BRANCH"
