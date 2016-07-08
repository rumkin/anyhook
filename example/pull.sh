#!/bin/bash

REPO=${2:=origin}
BRANCH=${3:=master}

cd $1
git checkout $BRANCH
git pull $REPO $BRANCH
