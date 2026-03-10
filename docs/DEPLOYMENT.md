# VitaCore AI - Deployment Guide

## Production Checklist

- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB (Atlas recommended)
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Set up file encryption for medical records (optional)
- [ ] Consider Redis for rate limiting at scale

## Deployment Options

### 1. Docker (Recommended)

Create `Dockerfile` for each service:

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

**ML API Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python train_models.py
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend:** Build static files and serve via nginx or CDN:
```bash
cd frontend && npm run build
# Serve dist/ folder
```

### 2. Platform-as-a-Service

- **Backend:** Deploy to Railway, Render, or Heroku
- **ML API:** Deploy to Railway, Render, or Google Cloud Run
- **Frontend:** Vercel, Netlify, or Cloudflare Pages
- **Database:** MongoDB Atlas

### 3. Environment Variables (Production)

**Backend:**
```
PORT=5000
MONGODB_URI=<atlas-uri>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
ML_API_URL=<ml-api-url>
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

**Frontend:** Configure API base URL (e.g. `VITE_API_URL=https://api.yourdomain.com`)

## Security Notes

- Never commit `.env` files
- Use environment variables in CI/CD
- Enable MongoDB authentication
- Consider Vault or AWS Secrets Manager for secrets
- Implement file encryption for sensitive medical data in production
