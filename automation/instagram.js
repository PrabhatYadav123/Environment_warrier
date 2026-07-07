require("dotenv").config();
const axios = require("axios");

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ID = process.env.INSTAGRAM_BUSINESS_ID;

async function createMediaContainer(imageUrl, caption) {
  const url = `https://graph.facebook.com/v23.0/${INSTAGRAM_BUSINESS_ID}/media`;

  const { data } = await axios.post(
    url,
    null,
    {
      params: {
        image_url: imageUrl,
        caption,
        access_token: ACCESS_TOKEN,
      },
    }
  );

  return data.id;
}

async function publishMedia(containerId) {
  const url = `https://graph.facebook.com/v23.0/${INSTAGRAM_BUSINESS_ID}/media_publish`;

  const { data } = await axios.post(
    url,
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

async function waitUntilReady(containerId) {
  while (true) {
    const { data } = await axios.get(
      `https://graph.facebook.com/v23.0/${containerId}`,
      {
        params: {
          fields: "status_code",
          access_token: ACCESS_TOKEN,
        },
      }
    );

    if (data.status_code === "FINISHED") return;

    if (data.status_code === "ERROR") {
      throw new Error("Instagram media processing failed.");
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}

async function postToInstagram(imageUrl, caption) {
  console.log("📸 Posting to Instagram...");

  const containerId = await createMediaContainer(imageUrl, caption);

  await waitUntilReady(containerId);

  const mediaId = await publishMedia(containerId);

  console.log("✅ Instagram Published:", mediaId);

  return mediaId;
}

module.exports = {
  postToInstagram,
};