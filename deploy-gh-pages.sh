#!/bin/bash

# If there are any errors, fail Travis
set -e

# Set a default API environment for other branches/pull requests
APIENVIRONMENT=1

# Define variables depending on the branch
if [[ $TRAVIS_BRANCH == 'release' ]]
  then
    REPO="github.com/StreetSupport/streetsupport.net-live.git"
    DOMAIN="www.streetsupport.net"
    AZURE_WEBSITE=$LIVE_AZURE_WEBSITE
    APIENVIRONMENT=3
fi
if [[ $TRAVIS_BRANCH == 'staging' ]]
  then
    REPO="github.com/StreetSupport/streetsupport.net-beta.git"
    DOMAIN="staging.streetsupport.net"
    AZURE_WEBSITE=$STAGING_AZURE_WEBSITE
    APIENVIRONMENT=2
fi
if [[ $TRAVIS_BRANCH == 'develop' ]]
  then
    REPO="github.com/StreetSupport/streetsupport.net-dev.git"
    DOMAIN="dev.streetsupport.net"
    AZURE_WEBSITE=$DEV_AZURE_WEBSITE
    APIENVIRONMENT=1
fi

# Get the commit details
THE_COMMIT=`git rev-parse HEAD`

# Set git details
git config --global user.email "enquiry@streetsupport.net"
git config --global user.name "Travis CI"

# Set environment
cd src/js
rm env.js
cat > env.js << EOF
module.exports = $APIENVIRONMENT
EOF

echo "env file rewritten to:"
cat env.js

cd ../../

# Run gulp
gulp deploy --debug --production

# Move to created directory
cd _dist

# Create CNAME file and populate with domain depending on branch
cat > CNAME << EOF
$DOMAIN
EOF

# Push to git by overriding previous commits
# IMPORTANT: Supress messages so nothing appears in logs

if [[ $TRAVIS_BRANCH == 'release' ]] || [[ $TRAVIS_BRANCH == 'staging' ]] || [[ $TRAVIS_BRANCH == 'develop' ]]
  then
    git init
    git add -A
    git commit -m "Travis CI automatic build for $THE_COMMIT"
    git push --quiet --force "https://${AZURE_USER}:${AZURE_PASSWORD}@${AZURE_WEBSITE}.scm.azurewebsites.net:443/${AZURE_WEBSITE}.git" master > /dev/null 2>&1
  else
    echo "Not on a build branch so don't push the changes to GitHub Pages"
fi
