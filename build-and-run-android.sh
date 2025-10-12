#!/bin/bash

# Add Android SDK tools to PATH
export PATH="$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/build-tools/35.0.0:$PATH"

# Set ANDROID_HOME for EAS build
export ANDROID_HOME="$HOME/Library/Android/sdk"

# Load environment variables from .env file
if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Build the app locally
echo "Building Android app..."
eas build --local --profile development --platform android --clear-cache

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful! Looking for APK..."
  
  # Get the path to the .apk file
  APK_PATH=$(find . -name "*.apk" | head -1)
  
  if [ -n "$APK_PATH" ]; then
    echo "Found APK: $APK_PATH"
    
    # Install the app on the emulator
    echo "Installing APK on emulator..."
    adb -s emulator-5554 install "$APK_PATH"
    
    # Get the actual package name from the APK
    PACKAGE_NAME=$(aapt dump badging "$APK_PATH" | grep package | awk '{print $2}' | sed "s/name='//" | sed "s/'//")
    
    if [ -n "$PACKAGE_NAME" ]; then
      echo "Launching app: $PACKAGE_NAME"
      # Launch the app on the emulator
      adb -s emulator-5554 shell monkey -p "$PACKAGE_NAME" -c android.intent.category.LAUNCHER 1
    else
      echo "Could not determine package name from APK"
    fi
    
    # Delete the build files
    echo "Cleaning up build files..."
    rm -rf *.apk
  else
    echo "No APK file found after build"
  fi
else
  echo "Build failed!"
  exit 1
fi