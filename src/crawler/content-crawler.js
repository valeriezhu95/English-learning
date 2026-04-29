/**
 * 内容爬虫 - 自动爬取英文文章
 */
const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');
const logger = require('../utils/logger');
const { analyzeText } = require('../utils/text-analyzer');

class ContentCrawler {
  constructor() {
    this.sources = {
      bbc: {
        url: 'https://www.bbc.com/news',
        selector: 'article',
        titleSelector: 'h2',
        contentSelector: 'p',
      },
      medium: {
        url: 'https://medium.com/search?q=english',
        selector: 'article',
        titleSelector: 'h2',
        contentSelector: 'p',
      },
      wikipedia: {
        url: 'https://en.wikipedia.org/wiki/Special:Random',
        selector: 'div#mw-content-text',
        titleSelector: 'h1',
        contentSelector: 'p',
      },
    };
    
    this.config = {
      minWords: parseInt(process.env.CONTENT_MIN_WORDS) || 300,
      maxWords: parseInt(process.env.CONTENT_MAX_WORDS) || 500,
      minGrade: process.env.CONTENT_MIN_GRADE || 'B1',
      timeout: 10000,
      retries: 3,
    };
  }

  /**
   * 爬取BBC新闻
   */
  async crawlBBC() {
    try {
      logger.info('🔄 开始爬取BBC新闻...');
      const response = await axios.get(this.sources.bbc.url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      $('article').slice(0, 10).each((index, element) => {
        const titleEl = $(element).find('h2, h3').first();
        const title = titleEl.text().trim();
        
        const link = $(element).find('a').attr('href');
        const fullUrl = link?.startsWith('http') ? link : `https://www.bbc.com${link}`;

        if (title && link) {
          articles.push({
            title,
            sourceUrl: fullUrl,
            source: 'bbc',
          });
        }
      });

      logger.info(`✅ BBC爬取完成，获得 ${articles.length} 篇文章链接`);
      return articles;
    } catch (error) {
      logger.error('❌ BBC爬虫错误:', error.message);
      return [];
    }
  }

  /**
   * 爬取Medium文章
   */
  async crawlMedium() {
    try {
      logger.info('🔄 开始爬取Medium文章...');
      // Medium 有反爬虫机制，这里提供基础框架
      // 实际使用时可以考虑使用 Medium RSS feed
      const rssUrl = 'https://medium.com/feed/tag/english';
      
      const response = await axios.get(rssUrl, {
        timeout: this.config.timeout,
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      $('item').slice(0, 10).each((index, element) => {
        const title = $(element).find('title').text();
        const link = $(element).find('link').text();
        const description = $(element).find('description').text();

        if (title && link) {
          articles.push({
            title,
            sourceUrl: link,
            source: 'medium',
            summary: description?.substring(0, 200) || '',
          });
        }
      });

      logger.info(`✅ Medium爬取完成，获得 ${articles.length} 篇文章`);
      return articles;
    } catch (error) {
      logger.error('❌ Medium爬虫错误:', error.message);
      return [];
    }
  }

  /**
   * 获取完整文章内容
   */
  async fetchArticleContent(sourceUrl) {
    try {
      const response = await axios.get(sourceUrl, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // 提取主要内容（需要根据具体网站调整选择器）
      let content = '';
      
      // BBC 内容
      if (sourceUrl.includes('bbc.com')) {
        content = $('[data-testid="internal-embed-content"]').text() || 
                  $('article').text() ||
                  $('main').text();
      } 
      // Medium 内容
      else if (sourceUrl.includes('medium.com')) {
        content = $('article').text() || $('main').text();
      }
      // 其他网站
      else {
        content = $('article').text() || $('main').text() || $('body').text();
      }

      return this._cleanContent(content);
    } catch (error) {
      logger.error(`获取文章内容失败 [${sourceUrl}]:`, error.message);
      return null;
    }
  }

  /**
   * 清理和规范化内容
   */
  _cleanContent(content) {
    return content
      .replace(/[\n\r\t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n')
      .trim();
  }

  /**
   * 验证文章是否符合标准
   */
  async validateArticle(article) {
    const analysis = await analyzeText(article.content);

    // 字数检查
    if (analysis.wordCount < this.config.minWords || 
        analysis.wordCount > this.config.maxWords) {
      logger.debug(`文章被拒: 字数 ${analysis.wordCount} 超出范围`);
      return false;
    }

    // 难度等级检查
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const minLevelIndex = levels.indexOf(this.config.minGrade);
    const articleLevelIndex = levels.indexOf(analysis.readingLevel);

    if (articleLevelIndex < minLevelIndex) {
      logger.debug(`文章被拒: 难度等级 ${analysis.readingLevel} 过低`);
      return false;
    }

    article.wordCount = analysis.wordCount;
    article.readingLevel = analysis.readingLevel;
    article.complexityScore = analysis.complexityScore;
    article.sentenceCount = analysis.sentenceCount;
    article.averageWordLength = analysis.averageWordLength;
    article.uniqueWordRatio = analysis.uniqueWordRatio;

    return true;
  }

  /**
   * 检查文章是否已存在
   */
  async articleExists(sourceUrl) {
    const existing = await Article.findOne({ sourceUrl });
    return !!existing;
  }

  /**
   * 保存文章到数据库
   */
  async saveArticle(articleData) {
    try {
      const article = new Article({
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary || articleData.content.substring(0, 200),
        source: articleData.source,
        sourceUrl: articleData.sourceUrl,
        author: articleData.author,
        publishedAt: articleData.publishedAt,
        wordCount: articleData.wordCount,
        readingLevel: articleData.readingLevel,
        complexityScore: articleData.complexityScore,
        sentenceCount: articleData.sentenceCount,
        averageWordLength: articleData.averageWordLength,
        uniqueWordRatio: articleData.uniqueWordRatio,
        category: articleData.category,
        qualityScore: articleData.qualityScore,
      });

      await article.save();
      logger.info(`✅ 文章已保存: ${article.title}`);
      return article;
    } catch (error) {
      logger.error('❌ 保存文章失败:', error.message);
      throw error;
    }
  }

  /**
   * 执行完整的爬虫流程
   */
  async run() {
    try {
      logger.info('🚀 启动内容爬虫...');

      // 爬取多个来源
      const bbcArticles = await this.crawlBBC();
      const mediumArticles = await this.crawlMedium();
      
      const allArticles = [...bbcArticles, ...mediumArticles];
      const savedArticles = [];

      for (const article of allArticles) {
        // 检查是否已存在
        if (await this.articleExists(article.sourceUrl)) {
          logger.debug(`文章已存在: ${article.title}`);
          continue;
        }

        // 获取完整内容
        const content = await this.fetchArticleContent(article.sourceUrl);
        if (!content) {
          logger.warn(`无法获取内容: ${article.title}`);
          continue;
        }

        article.content = content;

        // 验证文章
        if (!(await this.validateArticle(article))) {
          logger.debug(`文章验证失败: ${article.title}`);
          continue;
        }

        // 分配类别（简单的关键词匹配）
        article.category = this._categorizeArticle(article.title, article.content);

        // 计算质量分数
        article.qualityScore = this._calculateQualityScore(article);

        // 保存文章
        try {
          const saved = await this.saveArticle(article);
          savedArticles.push(saved);
        } catch (error) {
          logger.error(`保存文章失败 [${article.title}]:`, error.message);
        }
      }

      logger.info(`✅ 爬虫完成! 成功获得 ${savedArticles.length} 篇文章`);
      return savedArticles;
    } catch (error) {
      logger.error('❌ 爬虫执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 文章分类
   */
  _categorizeArticle(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    
    const categories = {
      technology: ['tech', 'ai', 'computer', 'software', 'digital', 'cyber'],
      business: ['business', 'market', 'economy', 'trade', 'company', 'corporate'],
      science: ['science', 'research', 'study', 'scientist', 'experiment'],
      health: ['health', 'medical', 'disease', 'doctor', 'hospital'],
      environment: ['environment', 'climate', 'green', 'energy', 'nature'],
      culture: ['culture', 'art', 'music', 'film', 'literature'],
      news: ['news', 'event', 'breaking', 'latest'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * 计算文章质量分数 (0-100)
   */
  _calculateQualityScore(article) {
    let score = 50; // 基础分

    // 字数 (最优: 350-450)
    const optimalWords = 400;
    const wordDiff = Math.abs(article.wordCount - optimalWords);
    score += Math.max(0, 20 - (wordDiff / 20));

    // 难度等级 (B1-B2 最优)
    if (['B1', 'B2'].includes(article.readingLevel)) {
      score += 15;
    } else if (['A2', 'C1'].includes(article.readingLevel)) {
      score += 10;
    }

    // 复杂度分数
    if (article.complexityScore >= 40 && article.complexityScore <= 60) {
      score += 15;
    }

    // 唯一词汇率 (50-70% 为最优)
    if (article.uniqueWordRatio >= 0.5 && article.uniqueWordRatio <= 0.7) {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }
}

// 如果直接运行此文件
if (require.main === module) {
  require('dotenv').config();
  const { connectDB } = require('../config/database');

  (async () => {
    await connectDB();
    const crawler = new ContentCrawler();
    await crawler.run();
    process.exit(0);
  })().catch(error => {
    logger.error('爬虫错误:', error);
    process.exit(1);
  });
}

module.exports = ContentCrawler;
