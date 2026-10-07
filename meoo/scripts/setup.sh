#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
node --check server.mjs
node scripts/restore-release.mjs
