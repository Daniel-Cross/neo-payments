# To make this file executable, run: chmod +x build-and-run-ios.sh in terminal once.
# Then type ./build-and-run.sh in your terminal to run the script.

# #!/bin/bash

# Load environment variables from .env file
if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Build the app locally
eas build --local --profile development --platform ios --clear-cache

# Extract the .tar.gz file
tar -xvzf *.tar.gz

# Get the path to the .app bundle
APP_PATH=$(pwd)/$(find . -name "*.app")

# Get the bundle identifier from the Info.plist file
BUNDLE_ID=$(defaults read "$APP_PATH/Info.plist" CFBundleIdentifier)

# Install the app on the simulator
xcrun simctl install booted "$APP_PATH"

# Launch the app on the simulator
xcrun simctl launch booted "$BUNDLE_ID"

# Delete the build files
# rm -f *.tar.gz
# rm -r "$APP_PATH"