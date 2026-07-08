require("dotenv").config();
const axios = require("axios");

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ID = process.env.INSTAGRAM_BUSINESS_ID;

// ✅ Single image container
async function createMediaContainer(imageUrl, caption, altText = "") {
  const { data } = await axios.post(
    `https://graph.facebook.com/v25.0/${INSTAGRAM_BUSINESS_ID}/media`,
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
    `https://graph.facebook.com/v25.0/${INSTAGRAM_BUSINESS_ID}/media`,
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
    `https://graph.facebook.com/v25.0/${INSTAGRAM_BUSINESS_ID}/media`,
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
    `https://graph.facebook.com/v25.0/${INSTAGRAM_BUSINESS_ID}/media_publish`,
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

  // Sab images combine karo — featured + gallery
  const allImages = [featuredImageUrl, ...galleryImages.map(img => img.url || img)].slice(0, 10); // Max 10

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
  const childIds = [];

  for (let i = 0; i < allImages.length; i++) {
    console.log(`  Creating item ${i + 1}/${allImages.length}...`);
    try {
      const childId = await createCarouselItem(
        allImages[i],
        `${altText} - Image ${i + 1}`
      );
      await waitUntilReady(childId);
      childIds.push(childId);
      console.log(`  ✅ Item ${i + 1} ready`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ Item ${i + 1} failed: ${err.message}`);
    }
  }

  if (childIds.length === 0) {
    throw new Error("No carousel items created!");
  }

  // Carousel container banao
  console.log(`  Creating carousel with ${childIds.length} images...`);
  const carouselId = await createCarouselContainer(childIds, caption);
  await waitUntilReady(carouselId);

  // Publish karo
  const mediaId = await publishMedia(carouselId);
  console.log(`✅ Carousel Published! Post ID: ${mediaId}`);
  return mediaId;
}

module.exports = {
  postToInstagram,
  buildCaption,
};