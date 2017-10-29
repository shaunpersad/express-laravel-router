#!/usr/bin/env bash
docker run --rm -v $(pwd):/usr/src/app -w /usr/src/app node:latest npm init --yes