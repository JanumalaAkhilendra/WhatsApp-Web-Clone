const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { emitNewMessage } = require('../utils/socket');
const { simulateStatusProgression } = require('../controllers/messageController');

router.get('/conversations', async (req, res) => {
  // group by wa_id and return last message and count
  const results = await Message.aggregate([
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
  res.json(results);
});

router.get('/conversations/:wa_id/messages', async (req, res) => {
  const { wa_id } = req.params;
  const messages = await Message.find({ wa_id }).sort({ timestamp: 1 });
  res.json(messages);
});

router.post('/messages', async (req, res) => {
  // demo "send message" - save to DB and broadcast
  const { wa_id, text, name, number } = req.body;
  if (!wa_id || !text) return res.status(400).json({ error: "wa_id and text required" });

  const msg = await Message.create({
    msg_id: `local-${Date.now()}`,
    wa_id,
    name,
    number,
    direction: 'outbound',
    text,
    timestamp: new Date(),
    status: 'sent',
    raw: { demo: true }
  });

  emitNewMessage(msg);
  res.json(msg);
});

// Demo endpoint to simulate status progression
router.post('/demo/status-progression', async (req, res) => {
  try {
    await simulateStatusProgression();
    res.json({ message: 'Status progression simulation started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demo endpoint to manually update message status
router.put('/messages/:msg_id/status', async (req, res) => {
  try {
    const { msg_id } = req.params;
    const { status } = req.body;
    
    if (!['sent', 'delivered', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: sent, delivered, or read' });
    }
    
    const message = await Message.findOneAndUpdate(
      { msg_id },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    emitNewMessage(message);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
