#!/bin/bash

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

# Push to git by overriding previous commits
# IMPORTANT: Supress messages so nothing appears in logs
cd _dist
git init
git add -A
git commit -m "Travis GitHub Pages auto build for $THE_COMMIT"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master > /dev/null 2>&1
