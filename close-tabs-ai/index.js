const API_KEY = ""; // Replace with your Gemini API key for local testing
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

const myTabs = [
  { url: "https://www.nytimes.com/world", title: "NYT World" },
  { url: "https://www.theguardian.com/uk", title: "Guardian News" },
  { url: "https://www.youtube.com/watch?v=123", title: "Cat Video" },
  { url: "https://edition.cnn.com/", title: "CNN" },
  { url: "https://www.idnes.cz", title: "IDNES" },
  { url: "https://praha.idnes.cz", title: "IDNES Praha" },
  { url: "https://www.amazon.com", title: "Amazon" },
  { url: "https://www.amazon.de", title: "Amazon DE" },
  { url: "https://www.alza.cz", title: "Alza" },
  { url: "https://calendar.google.com", title: "Google Calendar" },
  { url: "https://calendar.google.com/calendar/u/0/r/week", title: "Google Calendar - Week View" },
  { url: "https://calendar.google.com/calendar/u/1/r", title: "Google Calendar - Work Account" },
  { url: "https://drive.google.com", title: "Google Drive" },
  { url: "https://drive.google.com/drive/u/0/my-drive", title: "Google Drive - My Files" },
  { url: "https://docs.google.com/document/d/abc123", title: "Google Docs - Project Plan" },
  { url: "https://docs.google.com/document/d/xyz789", title: "Google Docs - Meeting Notes" },
  { url: "https://docs.google.com/spreadsheets/d/sheet123", title: "Google Sheets - Budget" },
  { url: "https://mail.google.com", title: "Gmail" },
  { url: "https://mail.google.com/mail/u/1", title: "Gmail - Work Account" },
  { url: "https://meet.google.com/xyz-meet-abc", title: "Google Meet" },
  { url: "https://meet.google.com/abc-def-ghi", title: "Google Meet - Team Standup" },
  { url: "https://yourcompany.atlassian.net/jira", title: "Jira Dashboard" },
  { url: "https://yourcompany.atlassian.net/wiki", title: "Confluence" },
  { url: "https://slack.com/workspace/general", title: "Slack - General" },
  { url: "https://github.com/yourorg/project", title: "GitHub Repository" },
  { url: "https://stackoverflow.com/questions/12345", title: "Stack Overflow Question" },
  { url: "https://www.reddit.com/r/programming", title: "Reddit - Programming" },
  { url: "https://twitter.com", title: "Twitter" },
  { url: "https://www.linkedin.com", title: "LinkedIn" },
  { url: "https://www.facebook.com", title: "Facebook" },
  { url: "https://www.netflix.com", title: "Netflix" },
  { url: "https://open.spotify.com", title: "Spotify" },
  { url: "https://medium.com/@author/article", title: "Medium Article" },
  { url: "https://www.bbc.com/news", title: "BBC News" },
  { url: "https://en.wikipedia.org/wiki/Main_Page", title: "Wikipedia" },
  { url: "https://trello.com/b/abc123", title: "Trello Board" },
  { url: "https://www.notion.so/workspace", title: "Notion Workspace" },
  { url: "https://www.figma.com/file/xyz", title: "Figma Design" },
  { url: "https://analytics.google.com", title: "Google Analytics" },
  { url: "https://console.cloud.google.com", title: "Google Cloud Console" },
  { url: "https://aws.amazon.com/console", title: "AWS Console" },
  { url: "https://vercel.com/dashboard", title: "Vercel Dashboard" },
  { url: "https://app.netlify.com", title: "Netlify Dashboard" },
  { url: "https://www.dropbox.com", title: "Dropbox" },
  { url: "https://zoom.us/meeting", title: "Zoom Meeting" },
  { url: "https://www.canva.com/design", title: "Canva Design" },
  { url: "https://www.twitch.tv", title: "Twitch" },
  { url: "https://discord.com/channels/server", title: "Discord Server" },
  { url: "https://www.espn.com", title: "ESPN Sports" },
  { url: "https://www.imdb.com", title: "IMDB" },
  { url: "https://www.reddit.com/r/programming", title: "Reddit - Programming" },
];

async function filterTabs(userQuery) {
  const prompt = `You are a browser extension that helps users close tabs using natural language.
The user will tell you which tabs they want to close, and you must identify those tabs from the list provided.

IMPORTANT INSTRUCTIONS:
- Return ONLY a valid JSON array of the matching URLs (just the URL strings)
- Follow the user's instructions to the best of your ability
- If the user says "first", return only the FIRST matching tab in the list
- If the user says "last", return only the LAST matching tab in the list
- If the user says "all", return ALL matching tabs
- Do not include markdown formatting, code blocks, or any other text
- Example format: ["https://example.com", "https://another.com"]

User's request: "${userQuery}"

Available tabs (in order):
${JSON.stringify(myTabs, null, 2)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const data = await response.json();
  let responseText = data.candidates[0].content.parts[0].text;

  // Clean up response - remove markdown code blocks if present
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  console.log("Filtered URLs:", responseText);

  return JSON.parse(responseText);
}

function displayResults(matchedUrls) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    myTabs.forEach(tab => {
        const isMatched = matchedUrls.includes(tab.url);

        const tabItem = document.createElement("div");
        tabItem.className = `tab-item ${isMatched ? 'matched' : 'unmatched'}`;

        tabItem.innerHTML = `
            <span class="indicator">${isMatched ? '✓' : '○'}</span>
            <div>
                <div class="tab-title">${tab.title}</div>
                <div class="tab-url">${tab.url}</div>
            </div>
        `;

        resultsDiv.appendChild(tabItem);
    });
}

window.addEventListener("load", async () => {
    // Display all tabs as unmatched on initial load
    displayResults([]);

    const handleSubmit = async () => {
        const userQuery = document.getElementById("userQuery").value;
        const spinner = document.getElementById("spinner");
        const resultsDiv = document.getElementById("results");

        // Show spinner, clear previous results
        spinner.classList.add("active");
        resultsDiv.innerHTML = "";

        try {
            const matchedUrls = await filterTabs(userQuery);
            displayResults(matchedUrls);
        } catch (error) {
            resultsDiv.innerHTML = `<div style="color: red; padding: 10px;">Error: ${error.message}</div>`;
        } finally {
            // Hide spinner when done
            spinner.classList.remove("active");
        }
    };

    document.getElementById("submit").addEventListener("click", handleSubmit);

    document.getElementById("userQuery").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSubmit();
        }
    });
});