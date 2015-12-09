#!/bin/bash

# Define variables depending on the branch
if [[ $TRAVIS_BRANCH == 'master' ]]
  then
    REPO="github.com/StreetSupport/streetsupport.net-beta.git"
    DOMAIN="beta.streetsupport.net"
  else
    REPO="github.com/StreetSupport/streetsupport.net-dev.git"
    DOMAIN="dev.streetsupport.net"
fi

# Get the commit details
THE_COMMIT=`git rev-parse HEAD`

# Set git details
git config --global user.email "enquiry@streetsupport.net"
git config --global user.name "Travis CI"

# Delete _dist
rm -rf _dist
mkdir _dist

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

if [[ $TRAVIS_BRANCH == 'master' ]] || [[ $TRAVIS_BRANCH == 'develop' ]]
  then
    git init
    git add -A
    git commit -m "Travis CI automatic build for $THE_COMMIT"
    git push --force --quiet "https://${GH_TOKEN}@${REPO}" master:gh-pages > /dev/null 2>&1
  else
    echo "Not on master or develop branch so don't push the changes to GitHub Pages"
fi
