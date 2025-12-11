#!/usr/bin/env bash

set -euo pipefail

# Copy google-services.json from secret to app directory
if [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  echo "📦 Copying google-services.json from secret..."
  echo "$GOOGLE_SERVICES_JSON" > app/google-services.json
  echo "✅ google-services.json copied successfully"
else
  echo "⚠️ GOOGLE_SERVICES_JSON secret not found"
fi
