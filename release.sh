#!/usr/bin/env bash

set -e
old_version="$(git describe --abbrev=0 --tags)"
new_version=$1

old_cdn="https://cdn.rawgit.com/konvajs/konva/${old_version}/konva.js"
new_cdn="https://cdn.rawgit.com/konvajs/konva/${new_version}/konva.js"

old_cdn_min="https://cdn.rawgit.com/konvajs/konva/${old_version}/konva.min.js"
new_cdn_min="https://cdn.rawgit.com/konvajs/konva/${new_version}/konva.min.js"

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

echo "lint and test"
npm start lint test

echo "commit change log updates"
git commit -am "update CHANGELOG with new version" --allow-empty

echo "npm version $1 --no-git-tag-version"
npm version $1 --no-git-tag-version

echo "build for $1"
npm start build
git commit -am "build for $1" --allow-empty

echo "update CDN link in REAME"
perl -i -pe "s|${old_cdn_min}|${new_cdn_min}|g" ./README.md
git commit -am "update cdn link" --allow-empty

echo "create new git tag"
git tag $1

echo "generate documentation"
npm start api

echo "archive documentation"
zip -r konva-v${new_version}-documentation.zip ./api/*
rm -r ./api

echo "documentation is generated"
echo "include konva-v${new_version}-documentation.zip into version in github"

echo "copy konva.js into konva-site"
cp ./konva.js ../konva-site/
cd ../konva-site

echo "replace CDN links"


find source themes -exec perl -i -pe "s|${old_cdn}|${new_cdn}|g" {} +

find source themes -exec perl -i -pe "s|${old_cdn_min}|${new_cdn_min}|g" {} +

echo "regenerate site"
./deploy.sh

cd ../konva
git push
git push --tags
npm publish

echo "DONE!"

echo "-------"
echo "Now you need:"
echo "create new relese in github and attach documentation https://github.com/konvajs/konva/releases"
echo "update CDN link to ${new_cdn} at http://codepen.io/lavrton/pen/myBPGo"
