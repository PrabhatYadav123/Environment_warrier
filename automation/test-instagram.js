require("dotenv").config();
const { postToInstagram } = require("./instagram"); // ← instagram.js

async function test() {
  try {
    const imageUrl = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080";
    
    const caption = `🌍 Fighting for a cleaner planet!

Every action counts. Join the Environment Warrior movement today. 🌱

#EnvironmentWarrior #ClimateAction #SaveThePlanet #India #Environment`;

    const postId = await postToInstagram(imageUrl, caption);
    console.log("🎉 SUCCESS! Post ID:", postId);

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

test();