// backend/src/routes/webhook.js
const express = require('express');
const router = express.Router();
const { upsertMessageFromPayload, updateStatusByMetaId } = require('../controllers/messageController');
const { emitNewMessage } = require('../utils/socket');

/**
 * Generic webhook receiver for WhatsApp messages
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    
    console.log('Webhook received payload:', JSON.stringify(payload, null, 2));

    // Handle verification requests from WhatsApp
    if (payload['hub.mode'] === 'subscribe' && payload['hub.challenge']) {
      console.log('WhatsApp webhook verification');
      return res.status(200).send(payload['hub.challenge']);
    }

    // 1) Array of events
    if (Array.isArray(payload)) {
      console.log('Processing array payload with', payload.length, 'items');
      const results = [];
      for (const p of payload) {
        const result = await processPayload(p);
        if (result) results.push(result);
      }
      return res.status(200).json({ success: true, processed: results.length });
    }

    // 2) Single payload
    const result = await processPayload(payload);
    if (result) {
      return res.json({ ok: true, message: result._id, text: result.text });
    } else {
      return res.json({ ok: true, message: 'No message created', reason: 'Invalid or incomplete payload' });
    }

  } catch (err) {
    console.error('Webhook error:', err);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    return res.status(500).json({ ok: false, error: err.message });
  }
});

async function processPayload(payload) {
  try {
    // Check if it's a status-only payload
    if (payload.payload_type === 'whatsapp_webhook' && payload.metaData?.entry?.[0]?.changes?.[0]?.value?.statuses) {
      console.log('Processing status update');
      const statusUpdate = payload.metaData.entry[0].changes[0].value.statuses[0];
      const msgId = statusUpdate.id || statusUpdate.meta_msg_id;
      const status = statusUpdate.status;
      const wa_id = statusUpdate.recipient_id;
      
      if (msgId && status) {
        const updated = await updateStatusByMetaId(msgId, status);
        if (updated) {
          emitNewMessage(updated);
          return updated;
        }
      }
      return null;
    }

    // Process regular message payload
    console.log('Processing message payload');
    const msg = await upsertMessageFromPayload(payload);
    
    if (msg) {
      console.log('Message created/updated:', msg._id);
      emitNewMessage(msg);
      return msg;
    }
    
    return null;
  } catch (err) {
    console.error('Error processing payload:', err);
    return null;
  }
}

// GET route for webhook verification (WhatsApp requires this)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify the webhook (you should set your own verify token)
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'your_verify_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

module.exports = router;