const API_BASE = import.meta.env.VITE_API_BASE || "https://whatsapp-web-12.up.railway.app";

console.log('🌐 API Base URL:', API_BASE);

export async function fetchConversations() {
  try {
    console.log('📡 Fetching conversations from:', `${API_BASE}/api/conversations`);
    
    const res = await fetch(`${API_BASE}/api/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('📥 Response status:', res.status);
    console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ Conversations data received:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      apiBase: API_BASE
    });
    throw error;
  }
}

export async function fetchMessages(wa_id) {
  try {
    console.log('📡 Fetching messages for:', wa_id);
    
    const res = await fetch(`${API_BASE}/api/conversations/${encodeURIComponent(wa_id)}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ Messages data received:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw error;
  }
}

export async function sendMessage(payload) {
  try {
    console.log('📡 Sending message:', payload);
    
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ Message sent successfully:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
}