import React, { useEffect, useState, useRef } from "react";
import { fetchMessages, sendMessage } from "../api";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ wa_id, socket }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userInfo, setUserInfo] = useState({ name: null, number: wa_id });
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const scrollRef = useRef();
  const messagesRef = useRef(new Set()); // Track message IDs to prevent duplicates
  
  useEffect(() => {
    if (!wa_id) { 
      setMessages([]); 
      setUserInfo({ name: null, number: null }); 
      messagesRef.current.clear();
      return; 
    }
    
    fetchMessages(wa_id)
      .then(msgs => {
        const uniqueMessages = msgs || [];
        setMessages(uniqueMessages);
        
        // Track message IDs
        messagesRef.current.clear();
        uniqueMessages.forEach(msg => {
          messagesRef.current.add(msg._id || msg.msg_id);
        });
        
        const lastWithInfo = uniqueMessages.slice().reverse().find(m => m.name || m.number || m.wa_id);
        setUserInfo({ 
          name: lastWithInfo?.name || lastWithInfo?.wa_id || 'Unknown',
          number: lastWithInfo?.number || lastWithInfo?.wa_id || 'Unknown'
        });
      })
      .catch(() => setMessages([]));
  }, [wa_id]);

  useEffect(() => {
    if (!socket) return;
    
    const handler = (msg) => {
      if (!msg || msg.wa_id !== wa_id) return;
      console.log('🔄 Received message update:', msg);
      
      setMessages(prev => {
        const msgId = msg._id || msg.msg_id;
        
        // Check if we already have this message
        if (messagesRef.current.has(msgId)) {
          // Update existing message
          const updated = prev.map(m => 
            (m._id === msgId || m.msg_id === msgId) ? msg : m
          );
          return updated;
        } else {
          // Add new message
          messagesRef.current.add(msgId);
          return [...prev, msg];
        }
      });
      
      if (msg.name || msg.number || msg.wa_id) {
        setUserInfo({ 
          name: msg.name || msg.wa_id || userInfo.name, 
          number: msg.number || msg.wa_id || userInfo.number
        });
      }
    };
    
    socket.on('message_updated', handler);
    return () => socket.off('message_updated', handler);
  }, [socket, wa_id, userInfo.name, userInfo.number]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    
    const payload = { 
      wa_id, 
      text, 
      name: userInfo.name || null, 
      number: userInfo.number || null 
    };
    
    try {
      const created = await sendMessage(payload);
      
      // Add to messages and track ID
      setMessages(prev => {
        const newMessages = [...prev, created];
        messagesRef.current.add(created._id || created.msg_id);
        return newMessages;
      });
      
      setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  }

  function handleInputChange(e) {
    setText(e.target.value);
    // Simulate typing indicator
    setIsTyping(!!e.target.value);
  }

  if (!wa_id) return (
    <div className="wa-chat-window-container">
      <div className="wa-empty-chat">
        <div className="wa-empty-content">
          <div className="wa-empty-icon">
            <svg viewBox="0 0 303 172" width="360" height="200">
              <defs>
                <linearGradient id="wa-intro-gradient" x1="50%" x2="50%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#f0f2f5"/>
                  <stop offset="100%" stopColor="#e9edef"/>
                </linearGradient>
              </defs>
              <path fill="url(#wa-intro-gradient)" d="M96.1 173.4c50.9 0 92.1-41.3 92.1-92.1 0-50.9-41.3-92.1-92.1-92.1s-92.1 41.3-92.1 92.1c0 50.9 41.3 92.1 92.1 92.1z"/>
            </svg>
          </div>
          <div className="wa-empty-title">WhatsApp Web</div>
          <div className="wa-empty-subtitle">
            Send and receive messages without keeping your phone online.
          </div>
          <div className="wa-empty-text">
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </div>
        </div>
      </div>
    </div>
  );

  const getLastSeen = () => {
    if (isOnline) return "online";
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.direction === 'inbound') {
        try {
          const date = new Date(lastMessage.timestamp);
          const now = new Date();
          const diffInMinutes = (now - date) / (1000 * 60);
          
          if (diffInMinutes < 1) return "last seen just now";
          if (diffInMinutes < 60) return `last seen ${Math.floor(diffInMinutes)} minutes ago`;
          
          const diffInHours = diffInMinutes / 60;
          if (diffInHours < 24) return `last seen ${Math.floor(diffInHours)} hours ago`;
          
          return `last seen ${date.toLocaleDateString()}`;
        } catch {
          return "last seen recently";
        }
      }
    }
    return "last seen recently";
  };

  return (
    <div className="wa-chat-window-container">
      {/* Header */}
      <div className="wa-chat-header">
        <div className="wa-chat-header-left">
          <div className="wa-chat-avatar">
            {(userInfo.name || userInfo.number || 'U').slice(0,1).toUpperCase()}
          </div>
          <div className="wa-chat-header-info">
            <div className="wa-chat-header-name">
              {userInfo.name || userInfo.number}
            </div>
            <div className="wa-chat-header-status">
              {isTyping ? "typing..." : getLastSeen()}
            </div>
          </div>
        </div>
        <div className="wa-chat-header-actions">
          <button className="wa-chat-header-btn" title="Video call">
            <svg viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </button>
          <button className="wa-chat-header-btn" title="Voice call">
            <svg viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
          <button className="wa-chat-header-btn" title="Search">
            <svg viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button className="wa-chat-header-btn" title="Menu">
            <svg viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="wa-messages-container">
        <div className="wa-messages-background">
          {/* WhatsApp's subtle pattern background */}
        </div>
        
        {messages.length === 0 ? (
          <div className="wa-no-messages">
            <div className="wa-no-messages-content">
              <div className="wa-encryption-notice">
                <svg className="wa-lock-icon" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <span>Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="wa-messages-list">
            {messages.map((m, index) => (
              <MessageBubble 
                key={m._id || m.msg_id || `msg-${index}`} 
                m={m} 
              />
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Message Composer */}
      <div className="wa-composer-container">
        <div className="wa-composer">
          <button className="wa-composer-btn" title="Emoji">
            <svg viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </button>
          
          <button className="wa-composer-btn" title="Attach">
            <svg viewBox="0 0 24 24">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </button>

          <div className="wa-message-input-container">
            <input 
              type="text"
              className="wa-message-input"
              placeholder="Type a message"
              value={text}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
          </div>

          {text.trim() ? (
            <button 
              className="wa-send-btn" 
              onClick={submit}
              title="Send"
            >
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button className="wa-composer-btn" title="Voice message">
              <svg viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}