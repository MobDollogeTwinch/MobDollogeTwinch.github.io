git add "$1.md"
git commit -m "update $1.md"

git checkout main
git checkout draft -- "$1.md"

pandoc "$1.md" -o "$1.html" --template "./build/$2.html" --toc --standalone --highlight-style=pygments

pandoc "$1.md" --template=metadata.pandoc-tpl --metadata link="$1.html" \
| sed 's/,$//' \
| jq --argjson new "$(cat)" '[. + [$new] | sort_by(.link) | group_by(.link)[] | max_by(.date)]' index.json \
> index.json.tmp && mv index.json.tmp index.json

jq '[sort_by(.link) | group_by(.link)[] | max_by(.date)]' index.json > index.tmp && mv index.tmp index.json

rm -rf "$1.md"
git restore --staged "$1.md"

git add "$1.html"
git add index.json
git commit -m "update $1.html with index.json"
git push origin main

git checkout draft