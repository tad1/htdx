#!/bin/sh
BASE_URL=https://htdx.tad1.dev/


echo "${BASE_URL}devlog.txt" > ./sitemap.txt
for f in content/*
do
echo "${BASE_URL}${f}" >> ./sitemap.txt
done