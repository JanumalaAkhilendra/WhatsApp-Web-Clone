import React from 'react';
import { format } from 'date-fns';

export default function MessageBubble({ m }) {
  const isOwn = m.direction === 'outbound';
  
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return (
          <svg className="wa-message-status sent" viewBox="0 0 16 15">
            <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg className="wa-message-status delivered" viewBox="0 0 16 15">
            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.909-2.043a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
            <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      case 'read':
        return (
          <svg className="wa-message-status read" viewBox="0 0 16 15">
            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.909-2.043a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
            <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const shouldShowTail = true; // You can add logic here to determine when to show message tails

  return (
    <div className={`wa-message-container ${isOwn ? 'own' : 'other'}`}>
      <div className={`wa-message-bubble ${isOwn ? 'own' : 'other'} ${shouldShowTail ? 'tail' : ''}`}>
        <div className="wa-message-content">
          <span className="wa-message-text">
            {m.text || '(no text)'}
          </span>
          <div className="wa-message-meta">
            <span className="wa-message-time">
              {formatTime(m.timestamp)}
            </span>
            {isOwn && (
              <span className="wa-message-status-container">
                {renderStatusIcon(m.status)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Optional: Add message reactions or other features */}
      {/* 
      <div className="wa-message-reactions">
        // Message reactions would go here
      </div>
      */}
    </div>
  );
}