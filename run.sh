#!/bin/bash
source api/venv/bin/activate
python3 api/index.py &
npm run dev
