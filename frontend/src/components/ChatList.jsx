import React, { useState } from "react";
import { format } from "date-fns";

export default function ChatList({ conversations, onSelect, selected }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  const getMessageStatus = (message) => {
    if (message.direction === 'outbound') {
      switch (message.status) {
        case 'sent': return '✓';
        case 'delivered': return '✓✓';
        case 'read': return { icon: '✓✓', className: 'read' };
        default: return '';
      }
    }
    return '';
  };

  // Filter conversations based on search and active filter
  const filteredConversations = conversations?.filter(conv => {
    const last = conv.lastMessage;
    const name = (last.name || last.number || last.wa_id || '').toLowerCase();
    const text = (last.text || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || text.includes(searchTerm.toLowerCase());
    
    // Add filter logic here if needed
    return matchesSearch;
  }) || [];

  // Early return if no conversations
  if (!conversations || conversations.length === 0) {
    console.log('📭 No conversations to display');
    return (
      <div className="whatsapp-chat-list">
        <div className="wa-header">
          <div className="wa-header-left">
            <div className="wa-profile-avatar">U</div>
          </div>
          <div className="wa-header-actions">
            <button className="wa-header-btn" title="New chat">
              <svg viewBox="0 0 24 24">
                <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 1.668-.615 1.668-1.646V4.821c0-1.032-.635-1.646-1.668-1.646z"/>
              </svg>
            </button>
            <button className="wa-header-btn" title="Menu">
              <svg viewBox="0 0 24 24">
                <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="wa-search-container">
          <div className="wa-search-wrapper">
            <svg className="wa-search-icon" viewBox="0 0 24 24">
              <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"/>
            </svg>
            <input 
              className="wa-search-input" 
              placeholder="Search or start new chat" 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="wa-filter-tabs">
          {['All', 'Unread', 'Favorites', 'Groups'].map(filter => (
            <button 
              key={filter}
              className={`wa-filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <div className="wa-no-conversations">
          <div className="wa-no-conversations-icon">💬</div>
          <div className="wa-no-conversations-text">No conversations yet</div>
          <div className="wa-no-conversations-subtext">
            Start a new conversation to get started
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering conversations:', filteredConversations);

  return (
    <div className="whatsapp-chat-list">
      <div className="wa-header">
        <div className="wa-header-left">
          <div className="wa-profile-avatar">U</div>
        </div>
        <div className="wa-header-actions">
          <button className="wa-header-btn" title="New chat">
            <svg viewBox="0 0 24 24">
              <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 1.668-.615 1.668-1.646V4.821c0-1.032-.635-1.646-1.668-1.646z"/>
            </svg>
          </button>
          <button className="wa-header-btn" title="Menu">
            <svg viewBox="0 0 24 24">
              <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="wa-search-container">
        <div className="wa-search-wrapper">
          <svg className="wa-search-icon" viewBox="0 0 24 24">
            <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"/>
          </svg>
          <input 
            className="wa-search-input" 
            placeholder="Search or start new chat" 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="wa-filter-tabs">
        {['All', 'Unread', 'Favorites', 'Groups'].map(filter => (
          <button 
            key={filter}
            className={`wa-filter-tab ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="wa-archive-banner">
        <svg className="wa-archive-icon" viewBox="0 0 24 24">
          <path d="M4 7h16v2h-2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9H4V7zm2 2v8h12V9H6zm6-6c1.1 0 2 .9 2 2H10c0-1.1.9-2 2-2z"/>
        </svg>
        <span className="wa-archive-text">Archived</span>
        <span className="wa-archive-count">0</span>
      </div>
      
      <div className="wa-chat-list-container">
        {filteredConversations.map((conv, index) => {
          const last = conv.lastMessage;
          const unread = (conv.count || 0) > 0 ? conv.count : 0;
          const isSelected = selected === conv._id;
          const status = getMessageStatus(last);
          
          console.log(`📱 Rendering conversation ${index + 1}:`, { 
            conv, 
            last, 
            isSelected 
          });
          
          return (
            <div 
              key={conv._id} 
              className={`wa-chat-item ${isSelected ? 'selected' : ''}`} 
              onClick={() => onSelect(conv._id, last.wa_id)}
            >
              <div className="wa-chat-avatar">
                {(last.name || last.number || last.wa_id || 'U').slice(0,1).toUpperCase()}
              </div>
              <div className="wa-chat-content">
                <div className="wa-chat-meta">
                  <div className="wa-chat-name">
                    {last.name || last.number || last.wa_id || 'Unknown'}
                  </div>
                  <div className="wa-chat-time">
                    {formatTime(last.timestamp)}
                  </div>
                </div>
                <div className="wa-chat-snippet-row">
                  <div className="wa-chat-snippet">{formatLastMessage(last.text)}</div>
                  <div className="wa-chat-meta-info">
                    {unread > 0 && <div className="wa-unread-pill">{unread}</div>}
                    {typeof status === 'object' && (
                      <div className={`wa-message-status ${status.className}`}>{status.icon}</div>
                    )}
                    {typeof status === 'string' && status && (
                      <div className="wa-message-status">{status}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}