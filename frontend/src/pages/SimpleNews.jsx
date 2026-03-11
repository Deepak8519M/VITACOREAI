import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function SimpleNews() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('health')
  const [articleCount, setArticleCount] = useState(100)
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchHealthNews()
  }, [])

  const fetchHealthNews = async () => {
    try {
      setLoading(true)
      console.log('🔥 HEALTHCARE NEWS: Fetching from APITube directly...')
      
      // Direct APITube API call from frontend
      const response = await axios.get('https://api.apitube.io/v1/news/everything', {
        params: {
          api_key: 'api_live_85xSLnWEwwy2C6zobxjsh4UNFeeSYmcAuqMx6FYDA2yiXiEuTZEfMaUb',
          title: searchTerm || 'health',
          per_page: articleCount,
          page: currentPage,
          language: 'en'
        }
      })
      
      console.log('🔥 SIMPLE NEWS: Got response:', response.data)
      console.log('🔥 SIMPLE NEWS: Response type:', typeof response.data)
      console.log('🔥 SIMPLE NEWS: Is array?', Array.isArray(response.data))
      
      // Handle different response structures
      let articles = []
      if (Array.isArray(response.data)) {
        articles = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        articles = response.data.data
      } else if (response.data.results && Array.isArray(response.data.results)) {
        articles = response.data.results
      }
      
      console.log('🔥 HEALTHCARE NEWS: Total articles found:', articles.length)
      
      // Calculate total pages (assuming we can get more articles)
      const calculatedTotalPages = Math.ceil(articles.length / articleCount)
      setTotalPages(calculatedTotalPages > 1 ? calculatedTotalPages : 1)
      
      setArticles(articles)
      setError(null)
    } catch (err) {
      console.error('🔥 HEALTHCARE NEWS: Error:', err)
      setError('Failed to fetch news. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sentimentFilter, dateFilter, articleCount])

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchHealthNews()
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    setSearchTerm(searchQuery || 'health')
    fetchHealthNews()
  }

  // Filter articles based on user selections
  const filteredArticles = articles.filter(article => {
    // Sentiment filter
    if (sentimentFilter !== 'all') {
      const articleSentiment = article.sentiment?.label?.toLowerCase()
      if (articleSentiment !== sentimentFilter) return false
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const articleDate = new Date(article.published_at)
      const now = new Date()
      const daysDiff = (now - articleDate) / (1000 * 60 * 60 * 24)
      
      if (dateFilter === 'today' && daysDiff > 1) return false
      if (dateFilter === 'week' && daysDiff > 7) return false
      if (dateFilter === 'month' && daysDiff > 30) return false
    }
    
    return true
  })

  // Get unique categories from articles
  const categories = [...new Set(articles.flatMap(article => 
    article.categories?.map(cat => cat.name || cat) || []
  ))].slice(0, 10)

  // Get sentiment statistics
  const sentimentStats = articles.reduce((acc, article) => {
    const sentiment = article.sentiment?.label || 'neutral'
    acc[sentiment] = (acc[sentiment] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Healthcare News Intelligence</h1>
          <div className="text-center py-12">
            <div className="text-xl mb-2">Loading {articleCount} healthcare articles...</div>
            <div className="text-slate-400">
              Searching for: "{searchTerm || searchQuery || 'health'}" 
              {currentPage > 1 && <span className="ml-2">• Page {currentPage}</span>}
            </div>
            <div className="animate-pulse mt-4">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Simple Healthcare News</h1>
          <div className="text-center py-12">
            <div className="text-xl text-red-400">{error}</div>
            <button 
              onClick={fetchHealthNews}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
            <span className="text-2xl">📰</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Healthcare News Intelligence</h1>
            <p className="text-slate-400">Real-time healthcare news & analytics</p>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{articles.length}</div>
            <div className="text-sm text-slate-400">Total Articles</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{sentimentStats.positive || 0}</div>
            <div className="text-sm text-slate-400">Positive News</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{sentimentStats.negative || 0}</div>
            <div className="text-sm text-slate-400">Negative News</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{categories.length}</div>
            <div className="text-sm text-slate-400">Categories</div>
          </div>
        </div>

        <div className="mb-6">
          {/* Notice about links */}
          <div className="mb-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>📰 All Articles:</strong> Showing all healthcare articles. Some may require subscription for full access.
            </p>
          </div>
          
          <p className="text-slate-400 text-sm mb-4">
            Found {articles.length} healthcare articles from APITube
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="mb-6">
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search healthcare topics, diseases, treatments, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-lg"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🔍
                  </button>
                </div>
              </div>
            </div>
            
            {/* Search Suggestions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-slate-400 text-sm">Popular searches:</span>
              {['COVID-19', 'cancer research', 'mental health', 'heart disease', 'diabetes', 'vaccines', 'AI in medicine', 'healthcare policy', 'pharmaceutical', 'medical breakthrough'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term)
                    handleSearch()
                  }}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:border-blue-500 hover:text-blue-400"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
            
            {/* Enhanced Filtering Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Sentiment</option>
              <option value="positive">Positive Only</option>
              <option value="negative">Negative Only</option>
              <option value="neutral">Neutral Only</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today Only</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
            
            <select
              value={articleCount}
              onChange={(e) => setArticleCount(Number(e.target.value))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value={25}>25 Articles</option>
              <option value={50}>50 Articles</option>
              <option value={100}>100 Articles</option>
              <option value={200}>200 Articles</option>
              <option value={500}>500 Articles</option>
            </select>
            
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-400">
              Showing {filteredArticles.length} of {articles.length} articles
              {totalPages > 1 && (
                <span className="ml-2">• Page {currentPage} of {totalPages}</span>
              )}
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                const isCurrentPage = pageNum === currentPage
                const showPage = pageNum <= 3 || pageNum >= totalPages - 2 || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                
                if (!showPage) return null
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      isCurrentPage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
          
          {/* Quick Search Options */}
          <div className="flex flex-wrap gap-2">
            <span className="text-slate-400 text-sm">Quick search:</span>
            {['health', 'medical', 'covid', 'medicine', 'hospital', 'pharmaceutical', 'mental health', 'research'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term)
                  fetchHealthNews()
                }}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:border-blue-500 hover:text-blue-400"
              >
                {term}
              </button>
            ))}
          </div>
          
          {/* Category Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-slate-400 text-sm">Categories:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSearchTerm(category)
                    fetchHealthNews()
                  }}
                  className="px-3 py-1 bg-purple-600/20 border border-purple-600/30 rounded text-xs text-purple-400 hover:bg-purple-600/30"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-slate-400">No articles match your filters</div>
            <div className="text-sm text-slate-500 mt-2">
              Try adjusting your search or filters
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <div 
                key={article.id || index}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-600/50 transition-all duration-300"
              >
                {/* Article Image */}
                {article.image && article.image.includes('http') && !article.image.includes('[Upgrade') ? (
                  <div className="aspect-video overflow-hidden bg-slate-800">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video overflow-hidden bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-600 text-4xl">🏥</span>
                  </div>
                )}

                <div className="p-5">
                  {/* Article Title */}
                  <h3 className="text-white font-semibold line-clamp-2 mb-2">
                    {article.title}
                  </h3>

                  {/* Article Description */}
                  <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                    {article.description && !article.description.includes('[Upgrade subscription plan]') 
                      ? article.description.substring(0, 200) + '...'
                      : article.body && !article.body.includes('[Upgrade subscription plan]') && article.body.length > 50
                      ? article.body.substring(0, 200) + '...'
                      : 'Healthcare news article - Full content requires subscription'
                    }
                  </p>

                  {/* Article Metadata */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    {article.published_at && (
                      <span>
                        📅 {new Date(article.published_at).toLocaleDateString()}
                      </span>
                    )}
                    {article.read_time && (
                      <span>
                        ⏱️ {article.read_time} min read
                      </span>
                    )}
                  </div>

                  {/* Sentiment */}
                  {article.sentiment && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Sentiment:</span>
                      <span className={`px-2 py-1 rounded ${
                        article.sentiment.label === 'positive' ? 'bg-green-600/20 text-green-400' :
                        article.sentiment.label === 'negative' ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {article.sentiment.label || 'neutral'}
                      </span>
                    </div>
                  )}

                  {/* Additional Info */}
                  {article.source && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>📰</span>
                      <span>{article.source.name || 'News Source'}</span>
                    </div>
                  )}

                  {article.categories && article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.categories.slice(0, 3).map((category, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                          {category.name || category}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More Link */}
                  {article.href ? (
                    <div className="mt-3">
                      {article.href.includes('[Upgrade subscription plan]') || !article.href.includes('http') ? (
                        <div className="text-xs text-slate-500">
                          <span className="text-orange-400">🔒 Subscription required for full article</span>
                          <div className="mt-1">
                            <span className="text-slate-400">Article ID: {article.id}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <a 
                            href={article.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 text-sm hover:text-blue-300"
                          >
                            Read Full Article →
                          </a>
                          <span className="text-xs text-slate-500 ml-2">(opens in new tab)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-3">
                      Full article not available
                    </div>
                  )}

                  {/* Article Info */}
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="text-xs text-slate-500">
                      <div className="mb-1">
                        <strong>Article ID:</strong> {article.id}
                      </div>
                      {article.language && (
                        <div className="mb-1">
                          <strong>Language:</strong> {article.language}
                        </div>
                      )}
                      {article.is_free !== undefined && (
                        <div className="mb-1">
                          <strong>Free Access:</strong> {article.is_free ? '✅ Yes' : '🔒 No'}
                        </div>
                      )}
                      {article.is_breaking && (
                        <div className="mb-1 text-red-400">
                          <strong>🚨 Breaking News</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
