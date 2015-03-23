#!/bin/bash
# Clean up previous build
rm -rf tmp

# Make new dir
mkdir -p tmp/cartodb

# Copy over all the needed things
cp -r bin tmp/cartodb
cp -r appserver tmp/cartodb
cp -r default tmp/cartodb
cp -r lookups tmp/cartodb
find tmp/cartodb/ -name "*.pyc" -delete

cd tmp
tar -czvf cartodb.spl cartodb --owner=0 --group=0
cd ..
