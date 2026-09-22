#!/bin/bash

DATE=$(date +%Y%m%d)

mkdir -p backups

tar -czvf backups/newsportal-$DATE.tar.gz ../../