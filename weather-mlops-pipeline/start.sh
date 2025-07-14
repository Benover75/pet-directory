#!/bin/bash
# Start the FastAPI app (development mode)

# Start the Weather ML Pipeline Web UI
if [ "$1" = "ui" ]; then
  echo "🌤️ Launching Weather ML Pipeline Web UI..."
  python3 run_ui.py
  exit $?
fi

# Add other start options here

echo "Usage: $0 [ui]"
echo "  ui   - Launch the web UI (Streamlit dashboard)" 