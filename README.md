# Peek-A-Tube-Chrome-Extension
Peek-a-Tube is a Chrome extension designed to dynamically filter YouTube content, ensuring safety and appropriateness for young viewers, especially those aged between 10 to 13. It utilizes YouTube Data API and the Llama3 API to analyze and block videos that may not be suitable for these age groups.

# Features
Real-time Content Filtering: Blocks inappropriate videos automatically, enhancing safe browsing on YouTube.

API Integration: Leverages YouTube Data API for metadata and Llama3 API for advanced content analysis.

User-friendly Interface: Easy toggle on/off functionality and status updates via a simple popup interface.

# Technologies Used:

Frontend: Developed using React and TypeScript, styled with TailwindCSS for a modern and responsive design.

Backend: Node.js is used to handle API requests and data management efficiently.

Build Tool: Vite is used to optimize and bundle the project, enhancing development speed with hot module replacement.

# How It Works
Upon visiting YouTube and playing a video, the extension:

Fetches the video URL and retrieves detailed metadata.
Analyzes metadata through the Llama3 API to assess content suitability.
Blocks unsuitable videos, redirects to the homepage, and notifies the user.

# Installation
Clone the repository to your local machine.

Open chrome://extensions in Chrome, enable Developer mode, and select "Load unpacked".

Choose the directory containing the cloned repository.

# Configuration
Set up the following in contentScript.ts:

YOUTUBE_API_KEY: Your YouTube API key.

LLAMA3_ENDPOINT: Endpoint for the Llama3 API.

LLAMA3_API_KEY: Your Llama3 API key.

Set up the following in index.tsx

import Switch from 'your-path/src/chrome-extension/popup/Switch';

run "npm install"

run "npm run build"

