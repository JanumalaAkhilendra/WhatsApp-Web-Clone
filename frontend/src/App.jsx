// frontend/src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import { fetchConversations } from "./api";
import { io } from "socket.io-client";

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [selectedWaId, setSelectedWaId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    load();
    const base = import.meta.env.VITE_API_BASE || 'https://whatsapp-web-12.up.railway.app';
    console.log('🔌 Connecting to backend:', base);
    const s = io(base);
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handler = (msg) => {
      console.log('🔄 Socket message received:', msg);
      // Only reload if the message affects the current conversation
      if (msg && msg.wa_id === selectedWaId) {
        load();
      }
    };
    
    socket.on('message_updated', handler);
    return () => socket.off('message_updated', handler);
  }, [socket, selectedWaId]);

  async function load() {
    if (loadingRef.current) {
      console.log('⏳ Already loading, skipping...');
      return;
    }
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      console.log('📡 Fetching conversations...');
      const data = await fetchConversations();
      console.log('✅ Conversations fetched:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Data length:', Array.isArray(data) ? data.length : 'Not an array');
      console.log('📊 First conversation:', data[0]);
      setConversations(data || []);
    } catch (e) {
      console.error('❌ Failed to load conversations:', e);
      setError(e.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  function onSelect(convId, wa_id) {
    console.log('👆 Conversation selected:', { convId, wa_id });
    setSelectedConvId(convId);
    setSelectedWaId(wa_id);
  }

  // Demo functions
  async function simulateStatusProgression() {
    try {
      // Try the test endpoint first
      const response = await fetch('https://whatsapp-web-12.up.railway.app/test/status-progression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      console.log('✅ Status progression test completed:', result);
      
      // Reload conversations to see the updated statuses
      setTimeout(() => {
        load();
      }, 1000);
      
    } catch (err) {
      console.error('❌ Failed to start status progression:', err);
    }
  }

  // Debug render
  console.log('🎨 Rendering App with:', { 
    conversationsCount: conversations.length, 
    conversations, 
    loading, 
    error 
  });

  return (
    <div className="app">
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          Loading conversations...
        </div>
      )}
      
      {error && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px',
          background: '#ff4444',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          Error: {error}
        </div>
      )}

      {/* Demo Control Panel */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '2px solid #128C7E'
      }}>
        <button 
          onClick={() => setShowDemo(!showDemo)}
          style={{
            background: '#128C7E',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showDemo ? 'Hide' : 'Show'} Demo Controls
        </button>
        
        {showDemo && (
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#128C7E' }}>🎯 Demo Features</h4>
            <button 
              onClick={simulateStatusProgression}
              style={{
                background: '#25d366',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginBottom: '5px',
                display: 'block',
                width: '100%'
              }}
            >
              🚀 Simulate Status Progression
            </button>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              <div>✓ Grey = Sent</div>
              <div>✓✓ Grey = Delivered</div>
              <div>✓✓ Blue = Read</div>
            </div>
          </div>
        )}
      </div>
      
      <ChatList conversations={conversations} onSelect={onSelect} selected={selectedConvId} />
      <ChatWindow wa_id={selectedWaId} socket={socket} />
    </div>
  );
}
