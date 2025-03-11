# CastHost - Chromecast Custom Receiver

This repository contains a custom Chromecast receiver application designed to synchronize separate audio and video streams.

## Features

- Real-time synchronization of separate audio and video streams
- Automatic drift correction
- Debug mode for development
- Handles buffering and seeking properly

## Setup

1. Host these files using GitHub Pages:
   - In your repository settings, go to "Pages"
   - Select "main" branch as source
   - Save settings

2. Register your application in the [Google Cast SDK Developer Console](https://cast.google.com/publish):
   - Create a new application
   - Select "Custom Receiver"
   - Enter your GitHub Pages URL (https://nanyangtaiji.github.io/CastHost/receiver.html)
   - Get the Application ID for use in your Android app

3. Use the Application ID in your Android sender app:
```java
CastOptionsProvider.setApplicationId("YOUR_APP_ID");
```

## Usage

Send messages from your Android app to load streams:

```java
JSONObject message = new JSONObject();
message.put("videoUrl", "https://example.com/video.mp4");
message.put("audioUrl", "https://example.com/audio.mp3");

castSession.sendMessage("urn:x-cast:com.example.avsync", message.toString());
```

## Development

Set `DEBUG = true` in receiver.js to see debugging information during development.
