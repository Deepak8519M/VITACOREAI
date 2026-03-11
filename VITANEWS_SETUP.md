# VitaNews Setup Guide

## Overview

VitaNews is a comprehensive healthcare intelligence and medical news platform that integrates with the APITube API to provide real-time healthcare news monitoring and analysis.

## Features

- **Global Healthcare News Feed** - Latest healthcare news with filtering and categorization
- **Article Detail Pages** - Full metadata including sentiment, entities, locations, and readability metrics
- **Healthcare Topic Intelligence** - Explore news by healthcare topics and categories
- **Entity Intelligence System** - Track organizations, people, and locations mentioned in news
- **Global Health Map** - Interactive world map showing healthcare news by location
- **Sentiment Monitoring** - Analyze sentiment trends in healthcare news
- **Healthcare Analytics Dashboard** - Comprehensive insights and trending topics
- **Personalized News Feed** - Custom news based on user interests

## API Configuration

### 1. Get APITube API Key

1. Visit [APITube.io](https://apitube.io/)
2. Sign up for an account
3. Navigate to your dashboard to get your API key
4. Copy the API key for configuration

### 2. Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your APITube API key:
   ```
   APITUBE_API_KEY=your_actual_apitube_api_key_here
   ```

### 3. Start the Backend Server

```bash
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

VitaNews adds the following API endpoints to the VitaCore backend:

### News Endpoints

- `GET /api/vitanews/latest` - Get latest healthcare news
- `GET /api/vitanews/article/:id` - Get specific article by ID
- `GET /api/vitanews/topic/:topic` - Get news by topic
- `GET /api/vitanews/entity/:entity` - Get news by entity
- `GET /api/vitanews/location/:location` - Get news by location

### Analytics Endpoints

- `GET /api/vitanews/sentiment` - Get sentiment analysis data
- `GET /api/vitanews/analytics` - Get comprehensive analytics
- `GET /api/vitanews/trending` - Get trending topics and stories
- `GET /api/vitanews/categories` - Get available categories

## Frontend Routes

VitaNews adds the following routes to the frontend:

### Main Routes

- `/app/vitanews` - Main news feed with category filtering
- `/app/vitanews/article/:id` - Article detail page
- `/app/vitanews/topics` - Healthcare topic intelligence
- `/app/vitanews/entities` - Entity intelligence system
- `/app/vitanews/map` - Global health map
- `/app/vitanews/sentiment` - Sentiment monitoring dashboard
- `/app/vitanews/analytics` - Healthcare analytics dashboard
- `/app/vitanews/personalized` - Personalized news feed

## Data Structure

VitaNews uses the full APITube API response including:

### Core Fields
- `id`, `title`, `description`, `body`, `body_html`
- `published_at`, `author`, `image`, `language`

### Metadata Fields
- `categories`, `industries`, `entities`, `locations_mentioned`
- `sentiment`, `summary`, `keywords`, `links`
- `media`, `readability`, `story`, `shares`
- `read_time`, `sentences_count`, `words_count`

## Healthcare Categories

VitaNews monitors these healthcare categories:

- **Pharmaceutical Industry News** - Drug development, FDA approvals
- **Pandemic Health Updates** - COVID-19, outbreaks, epidemics
- **Medical Research Breakthroughs** - Clinical trials, studies
- **Mental Health Coverage** - Psychology, therapy, wellness
- **Biotech Innovation** - Genetics, medical technology

## Personalization Features

Users can:
- Select healthcare interests (pandemics, mental health, pharmaceutical, research, biotechnology)
- Save articles for later reading
- Get personalized news feeds based on interests
- View trending topics and stories

## Analytics Features

- Real-time sentiment analysis (positive, neutral, negative)
- Top mentioned entities, industries, categories, and locations
- Trending healthcare topics and stories
- Article readability and engagement metrics

## Error Handling

The system includes comprehensive error handling for:
- API key configuration issues
- Network connectivity problems
- Invalid article IDs
- Empty search results

## Performance Considerations

- Articles are cached to reduce API calls
- Pagination is implemented for large result sets
- Images are lazy-loaded to improve performance
- Search debouncing to reduce unnecessary API calls

## Security

- API key is stored securely in environment variables
- All API requests are made server-side
- Input validation and sanitization
- Rate limiting to prevent abuse

## Troubleshooting

### Common Issues

1. **"Failed to fetch news" error**
   - Check your APITube API key configuration
   - Ensure the backend server is running
   - Verify network connectivity

2. **No articles displayed**
   - Check if the API key has sufficient credits
   - Try different search terms or categories
   - Check browser console for errors

3. **Slow loading times**
   - The initial load may take time due to API processing
   - Subsequent loads should be faster with caching

### Debug Mode

Enable debug mode by setting `NODE_ENV=development` in your `.env` file to see detailed error messages and API response logs.

## Support

For issues related to:
- **APITube API**: Contact APITube support
- **VitaNews functionality**: Check the VitaCore documentation
- **Setup issues**: Review this guide and ensure all steps are followed correctly
