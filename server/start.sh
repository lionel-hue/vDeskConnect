#!/bin/bash
cd /home/lionel/Documents/1_Software_Dev/vDeskConnect/server
php -d upload_max_filesize=200M -d post_max_size=200M artisan serve --port=8000