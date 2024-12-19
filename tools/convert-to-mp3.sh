#!/usr/bin/env bash

ALBUM_FOLDER=${1%/} # remove trailing slash
MP3_FOLDER=${2%/}   # remove trailing slash

[ ! -d "${ALBUM_FOLDER}" ] && echo "Usage: $(basename "$0") ALBUM_FOLDER MP3_FOLDER" && exit 1;
[ ! -d "${MP3_FOLDER}" ] && echo "Usage: $(basename "$0") ALBUM_FOLDER MP3_FOLDER" && exit 1;

ALBUM=${ALBUM_FOLDER##*/}  # remove leading path(s)
MP3_ALBUM_FOLDER="${MP3_FOLDER}/${ALBUM}"
mkdir -p "${MP3_ALBUM_FOLDER}"

for TRACK in "${ALBUM_FOLDER}"/*.m4a; do

    MP3_FILE=${TRACK##*/}   # remove leading path(s)
    MP3_FILE=${MP3_FILE%.*} # remove extension
    MP3_FILE="${MP3_ALBUM_FOLDER}/${ALBUM} - ${MP3_FILE}.mp3"

    if [ ! -f "${MP3_FILE}" ]
    then
        echo create ${MP3_FILE}
        ffmpeg -i "${TRACK}" -c:v copy -c:a libmp3lame -q:a 4 "${MP3_FILE}"
    fi
done
