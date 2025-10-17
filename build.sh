if [ -f "$1.md" ]; then
    cp $1.md ./build/src/
fi

pushd ./build > /dev/null
pandoc "src/$1.md" -o "../$1.html" --embed-resources --template $2.html --toc --standalone
popd > /dev/null