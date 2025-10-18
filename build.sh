pandoc "$1.md" -o "$1.html" --template "./build/$2.html" --toc --standalone

pandoc "$1.md" --template=metadata.pandoc-tpl --metadata link="$1.html" \
| sed 's/,$//' \
| jq --argjson new "$(cat)" '[. + [$new] | sort_by(.link) | group_by(.link)[] | max_by(.date)]' index.json \
> index.json.tmp && mv index.json.tmp index.json

jq '[sort_by(.link) | group_by(.link)[] | max_by(.date)]' index.json > index.tmp && mv index.tmp index.json

rm -rf "$1.md"
rm -rf metadata.pandoc-tpl

# git add "$1.html"
# git commit -m "update $1.html"
# git push origin main