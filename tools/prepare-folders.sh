#!/usr/bin/env bash

function mkdirAZ () {
    local FOLDER=$1
    cd ${FOLDER}
    mkdir -p _ 0 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 国
    cd ..
}

function mkdirCollection () {
    cd collection
    for FOLDER in album audiobook book comedy movie picture school various
    do
        mkdir -p ${FOLDER}
    done
    for FOLDER in album audiobook comedy various
    do
        mkdirAZ ${FOLDER}
    done
    cd ..
}


function run () {
    mkdir -p collection templates incoming tools
    mkdirCollection
}

if [ ! -d "$1" ]; then
  echo "'$1' does not exist"
  exit 1
fi

run
