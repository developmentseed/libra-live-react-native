#!/usr/bin/env bash

# Prepare .env for React Native to read configuration
cat >./test.env <<EOL
AWS_COGNITO_IDENTITY_POOL_ID=${AWS_COGNITO_IDENTITY_POOL_ID}
MAPBOX_ACCESS_TOKEN=${MAPBOX_ACCESS_TOKEN}
MAPBOX_STYLE_URL=${MAPBOX_STYLE_URL}
TILER_URL=${TILER_URL}
EOL