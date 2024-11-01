 #!/usr/bin/env bash

source "$(dirname "$0")/_tools.sh"

updateFolder() {
    local FOLDER=${1}
    local DEPTH=${2}

    IFS=$'\n'
    FOLDERS=( $(find ${FOLDER} -mindepth ${DEPTH} -maxdepth ${DEPTH} -type d) )
    for FOLDER in "${FOLDERS[@]}"
    do
    echo "${FOLDER}"
    if hasTrack "${FOLDER}"; then
        createTrackInfo ${FOLDER}
        createAlbumInfo ${FOLDER}
    ## else
        # echo "no media found"
    fi
done
}

COLLECTION_FOLDER=$(sanitizeFolder ${1})
[ ! -d "${COLLECTION_FOLDER}" ] && echo "Usage: $(basename "$0") COLLECTION_FOLDER" && exit 1;

updateFolder "${COLLECTION_FOLDER}/album" 3
updateFolder "${COLLECTION_FOLDER}/various" 2
