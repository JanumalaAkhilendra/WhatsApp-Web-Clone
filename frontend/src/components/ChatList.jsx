import React from "react";
import { format, formatDistanceToNow } from "date-fns";

export default function ChatList({ conversations, onSelect, selected }) {
  // Debug logging
  console.log('💬 ChatList rendering with:', { 
    conversationsCount: conversations?.length || 0, 
    conversations, 
    selected 
  });

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return format(date, 'HH:mm');
      } else if (diffInHours < 168) { // 7 days
        return format(date, 'EEE');
      } else {
        return format(date, 'dd/MM');
      }
    } catch {
      return '';
    }
  };

  const formatLastMessage = (text) => {
    if (!text) return '—';
    if (text.length > 45) {
      return text.slice(0, 45) + '...';
    }
    return text;
  };

  // Early return if no conversations
  if (!conversations || conversations.length === 0) {
    console.log('📭 No conversations to display');
    return (
      <div className="chat-list">
        <div className="header">
          <div className="header-title">Chats</div>
          <div className="header-actions">
            <button className="header-action-btn">✏️</button>
            <button className="header-action-btn">⋮</button>
          </div>
        </div>
        
        <div className="no-conversations">
          <div className="no-conversations-icon">💬</div>
          <div className="no-conversations-text">No conversations yet</div>
          <div className="no-conversations-subtext">
            Debug: conversations = {JSON.stringify(conversations)}
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering conversations:', conversations);

  return (
    <div className="chat-list">
      <div className="header">
        <div className="header-title">Chats</div>
        <div className="header-actions">
          <button className="header-action-btn">✏️</button>
          <button className="header-action-btn">⋮</button>
        </div>
      </div>
      
      {conversations.map((conv, index) => {
        const last = conv.lastMessage;
        const unread = (conv.count || 0) - 0;
        const isSelected = selected === conv._id;
        
        console.log(`📱 Rendering conversation ${index + 1}:`, { 
          conv, 
          last, 
          isSelected 
        });
        
        return (
          <div 
            key={conv._id} 
            className={`chat-list-item ${isSelected ? 'selected' : ''}`} 
            onClick={() => onSelect(conv._id, last.wa_id)}
          >
            <div className="chat-avatar">
              {(last.name || last.number || last.wa_id || 'U').slice(0,1).toUpperCase()}
            </div>
            <div className="chat-content">
              <div className="chat-meta">
                <div className="chat-name">
                  {last.name || last.number || last.wa_id || 'Unknown'}
                </div>
                <div className="chat-time">
                  {formatTime(last.timestamp)}
                </div>
              </div>
              <div className="chat-snippet-row">
                <div className="chat-snippet">{formatLastMessage(last.text)}</div>
                {unread > 0 && <div className="unread-pill">{unread}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
