// contentScript.ts

console.log("Content script loaded on YouTube!");

const YOUTUBE_API_KEY = ""; 
const LLAMA3_ENDPOINT = ""; 
const LLAMA3_API_KEY = "";

// ---------------------------------------------------------------------------
// 2) On initial load, store the current URL & run check
// ---------------------------------------------------------------------------
storeURL();
checkVideo(window.location.href);

// Keep track of the last known URL for detecting SPA navigation
let lastUrl = window.location.href;

// ---------------------------------------------------------------------------
// 3) Observe DOM changes to detect in-page navigation (no full reload on YT)
// ---------------------------------------------------------------------------
const observer = new MutationObserver(() => {
  const newUrl = window.location.href;
  if (newUrl !== lastUrl) {
    lastUrl = newUrl;
    storeURL();
    checkVideo(newUrl);
  }
});

observer.observe(document, { subtree: true, childList: true });

// ---------------------------------------------------------------------------
// Function: Stores the current YouTube URL in chrome.storage.local (unchanged)
// ---------------------------------------------------------------------------
function storeURL(): void {
  const currentURL = window.location.href;
  console.log("[Peek-A-Tube] Storing currentYouTubeURL =>", currentURL);

  chrome.storage.local.set({ currentYouTubeURL: currentURL }, () => {
    console.log("[Peek-A-Tube] Saved currentYouTubeURL:", currentURL);
  });
}


async function checkVideo(url: string): Promise<void> {
  // Immediately block all YouTube Shorts
  if (url.includes('/shorts/')) {
    console.log("[Peek-A-Tube] YouTube Short detected. Redirecting...");
    window.location.href = "https://www.youtube.com/";
    return;
  }

  // (Optional) Read the "enabled" flag from storage, default to true if undefined
  const enabled = await getStorageValue<boolean>("enabled");
  if (enabled === false) {
    console.log("[Peek-A-Tube] Extension not enabled, skipping check.");
    return;
  }

  // Extract the ?v=VIDEOID from the URL
  const videoId = extractVideoId(url);
  if (!videoId) return;

  console.log("[Peek-A-Tube] Checking video:", videoId);

  try {
    // Call the YouTube Data API for snippet, contentDetails
    // including tags in snippet
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoData = data.items[0];

      // If it exists, rating is videoData.contentDetails.contentRating.ytRating
      const rating = videoData?.contentDetails?.contentRating?.ytRating || "";
      const snippet = videoData.snippet;
      const title = snippet.title.toLowerCase();
      const description = snippet.description.toLowerCase();

      // Attempt to retrieve tags; can be undefined or empty for many videos
      const tagsArray = snippet.tags || [];
      const tagsString = tagsArray.join(", ").toLowerCase();

      // --------- Old checks: Age restriction or banned keywords ----------
      if (rating === "ytAgeRestricted") {
        console.log("[Peek-A-Tube] Age-restricted video detected. Redirecting...");
        window.location.href = "https://www.youtube.com/";
        return;
      } else if (title.includes("violent") || description.includes("explicit")) {
        console.log("[Peek-A-Tube] Banned keywords detected. Redirecting...");
        window.location.href = "https://www.youtube.com/";
        return;
      } else {
        // Old logic: "everything is fine" => do nothing
        // NEW LOGIC: send metadata (including tags) to Llama3 for final check
        console.log("[Peek-A-Tube] Old checks passed; calling Llama3...");

        const verdict = await getVerdictFromLLM({
          title: snippet.title,
          description: snippet.description,
          channelTitle: snippet.channelTitle,
          contentRating: rating,
          tags: tagsString
        });

        console.log("[Peek-A-Tube] Llama3 verdict =>", verdict);

        // If Llama says "NO", we block by redirecting
        if (verdict.trim().toUpperCase() === "NO") {
          console.log("[Peek-A-Tube] Llama3 says NO. Redirecting...");
          window.location.href = "https://www.youtube.com/";
        } else {
          console.log("[Peek-A-Tube] Llama3 says YES. Allowed.");
        }
      }
    }
  } catch (error) {
    console.error("[Peek-A-Tube] Error fetching YouTube Data API:", error);
  }
}


// ---------------------------------------------------------------------------
// Helper: Extract ?v=VIDEOID from the URL (unchanged)
// ---------------------------------------------------------------------------
function extractVideoId(urlString: string): string | null {
  const match = urlString.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Helper: Typed wrapper to get a value from chrome.storage.local (unchanged)
// ---------------------------------------------------------------------------
function getStorageValue<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] as T | undefined);
    });
  });
}

// ---------------------------------------------------------------------------
// New Function: getVerdictFromLLM
//  - Sends metadata to your Llama3 endpoint
//  - Expects a single-word answer: "YES" or "NO"
// ---------------------------------------------------------------------------
async function getVerdictFromLLM(metadata: {
  title?: string;
  description?: string;
  channelTitle?: string;
  contentRating?: string;
  tags?: string;  // new field for tags
}): Promise<string> {
  // Construct a prompt that forces one-word output
  const prompt = `
You are a moderation assistant checking if a YouTube video is safe for children under 13.
You will be given some metadata about the video:

Title: ${metadata.title}
Description: ${metadata.description}
Channel: ${metadata.channelTitle}
Tags: ${metadata.tags}
Content Rating: ${metadata.contentRating}

Answer ONLY with "YES" or "NO". 
No extra explanation, no additional text. 
If the video is suitable for under 13, respond "YES". 
If it is not suitable for under 13, respond "NO".
  `;

  // Since you said the request body must follow the chat format:
  //   {
  //     "model": "llama-3-8b",
  //     "messages": [
  //       { "role": "system", "content": "You are a helpful AI assistant." },
  //       { "role": "user", "content": "Hello, world!" }
  //     ]
  //   }
  //
  // We'll adapt it so that "user" content is your prompt:
  const requestBody = {
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: prompt.trim() }
    ],
    max_tokens: 1,
    temperature: 0.0
    // Add or remove fields as needed for your Llama3 endpoint
  };

  try {
    const response = await fetch(LLAMA3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLAMA3_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`[Peek-A-Tube] Llama3 request failed: ${response.status} ${response.statusText}`);
    }

    // Based on your specified Llama3 chat format, you might get:
    // {
    //   "id": "chatcmpl-xxx",
    //   "object": "chat.completion",
    //   "created": 1695833088,
    //   "choices": [
    //     {
    //       "message": {
    //         "role": "assistant",
    //         "content": "YES"
    //       },
    //       "finish_reason": "stop",
    //       "index": 0
    //     }
    //   ]
    // }
    const jsonResponse = await response.json();
    const verdict = jsonResponse?.choices?.[0]?.message?.content ?? "";

    // If the LLM fails or doesn't comply, we might get an empty string
    return verdict;
  } catch (err) {
    console.error("[Peek-A-Tube] Error calling Llama3 API:", err);
    // Fallback: if Llama3 fails, let's just say "YES" to avoid blocking everything
    return "YES";
  }
}
