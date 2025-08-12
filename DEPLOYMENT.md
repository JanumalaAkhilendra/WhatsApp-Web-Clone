# 🚀 Deployment Guide

This guide covers deploying the WhatsApp Web Clone to various platforms.

## 🌐 **Current Deployment**

- **Frontend (Vercel)**: https://whats-app-web-clone-hazel.vercel.app
- **Backend (Railway)**: https://whatsapp-web-12.up.railway.app
- **API Health Check**: https://whatsapp-web-12.up.railway.app/test

## 📋 **Prerequisites**

- Node.js 18+
- MongoDB Atlas account
- GitHub repository
- Vercel account (for frontend)
- Railway account (for backend)

## 🎯 Vercel Deployment (Recommended)

Vercel provides the easiest deployment experience with automatic builds and serverless functions.

### 1. Prepare Your Repository

Ensure your repository has:
- ✅ `vercel.json` configuration
- ✅ Root `package.json` with build scripts
- ✅ Proper environment variables

### 2. Connect to Vercel

1. **Sign up/Login**: Go to [vercel.com](https://vercel.com)
2. **Import Project**: Click "New Project"
3. **Connect Git**: Select your GitHub repository
4. **Configure Project**: Vercel will auto-detect settings

### 3. Environment Variables

Set these in your Vercel project settings:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.vercel.app
WEBHOOK_VERIFY_TOKEN=your_production_token
```

### 4. Deploy

Click "Deploy" and Vercel will:
- Build your frontend
- Deploy backend as serverless functions
- Provide a live URL

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## 🌐 Render Deployment

Render is great for full-stack applications with persistent backend.

### 1. Create Render Account

Sign up at [render.com](https://render.com)

### 2. New Web Service

1. **Connect Repository**: Link your GitHub repo
2. **Service Type**: Select "Web Service"
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Environment**: Node.js 18+

### 3. Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
NODE_ENV=production
CORS_ORIGIN=https://your-app.onrender.com
WEBHOOK_VERIFY_TOKEN=your_production_token
```

### 4. Deploy

Render will automatically deploy and provide a URL.

---

## 🐳 Docker Deployment

For containerized deployment on any platform.

### 1. Create Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY package*.json ./

RUN npm ci --only=production

EXPOSE 4000
CMD ["npm", "start"]
```

### 2. Build and Run

```bash
# Build image
docker build -t whatsapp-clone .

# Run container
docker run -p 4000:4000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/whatsapp \
  -e NODE_ENV=production \
  whatsapp-clone
```

### 3. Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/whatsapp
      - NODE_ENV=production
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## ☁️ MongoDB Atlas Setup

### 1. Create Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose free tier or paid plan
3. **Cloud Provider**: AWS, Google Cloud, or Azure
4. **Region**: Choose closest to your deployment

### 2. Database Access

1. **Security** → **Database Access**
2. **Add New Database User**
3. **Username/Password**: Create secure credentials
4. **Database User Privileges**: Read and write to any database

### 3. Network Access

1. **Security** → **Network Access**
2. **Add IP Address**
3. **Allow Access from Anywhere**: `0.0.0.0/0` (for production)
4. **Or specific IPs** for development

### 4. Connection String

```
mongodb+srv://username:password@cluster.mongodb.net/whatsapp?retryWrites=true&w=majority
```

Replace:
- `username`: Your database username
- `password`: Your database password
- `cluster`: Your cluster name

---

## 🔧 Environment Configuration

### Development (.env)

```env
MONGODB_URI=mongodb://localhost:27017/whatsapp
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
WEBHOOK_VERIFY_TOKEN=dev_token_123
```

### Production

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
WEBHOOK_VERIFY_TOKEN=secure_production_token_here
```

---

## 🧪 Testing Deployment

### 1. Health Check

```bash
curl https://your-app.vercel.app/
# Should return: {"ok": true}
```

### 2. Webhook Test

```bash
curl -X POST https://your-app.vercel.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### 3. Frontend Test

Visit your deployed URL and verify:
- ✅ Chat interface loads
- ✅ No console errors
- ✅ Responsive design works
- ✅ Real-time updates function

---

## 🚨 Common Issues

### Build Failures

**Problem**: Frontend build fails
**Solution**: Check Node.js version compatibility

```bash
# Ensure you're using Node 16+
node --version
```

### Database Connection

**Problem**: Can't connect to MongoDB
**Solution**: Verify connection string and network access

```bash
# Test connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/whatsapp"
```

### CORS Errors

**Problem**: Frontend can't reach backend
**Solution**: Update CORS_ORIGIN in environment variables

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

### Webhook Timeouts

**Problem**: Webhook requests timeout
**Solution**: Check serverless function timeout limits

- **Vercel**: 10 seconds (free), 60 seconds (pro)
- **Render**: 30 seconds
- **Heroku**: 30 seconds

---

## 📊 Monitoring

### 1. Vercel Analytics

- **Performance**: Page load times
- **Errors**: JavaScript errors
- **Usage**: Bandwidth and function calls

### 2. MongoDB Atlas

- **Performance**: Query performance
- **Storage**: Database size
- **Connections**: Active connections

### 3. Application Logs

```bash
# Vercel
vercel logs

# Render
# Available in dashboard

# Heroku
heroku logs --tail
```

---

## 🔄 Continuous Deployment

### GitHub Actions

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Auto-deploy

Most platforms support automatic deployment:
- **Vercel**: Auto-deploys on push to main branch
- **Render**: Auto-deploys on push to main branch
- **Heroku**: Auto-deploys on push to main branch

---

## 🎉 Success!

Your WhatsApp Web clone is now deployed and accessible worldwide! 

**Next Steps:**
1. Test all functionality
2. Set up monitoring
3. Configure custom domain
4. Share your live demo

**Remember**: Keep your environment variables secure and never commit them to version control! 