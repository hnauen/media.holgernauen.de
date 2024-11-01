TEMPLATE_FOLDER="$(dirname "$0")/../templates"
TEMPLATE_FOLDER=$(realpath ${TEMPLATE_FOLDER})
ALBUM_TEMPLATE_PATH=${TEMPLATE_FOLDER}/album-simple.md

TRACK_INFO_FILENAME="index.json"
ALBUM_INFO_FILENAME="index.md"
COVER_IMAGE_FILENAME="cover.jpg"

# ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

find_newest_regex(){ 
    local FOLDER=${1}
    local REGEX=${2}
    FOLDER=${FOLDER:=.} # default to current folder
    find -E "${FOLDER}" -type f -regex "${REGEX}" -print0 | xargs -0 ls -1 -t | head -1
}

find_newest_media(){ 
    local FOLDER=${1}
    find_newest_regex "${FOLDER}" ".*\.(mp3|m4a|jpe?g|pdf|json)$"
}


find_newest_track(){ 
    local FOLDER=${1}
    find_newest_regex "${FOLDER}" ".*\.(mp3|m4a)$"
}


sanitizeFolder() {
    echo ${1%/} # remove trailing slash
}

hasTrack() {
    local FOLDER=${1}
    local TRACK=$(find_newest_track ${FOLDER})
    
    if [ "${TRACK}" != "" ]
    then
        true
    else
        false
    fi
}

# ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

createTrackInfo() {
  local FOLDER=${1}
  local INFO_FILENAME=${2}
  INFO_FILENAME="${INFO_FILENAME:=${TRACK_INFO_FILENAME}}" # default to TRACK_INFO_FILENAME
  local CURRENT_FOLDER=$(pwd)
  # -----
  cd "${FOLDER}"
  # -----
  # check if INFO_FILENAME need to be created/updated  
  if [ ! -f "${INFO_FILENAME}" ] || [ "$(realpath ${INFO_FILENAME})" != "$(realpath $(find_newest_media))" ]; then
    echo "create ${INFO_FILENAME}"
    exiftool -r -j -b --CoverArt --Picture --ext json . |\
       jq '. | {"media": group_by(.MIMEType|split("/")|first) | map({ key: (.[0].MIMEType|split("/")|first), value: [.[]] | sort_by(.SourceFile) }) | from_entries }' \
       > ${INFO_FILENAME}
  fi
  # -----
  cd "${CURRENT_FOLDER}"
}

createAlbumInfo() {
  local FOLDER=${1}
  local INFO_FILENAME=${2}
  INFO_FILENAME="${INFO_FILENAME:=${ALBUM_INFO_FILENAME}}" # default to ALBUM_INFO_FILENAME
  local CURRENT_FOLDER=$(pwd)
  # -----
  cd "${FOLDER}"
  # -----
  # check if INFO_FILENAME need to be created
  if [ ! -f "${INFO_FILENAME}" ]; then
    local TRACK=$(find_newest_track)
    
    echo "create ${INFO_FILENAME}"
    cp "${ALBUM_TEMPLATE_PATH}" "${INFO_FILENAME}"
    
    COMPILATION=$(exiftool -Compilation -s -s -s "${TRACK}") # Yes/No or empty
    COMPILATION=${COMPILATION:=No} # Default=No
    
    ARTIST=$(exiftool -AlbumArtist -s -s -s "${TRACK}") # M4A
    ARTIST=${ARTIST:=$(exiftool -Band -s -s -s "${TRACK}")} # MP3
    [ "${COMPILATION}" == "No" ] && ARTIST=${ARTIST:=$(exiftool -Artist -s -s -s "${TRACK}")} # Fallback
    sed -i '' "s/ARTIST/${ARTIST}/" "${INFO_FILENAME}"

    TITLE=$(exiftool -Album -s -s -s "${TRACK}")
    sed -i '' "s/TITLE/${TITLE}/" "${INFO_FILENAME}"

    DATE=$(exiftool -ContentCreateDate -s -s -s "${TRACK}") # M4A
    DATE=${DATE:=$(exiftool -Year -s -s -s "${TRACK}")} # MP3
    sed -i '' "s/DATE/${DATE}/" "${INFO_FILENAME}"

    COVER=$(ls -1 ${COVER_IMAGE_FILENAME}) #check, if not exist remove placeholder
    sed -i '' "s/COVER/${COVER}/" "${INFO_FILENAME}"
  fi
  # -----
  cd "${CURRENT_FOLDER}"
}
