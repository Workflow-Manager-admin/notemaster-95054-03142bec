#!/bin/bash
cd /home/kavia/workspace/code-generation/notemaster-95054-03142bec/frontend_web
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

