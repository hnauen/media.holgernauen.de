#!/usr/bin/env bash

TEMPLATE_FOLDER="$(dirname "$0")/../templates"
ALBUM_TEMPLATE="${TEMPLATE_FOLDER}/album.md"
SONG_TEMPLATE="${TEMPLATE_FOLDER}/song.md"

ALBUM_FOLDER=$1
ALBUM_INDEX="${ALBUM_FOLDER}/index.md"
SONGS_FOLDER="${ALBUM_FOLDER}/songs"
IMAGES_FOLDER="${ALBUM_FOLDER}/images"

[ ! -d "${ALBUM_FOLDER}" ] && echo "Usage: $(basename "$0") ALBUM_FOLDER" && exit 1;
[ ! -f "${ALBUM_TEMPLATE}" ] && echo "${ALBUM_TEMPLATE} not found" && exit 1;
[ ! -f "${SONG_TEMPLATE}" ] && echo "${SONG_TEMPLATE} not found" && exit 1;

mkdir -p "${IMAGES_FOLDER}"
mkdir -p "${SONGS_FOLDER}"

for TRACK in "${ALBUM_FOLDER}"/*.m4a; do
    TEMP=${TRACK##*/}  # get fileName
    TEMP=${TEMP#* - }  # remove track number
    TEMP=${TEMP%.*}    # remove extension
    SONG_FILE="${SONGS_FOLDER}/${TEMP}.md"
    if [ ! -f "${SONG_FILE}" ]
    then
        echo create ${SONG_FILE}
        cp "${SONG_TEMPLATE}" "${SONG_FILE}"
        TITLE=$(exiftool -Title -s -s -s "${TRACK}")
        DATE=$(exiftool -ContentCreateDate -s -s -s "${TRACK}")
        sed -i '' "s/TITLE/${TITLE}/" "${SONG_FILE}"
        sed -i '' "s/DATE/${DATE}/" "${SONG_FILE}"
    fi
done

if [ ! -f "${ALBUM_INDEX}" ]
then
    echo create "${ALBUM_INDEX}"
    cp "${ALBUM_TEMPLATE}" "${ALBUM_INDEX}"
    # take TITLE, ARTIST from last file
    ARTIST=$(exiftool -Artist -s -s -s "${TRACK}")
    TITLE=$(exiftool -Album -s -s -s "${TRACK}")
    DATE=$(exiftool -ContentCreateDate -s -s -s "${TRACK}")
    sed -i '' "s/TITLE/${TITLE}/" "${ALBUM_INDEX}"
    sed -i '' "s/ARTIST/${ARTIST}/" "${ALBUM_INDEX}"
    sed -i '' "s/DATE/${DATE}/" "${ALBUM_INDEX}"
fi
