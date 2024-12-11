#!/usr/bin/env bash

set -e
old_version="$(git describe --abbrev=0 --tags)"
new_version=$1


old_cdn="https://unpkg.com/konva@${old_version}/konva.js"
new_cdn="https://unpkg.com/konva@${new_version}/konva.js"

old_cdn_min="https://unpkg.com/konva@${old_version}/konva.min.js"
new_cdn_min="https://unpkg.com/konva@${new_version}/konva.min.js"

# make sure new version parameter is passed
if [ -z "$1" ]
    then
        echo "ERROR - pass new version. usage release.sh 0.11.0"
        exit 2
fi

# make sure changle log updated
while true; do
    read -p "Did you update CHANGELOG.md? " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo "Old version: ${old_version}"
echo "New version: ${new_version}"

echo "Pulling"
git pull >/dev/null

echo "build and test"
npm run build >/dev/null
# npm run test


echo "commit change log updates"
git commit -am "update CHANGELOG with new version" --allow-empty >/dev/null

echo "npm version $1 --no-git-tag-version"
npm version $1 --no-git-tag-version --allow-same-version >/dev/null

echo "build for $1"
npm run build >/dev/null
git commit -am "build for $1" --allow-empty >/dev/null

echo "update CDN link in REAME"
perl -i -pe "s|${old_cdn_min}|${new_cdn_min}|g" ./README.md >/dev/null
git commit -am "update cdn link" --allow-empty >/dev/null

echo "create new git tag"
git tag $1 >/dev/null

cd ../konva
git push >/dev/null
git push --tags >/dev/null
npm publish

echo "copy konva.js into konva-site"
cp ./konva.js ../konva-site/
cd ../konva-site

echo "replace CDN links"


find source themes/hexo3/layout react-demos vue-demos main-demo -name "*.json" -exec perl -i -pe "s|${old_version}|${new_version}|g" {} + >/dev/null
find source themes/hexo3/layout react-demos vue-demos main-demo -name "*.html" -exec perl -i -pe "s|${old_version}|${new_version}|g" {} + >/dev/null

echo "regenerate site"
./deploy.sh >/dev/null

echo "DONE!"
