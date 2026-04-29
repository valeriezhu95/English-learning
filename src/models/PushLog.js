/**
 * 推送日志数据模型
 */
const mongoose = require('mongoose');

const pushLogSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pushType: {
      type: String,
      enum: ['morning', 'evening'],
      required: true,
      index: true,
    },
    
    // 推送状态
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'bounced'],
      default: 'pending',
      index: true,
    },
    errorMessage: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    
    // 用户交互
    opened: {
      type: Boolean,
      default: false,
      index: true,
    },
    openedAt: Date,
    
    engagement: {
      audioPlayed: {
        type: Boolean,
        default: false,
      },
      audioPlayedAt: Date,
      audioPlayDuration: Number, // 秒
      liked: {
        type: Boolean,
        default: false,
      },
      likedAt: Date,
      shared: {
        type: Boolean,
        default: false,
      },
      sharedAt: Date,
      noted: {
        type: Boolean,
        default: false,
      },
      notedAt: Date,
    },
    
    // 阅读统计
    readingMetrics: {
      readingTime: Number, // 秒
      scrollDepth: Number, // 百分比
      wordCount: Number,
    },
    
    // 时间戳
    pushedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'push_logs',
  }
);

pushLogSchema.index({ userId: 1, pushedAt: -1 });
pushLogSchema.index({ articleId: 1, userId: 1 });
pushLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('PushLog', pushLogSchema);
