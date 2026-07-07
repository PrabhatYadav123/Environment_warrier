require("dotenv").config();
const axios = require("axios");

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ID = process.env.INSTAGRAM_BUSINESS_ID;

// ✅ Media container banao with alt text
async function createMediaContainer(imageUrl, caption, altText = "") {
  const url = `https://graph.facebook.com/v25.0/${INSTAGRAM_BUSINESS_ID}/media`;

  const { data } = await axios.post(url, null, {
    params: {
      image_url: imageUrl,
      caption,
      alt_text: altText,        // ← SEO ke liye
      access_token: ACCESS_TOKEN,
    },
  });

  return data.id;
}

// ✅ Publish karo
async function publishMedia(containerId) {
  const url = `https://graph.facebook.com/v25.0/${INSTAGRAM_BUSINESS_ID}/media_publish`;

  const { data } = await axios.post(url, null, {
    params: {
      creation_id: containerId,
      access_token: ACCESS_TOKEN,
    },
  });

  return data.id;
}

// ✅ Ready hone ka wait karo
async function waitUntilReady(containerId, maxWait = 60000) {
  const startTime = Date.now();

  while (true) {
    const { data } = await axios.get(
      `https://graph.facebook.com/v25.0/${containerId}`,
      {
        params: {
          fields: "status_code,status",
          access_token: ACCESS_TOKEN,
        },
      }
    );

    console.log(`  Status: ${data.status_code}`);

    if (data.status_code === "FINISHED") return;

    if (data.status_code === "ERROR") {
      throw new Error(`Instagram media processing failed: ${data.status}`);
    }

    // Timeout check
    if (Date.now() - startTime > maxWait) {
      throw new Error("Instagram media processing timed out after 60s");
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}

// ✅ SEO optimized caption banao
function buildCaption(title, excerpt, blogUrl, tags = []) {
  // Hashtags — mix of high/medium/low volume
  const baseHashtags = [
    "#ClimateChange", "#Environment", "#India",
    "#GreenIndia", "#SaveEarth", "#Sustainability",
    "#ClimateAction", "#EcoFriendly", "#GoGreen",
    "#EnvironmentWarrior", "#IndiaClimate", "#SaveThePlanet",
    "#CleanIndia", "#NatureIndia", "#GreenRevolution"
  ];

  // Blog tags se bhi hashtags banao
  const tagHashtags = tags
    .slice(0, 3)
    .map(t => `#${t.replace(/\s+/g, "").replace(/-/g, "")}`);

  const allHashtags = [...new Set([...tagHashtags, ...baseHashtags])]
    .slice(0, 20)
    .join(" ");

  return `🌍 ${title}

${excerpt}

✅ Did you know? India faces one of the world's biggest environmental challenges right now.

💬 What do YOU think we should do? Comment below!
🔖 Save this post to read the full article later!
👇 Link in bio for more!

🔗 ${blogUrl}

.
.
.
${allHashtags}`;
}

// ✅ Main function
async function postToInstagram(imageUrl, caption, altText = "") {
  console.log("📸 Posting to Instagram...");

  const containerId = await createMediaContainer(imageUrl, caption, altText);
  console.log(`  Container ID: ${containerId}`);

  await waitUntilReady(containerId);

  const mediaId = await publishMedia(containerId);
  console.log(`✅ Instagram Published: ${mediaId}`);

  return mediaId;
}

module.exports = {
  postToInstagram,
  buildCaption,
};