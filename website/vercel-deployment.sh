#!/bin/bash

# Proceed with the build if a change in the website directory happened and
# it's not the gh-pages branch.

if [[ "$VERCEL_GIT_COMMIT_REF" != "gh-pages"]] ; then
  exit git diff HEAD^ HEAD --quiet .;
else
  exit 0;
fi