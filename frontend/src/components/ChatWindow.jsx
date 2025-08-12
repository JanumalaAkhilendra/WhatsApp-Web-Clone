import React, { useEffect, useState, useRef } from "react";
import { fetchMessages, sendMessage } from "../api";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ wa_id, socket }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userInfo, setUserInfo] = useState({ name: null, number: wa_id });
  const [isTyping, setIsTyping] = useState(false);
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

  if (!wa_id) return (
    <div className="chat-window empty">
      <div className="empty-content">
        <div className="empty-icon">💬</div>
        <div className="empty-text">Select a chat to start messaging</div>
      </div>
    </div>
  );

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar">
          {(userInfo.name || userInfo.number || 'U').slice(0,1).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <div className="chat-name">{userInfo.name || userInfo.number}</div>
          <div className="chat-number">{userInfo.number}</div>
        </div>
        <div className="chat-header-actions">
          <button className="header-btn">📞</button>
          <button className="header-btn">📹</button>
          <button className="header-btn">⋮</button>
        </div>
      </div>
      
      <div className="messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <div className="no-messages-text">No messages yet</div>
            <div className="no-messages-subtext">Start a conversation by sending a message</div>
          </div>
        ) : (
          messages.map((m, index) => (
            <MessageBubble 
              key={m._id || m.msg_id || `msg-${index}`} 
              m={m} 
            />
          ))
        )}
        <div ref={scrollRef} />
      </div>
      
      <form className="composer" onSubmit={submit}>
        <div className="composer-input-wrapper">
          <input 
            value={text} 
            onChange={e => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message" 
            className="composer-input"
          />
          <button type="submit" className="send-btn" disabled={!text.trim()}>
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
