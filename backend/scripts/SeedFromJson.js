// backend/scripts/seedFromJson.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { upsertMessageFromPayload } = require("../src/controllers/messageController");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const dirPath = path.join(__dirname, "../scripts/payloads");
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith(".json"));

  console.log(`Found ${files.length} JSON files to process...`);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const payload = JSON.parse(raw);

    try {
      const saved = await upsertMessageFromPayload(payload);
      console.log(`✅ Saved from ${file}: ${saved?.name || "No name"} (${saved?.wa_id})`);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err);
    }
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
