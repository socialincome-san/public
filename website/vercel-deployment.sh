#!/bin/bash

# Proceed with the build if a change in the website directory happened and
# it's not the gh-pages branch.

#!/bin/bash
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
if [[ $VERCEL_GIT_COMMIT_REF != "gh-pages" ]]; then
  git diff HEAD^ HEAD --quiet ./website;
fi
exit 0;