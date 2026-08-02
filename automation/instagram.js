require("dotenv").config();
const axios = require("axios");

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ID = process.env.INSTAGRAM_BUSINESS_ID;
const GRAPH_API_BASE_URL = (
  process.env.INSTAGRAM_GRAPH_API_BASE_URL || "https://graph.facebook.com"
).replace(/\/$/, "");
const GRAPH_API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION || "v25.0";

function mediaEndpoint(path) {
  return `${GRAPH_API_BASE_URL}/${GRAPH_API_VERSION}/${path}`;
}

function getMetaError(error) {
  const metaError = error.response?.data?.error;
  if (!metaError) return error.message;

  const details = [
    metaError.message,
    metaError.error_user_title,
    metaError.error_user_msg,
    metaError.code && `code ${metaError.code}`,
    metaError.error_subcode && `subcode ${metaError.error_subcode}`,
    metaError.fbtrace_id && `trace ${metaError.fbtrace_id}`,
  ].filter(Boolean);

  return details.join(" | ");
}

function requireInstagramConfig() {
  const missing = [
    ["INSTAGRAM_ACCESS_TOKEN", ACCESS_TOKEN],
    ["INSTAGRAM_BUSINESS_ID", INSTAGRAM_BUSINESS_ID],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Instagram configuration missing: ${missing.join(", ")}`);
  }
}

async function verifyInstagramConnection() {
  requireInstagramConfig();

  try {
    const { data } = await axios.get(
      mediaEndpoint(INSTAGRAM_BUSINESS_ID),
      {
        params: {
          fields: "id,username",
          access_token: ACCESS_TOKEN,
        },
      },
    );
    console.log(`  Connected as @${data.username || data.id}`);
    return data;
  } catch (error) {
    throw new Error(`Instagram connection check failed: ${getMetaError(error)}`);
  }
}

// ✅ Single image container
async function createMediaContainer(imageUrl, caption, altText = "") {
  const { data } = await axios.post(
    mediaEndpoint(`${INSTAGRAM_BUSINESS_ID}/media`),
    null,
    {
      params: {
        image_url: imageUrl,
        caption,
        alt_text: altText,
        access_token: ACCESS_TOKEN,
      },
    }
  );
  return data.id;
}

// ✅ Carousel child item banao (no caption here)
async function createCarouselItem(imageUrl, altText = "") {
  const { data } = await axios.post(
    mediaEndpoint(`${INSTAGRAM_BUSINESS_ID}/media`),
    null,
    {
      params: {
        image_url: imageUrl,
        alt_text: altText,
        is_carousel_item: true,  // ← Important!
        access_token: ACCESS_TOKEN,
      },
    }
  );
  return data.id;
}

// ✅ Carousel container banao
async function createCarouselContainer(childrenIds, caption) {
  const { data } = await axios.post(
    mediaEndpoint(`${INSTAGRAM_BUSINESS_ID}/media`),
    null,
    {
      params: {
        media_type: "CAROUSEL",
        children: childrenIds.join(","),  // ← All child IDs
        caption,
        access_token: ACCESS_TOKEN,
      },
    }
  );
  return data.id;
}

// ✅ Publish karo
async function publishMedia(containerId) {
  const { data } = await axios.post(
    mediaEndpoint(`${INSTAGRAM_BUSINESS_ID}/media_publish`),
    null,
    {
      params: {
        creation_id: containerId,
        access_token: ACCESS_TOKEN,
      },
    }
  );
  return data.id;
}

// ✅ Ready hone ka wait karo
async function waitUntilReady(containerId, maxWait = 60000) {
  const startTime = Date.now();

  while (true) {
    const { data } = await axios.get(
      mediaEndpoint(containerId),
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
      throw new Error(`Media processing failed: ${data.status}`);
    }
    if (Date.now() - startTime > maxWait) {
      throw new Error("Timed out after 60s");
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}

// ✅ SEO Caption
function buildCaption(title, excerpt, blogUrl, tags = []) {
  const baseHashtags = [
    "#ClimateChange", "#Environment", "#India",
    "#GreenIndia", "#SaveEarth", "#Sustainability",
    "#ClimateAction", "#EcoFriendly", "#GoGreen",
    "#EnvironmentWarrior", "#IndiaClimate", "#SaveThePlanet",
    "#CleanIndia", "#NatureIndia", "#GreenRevolution"
  ];

  const tagHashtags = tags
    .slice(0, 3)
    .map(t => `#${t.replace(/\s+/g, "").replace(/-/g, "")}`);

  const allHashtags = [...new Set([...tagHashtags, ...baseHashtags])]
    .slice(0, 20)
    .join(" ");

  return `🌍 ${title}

${excerpt}

✅ Swipe to see more →

💬 What do YOU think we should do? Comment below!
🔖 Save this post to read the full article later!
👇 Link in bio for more!

🔗 ${blogUrl}

.
.
.
${allHashtags}`;
}

// ✅ Main — Carousel post karo
async function postToInstagram(featuredImageUrl, caption, altText = "", galleryImages = []) {
  console.log("📸 Posting carousel to Instagram...");
  await verifyInstagramConnection();

  // Sab images combine karo — featured + gallery
  const allImages = [featuredImageUrl, ...galleryImages.map(img => img.url || img)]
    .filter(Boolean)
    .slice(0, 10); // Meta supports at most 10 carousel items.

  console.log(`  Total images: ${allImages.length}`);

  if (allImages.length === 1) {
    // Sirf ek image hai — single post karo
    console.log("  Single image post...");
    const containerId = await createMediaContainer(allImages[0], caption, altText);
    await waitUntilReady(containerId);
    const mediaId = await publishMedia(containerId);
    console.log(`✅ Instagram Published: ${mediaId}`);
    return mediaId;
  }

  // Multiple images — carousel banao
  console.log("  Creating carousel items...");
  const childItems = [];

  for (let i = 0; i < allImages.length; i++) {
    console.log(`  Creating item ${i + 1}/${allImages.length}...`);
    try {
      const childId = await createCarouselItem(
        allImages[i],
        `${altText} - Image ${i + 1}`
      );
      await waitUntilReady(childId);
      childItems.push({ id: childId, imageUrl: allImages[i] });
      console.log(`  ✅ Item ${i + 1} ready`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ Item ${i + 1} failed: ${getMetaError(err)}`);
    }
  }

  if (childItems.length === 0) {
    throw new Error("No carousel items created!");
  }

  // Meta requires 2–10 items in a carousel. If only one image made it through
  // processing, publish that successful image as a normal post instead.
  if (childItems.length === 1) {
    console.warn("  ⚠️ Only one carousel item succeeded; publishing it as a single image post.");
    const containerId = await createMediaContainer(childItems[0].imageUrl, caption, altText);
    await waitUntilReady(containerId);
    const mediaId = await publishMedia(containerId);
    console.log(`✅ Instagram Published: ${mediaId}`);
    return mediaId;
  }

  // Carousel container banao
  console.log(`  Creating carousel with ${childItems.length} images...`);
  const carouselId = await createCarouselContainer(childItems.map((item) => item.id), caption);
  await waitUntilReady(carouselId);

  // Publish karo
  const mediaId = await publishMedia(carouselId);
  console.log(`✅ Carousel Published! Post ID: ${mediaId}`);
  return mediaId;
}

module.exports = {
  postToInstagram,
  buildCaption,
  verifyInstagramConnection,
};
