const Message = require('../models/Message');

// Parse payload & insert/update in DB
async function upsertMessageFromPayload(payload) {
  let text = null;
  let wa_id = null;
  let name = null;
  let number = null;
  let timestamp = null;
  let status = 'sent';
  let msgId = null;
  let direction = 'inbound';

  // Handle different payload structures
  if (payload.payload_type === 'whatsapp_webhook') {
    // WhatsApp webhook format
    try {
      // Handle both metaData and metaData structures
      const entry = payload?.metaData?.entry?.[0] || payload?.metaData?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (value?.messages?.[0]) {
        const msg = value.messages[0];
        if (msg?.text?.body) text = msg.text.body;
        if (msg?.id) msgId = msg.id;
        if (msg?.timestamp) timestamp = new Date(parseInt(msg.timestamp) * 1000);
        if (msg?.from) wa_id = msg.from;
        direction = 'inbound';
        status = 'sent'; // Inbound messages start as sent
      }

      if (value?.contacts?.[0]) {
        const contact = value.contacts[0];
        if (contact.profile?.name) name = contact.profile.name;
        if (contact.wa_id) wa_id = contact.wa_id;
      }

      if (value?.metadata?.display_phone_number) {
        number = value.metadata.display_phone_number;
      }

      // Handle status updates
      if (value?.statuses?.[0]) {
        const statusUpdate = value.statuses[0];
        if (statusUpdate.id) msgId = statusUpdate.id;
        if (statusUpdate.meta_msg_id) msgId = statusUpdate.meta_msg_id;
        if (statusUpdate.status) status = statusUpdate.status;
        if (statusUpdate.timestamp) timestamp = new Date(parseInt(statusUpdate.timestamp) * 1000);
        if (statusUpdate.recipient_id) wa_id = statusUpdate.recipient_id;
        
        // For status updates, we need to find and update existing message
        if (msgId) {
          const existing = await Message.findOne({ msg_id: msgId });
          if (existing) {
            existing.status = status;
            existing.timestamp = timestamp;
            await existing.save();
            return existing;
          }
        }
      }
    } catch (err) {
      console.error('Error parsing WA payload shape:', err);
    }
  } else {
    // Direct fields for simple payloads
    if (payload.text) text = payload.text;
    if (payload.wa_id) wa_id = payload.wa_id;
    if (payload.name) name = payload.name;
    if (payload.number) number = payload.number;
    if (payload.timestamp) timestamp = new Date(payload.timestamp);
    if (payload.status) status = payload.status;
    if (payload.id) msgId = payload.id;
    if (payload.direction) direction = payload.direction;
  }

  // Validate required fields
  if (!wa_id || !text) {
    console.log('Skipping payload - missing wa_id or text:', { wa_id, text });
    return null;
  }

  const doc = {
    msg_id: msgId || `local-${Date.now()}`,
    wa_id: String(wa_id),
    name: name || null,
    number: number || null,
    direction: direction,
    text: text,
    timestamp: timestamp || new Date(),
    status: status,
    raw: payload
  };

  const updated = await Message.findOneAndUpdate(
    { msg_id: doc.msg_id },
    { $set: doc },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return updated;
}

// Update message status by meta_msg_id
async function updateStatusByMetaId(metaMsgId, newStatus) {
  if (!metaMsgId || !newStatus) return null;
  
  // Validate status progression
  const validStatuses = ['sent', 'delivered', 'read'];
  if (!validStatuses.includes(newStatus)) {
    console.log('Invalid status:', newStatus);
    return null;
  }
  
  const updated = await Message.findOneAndUpdate(
    { msg_id: metaMsgId },
    { 
      $set: { 
        status: newStatus,
        updatedAt: new Date()
      }
    },
    { new: true }
  );
  
  if (updated) {
    console.log(`✅ Updated message ${metaMsgId} status to: ${newStatus}`);
  } else {
    console.log(`⚠️  No message found with ID: ${metaMsgId}`);
  }
  
  return updated;
}

// Simulate status progression for demo purposes
async function simulateStatusProgression() {
  try {
    const messages = await Message.find({ direction: 'outbound', status: 'sent' }).limit(5);
    
    for (const msg of messages) {
      // Simulate delivered status after 2 seconds
      setTimeout(async () => {
        await updateStatusByMetaId(msg.msg_id, 'delivered');
      }, 2000);
      
      // Simulate read status after 5 seconds
      setTimeout(async () => {
        await updateStatusByMetaId(msg.msg_id, 'read');
      }, 5000);
    }
  } catch (err) {
    console.error('Error simulating status progression:', err);
  }
}

module.exports = { upsertMessageFromPayload, updateStatusByMetaId, simulateStatusProgression };
