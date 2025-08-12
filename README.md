# WhatsApp Web Clone 🚀

A full-featured WhatsApp Web clone built with Node.js, React, and MongoDB. This application simulates real-time WhatsApp conversations using webhook data and provides a responsive, mobile-friendly interface that closely resembles WhatsApp Web.

## 🌐 **Live Demo**

- **Frontend**: https://whats-app-web-clone-hazel.vercel.app
- **Backend API**: https://whatsapp-web-12.up.railway.app
- **API Health Check**: https://whatsapp-web-12.up.railway.app/test

## ✨ Features

- **Real-time Messaging**: WebSocket-powered real-time message updates
- **WhatsApp-like UI**: Authentic WhatsApp Web design and user experience
- **Webhook Integration**: Process WhatsApp Business API webhook payloads
- **Message Status**: Track sent, delivered, and read statuses with blue checkmarks
- **Responsive Design**: Mobile-first design that works on all devices
- **MongoDB Storage**: Persistent message storage with proper indexing
- **Status Updates**: Real-time status updates for message delivery

## 🏗️ Architecture

- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React + Vite
- **Real-time**: Socket.IO for live updates
- **Styling**: Custom CSS with WhatsApp Web design system

## 📁 Project Structure

```
whatsapp-web-clone/
├── backend/                     # Node.js backend server
│   ├── src/
│   │   ├── controllers/        # Business logic controllers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API endpoints
│   │   ├── utils/             # Utility functions
│   │   ├── app.js             # Express app configuration
│   │   └── server.js          # Server entry point
│   ├── scripts/
│   │   └── payloads/          # Sample webhook payloads
│   ├── package.json
│   └── env.example            # Environment variables template
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.jsx            # Main application component
│   │   ├── api.js             # API client functions
│   │   ├── main.jsx           # Application entry point
│   │   └── styles.css         # WhatsApp Web styling
│   ├── package.json
│   └── vite.config.js         # Vite configuration
├── .gitignore                  # Git ignore rules
├── package.json                # Root package.json with scripts
├── vercel.json                 # Vercel deployment configuration
├── README.md                   # Project documentation
└── DEPLOYMENT.md              # Deployment guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd whatsapp-web-clone
npm run install:all
```

### 2. Environment Setup

#### Backend Configuration
```bash
cd backend
cp env.example .env
```

Edit `.env` with your MongoDB connection:
```env
MONGODB_URI=mongodb://localhost:27017/whatsapp
PORT=4000
CORS_ORIGIN=http://localhost:5173
WEBHOOK_VERIFY_TOKEN=your_verify_token_here
```

#### Frontend Configuration (Optional)
```bash
cd frontend
# Create .env if you want to customize API base URL
echo "VITE_API_BASE=http://localhost:4000" > .env
```

### 3. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend    # Backend on http://localhost:4000
npm run dev:frontend   # Frontend on http://localhost:5173
```

### 4. Load Sample Data (Optional)

```bash
npm run load-payloads
```

This will load the sample WhatsApp webhook payloads from `backend/scripts/payloads/` into your database.

## 📱 Usage

### Webhook Integration

Send POST requests to `/webhook` with WhatsApp Business API payloads:

```bash
curl -X POST http://localhost:4000/webhook \
  -H "Content-Type: application/json" \
  -d @backend/scripts/payloads/conversation_1_message_1.json
```

### API Endpoints

- `GET /api/conversations` - List all conversations
- `GET /api/conversations/:wa_id/messages` - Get messages for a conversation
- `POST /api/messages` - Send a new message
- `POST /webhook` - Webhook receiver for WhatsApp updates
- `POST /api/demo/status-progression` - Simulate message status progression

### Real-time Updates

The frontend automatically receives real-time updates via WebSocket when:
- New messages arrive via webhook
- Message statuses are updated
- Messages are sent from the interface

### Demo Features

- **Status Progression**: Watch message checkmarks change from grey to blue
- **Real-time Updates**: Messages appear instantly across all connected clients
- **Webhook Testing**: Use sample payloads to test the system

## 🎨 Customization

### Styling

The WhatsApp Web design is implemented in `frontend/src/styles.css`. Key design elements:

- **Colors**: WhatsApp's official color palette
- **Typography**: System fonts matching WhatsApp Web
- **Layout**: Responsive grid system
- **Components**: Message bubbles, chat list, composer

### Adding New Message Types

Extend the `Message` model in `backend/src/models/Message.js` to support:
- Media messages (images, videos, documents)
- Location sharing
- Contact cards
- Voice messages

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Set `MONGODB_URI` and other required vars
3. **Deploy**: Vercel will automatically build and deploy

### Option 2: Render

1. **Create Service**: New Web Service from your Git repo
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Environment**: Set MongoDB connection string

### Option 3: Heroku

1. **Create App**: `heroku create your-app-name`
2. **Add MongoDB**: `heroku addons:create mongolab`
3. **Deploy**: `git push heroku main`

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
WEBHOOK_VERIFY_TOKEN=your_production_token
```

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build frontend for production
npm run start            # Start production backend
npm run install:all      # Install all dependencies
npm run load-payloads    # Load sample data
```

### Adding New Features

1. **Backend**: Extend controllers and models in `backend/src/`
2. **Frontend**: Add new components in `frontend/src/components/`
3. **Styling**: Update `frontend/src/styles.css`
4. **Real-time**: Use Socket.IO events for live updates

### Testing Webhooks

Use tools like ngrok to test webhooks locally:

```bash
ngrok http 4000
# Use the ngrok URL as your webhook endpoint
```

## 📊 Database Schema

### Message Collection

```javascript
{
  msg_id: String,           // Unique message identifier
  wa_id: String,            // WhatsApp user ID
  name: String,             // Contact name
  number: String,           // Phone number
  direction: String,        // 'inbound' or 'outbound'
  text: String,             // Message content
  timestamp: Date,          // Message timestamp
  status: String,           // 'sent', 'delivered', 'read'
  raw: Object,              // Original webhook payload
  createdAt: Date,          // Document creation time
  updatedAt: Date           // Document update time
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the existing issues
- Create a new issue with detailed information
- Include error logs and reproduction steps

## 🙏 Acknowledgments

- WhatsApp Web design inspiration
- MongoDB Atlas for database hosting
- Vercel for deployment platform
- Socket.IO for real-time functionality

---

**Note**: This is a demonstration project and does not integrate with the actual WhatsApp service. It simulates WhatsApp Web functionality using webhook data and provides a realistic chat experience.
