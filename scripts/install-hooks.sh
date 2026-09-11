#!/bin/sh
set -eu
cd "$(git rev-parse --show-toplevel)"
git config --local core.hooksPath .githooks
echo 'Installed local commit and owner-locked push hooks.'
