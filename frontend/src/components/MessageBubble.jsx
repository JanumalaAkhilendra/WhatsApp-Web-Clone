import React from 'react';
import { format } from 'date-fns';

export default function MessageBubble({ m }) {
  const isOwn = m.direction === 'outbound';
  
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <span className="status-icon sent">✓</span>;
      case 'delivered':
        return <span className="status-icon delivered">✓✓</span>;
      case 'read':
        return <span className="status-icon read">✓✓</span>;
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return '#667781'; // Grey
      case 'delivered':
        return '#667781'; // Grey
      case 'read':
        return '#53bdeb'; // Blue
      default:
        return '#667781'; // Grey
    }
  };

  return (
    <div className={`message-row ${isOwn ? 'out' : 'in'}`}>
      <div className="bubble">
        <div className="bubble-text">{m.text || '(no text)'}</div>
        <div className="msg-meta">
          <span className="time">{formatTime(m.timestamp)}</span>
          {isOwn && (
            <span 
              className="status-icon" 
              style={{ color: getStatusColor(m.status) }}
            >
              {m.status === 'read' ? '✓✓' : m.status === 'delivered' ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
