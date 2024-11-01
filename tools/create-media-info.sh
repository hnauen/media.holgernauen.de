 #!/usr/bin/env bash

ALBUM_FOLDER=${1%/} # remove trailing slash

[ ! -d "${ALBUM_FOLDER}" ] && echo "Usage: $(basename "$0") ALBUM_FOLDER" && exit 1;

cd "${ALBUM_FOLDER}"

exiftool -r -j -b --CoverArt --ext json . |\
    jq '. | {"media": group_by(.MIMEType|split("/")|first) | map({ key: (.[0].MIMEType|split("/")|first), value: [.[]] | sort_by(.SourceFile) }) | from_entries }' \
    > index.json

# jq is used to structure the json output and to sort the entries:
# {
#   "media": {
#     "audio": [{},{},...],
#     "image": [{},{},...],
#   }
# }
    
