/**
 * 文章数据模型
 */
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['bbc', 'medium', 'wikipedia', 'reuters', 'guardian', 'manual'],
      required: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    author: String,
    publishedAt: Date,
    
    // 内容质量指标
    wordCount: {
      type: Number,
      required: true,
      index: true,
    },
    sentenceCount: Number,
    readingLevel: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      default: 'B1',
      index: true,
    },
    
    // 复杂度分析
    complexityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    averageWordLength: Number,
    uniqueWordRatio: Number,
    
    // 音频信息
    audioUrl: String,
    audioDuration: Number, // 秒
    audioLanguage: {
      type: String,
      default: 'en-GB', // 英式英语
    },
    audioGenerated: {
      type: Boolean,
      default: false,
    },
    
    // 推送信息
    pushed: {
      type: Boolean,
      default: false,
      index: true,
    },
    pushedAt: Date,
    pushHistory: [{
      userId: String,
      pushedAt: Date,
      opened: Boolean,
      engagement: {
        read: Boolean,
        audioPlayed: Boolean,
        likeCount: Number,
      }
    }],
    
    // 质量评分
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    
    // 标签和分类
    category: {
      type: String,
      enum: [
        'news',
        'technology',
        'business',
        'science',
        'culture',
        'lifestyle',
        'education',
        'health',
        'environment',
        'other'
      ],
      index: true,
    },
    tags: [String],
    keywords: [String],
    
    // 系统字段
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'articles',
  }
);

// 索引优化
articleSchema.index({ createdAt: -1, pushed: 1 });
articleSchema.index({ wordCount: 1, readingLevel: 1 });
articleSchema.index({ qualityScore: -1, pushed: 0 });

module.exports = mongoose.model('Article', articleSchema);
