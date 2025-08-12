const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { upsertMessageFromPayload } = require('../src/controllers/messageController');
const Message = require('../src/models/Message');

dotenv.config();

const dir = path.join(process.cwd(), 'scripts', 'payloads');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Clear existing messages to avoid duplicates
    await Message.deleteMany({});
    console.log('Cleared existing messages');

    const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));
    console.log(`Found ${files.length} payload files to process`);

    let processedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(dir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const payload = JSON.parse(raw);

        console.log(`Processing: ${file}`);
        const result = await upsertMessageFromPayload(payload);
        
        if (result) {
          processedCount++;
          console.log(`✅ Successfully processed: ${file} -> Message ID: ${result._id}`);
        } else {
          console.log(`⚠️  Skipped: ${file} (no message created)`);
        }
      } catch (err) {
        errorCount++;
        console.error(`❌ Error processing ${file}:`, err.message);
      }
    }

    // Verify what was loaded
    const totalMessages = await Message.countDocuments();
    const conversations = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          lastMessage: { $first: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "lastMessage.timestamp": -1 } }
    ]);

    console.log('\n📊 Loading Summary:');
    console.log(`Total messages loaded: ${totalMessages}`);
    console.log(`Conversations created: ${conversations.length}`);
    console.log(`Files processed: ${processedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (conversations.length > 0) {
      console.log('\n💬 Conversations loaded:');
      conversations.forEach((conv, index) => {
        const last = conv.lastMessage;
        console.log(`${index + 1}. ${last.name || last.wa_id} (${last.wa_id}) - ${conv.count} messages`);
      });
    }

    await mongoose.disconnect();
    console.log('\n🎉 Done! Database populated with sample conversations.');
    
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

run();
