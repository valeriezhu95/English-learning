/**
 * 用户数据模型
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    openId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    nickname: String,
    avatar: String,
    
    // 订阅信息
    subscribed: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscriptionDate: {
      type: Date,
      default: Date.now,
    },
    
    // 推送时间偏好
    pushTime: {
      morning: {
        type: String,
        default: '09:00', // HH:mm
      },
      evening: {
        type: String,
        default: '18:30',
      },
    },
    
    // 内容偏好
    preferences: {
      readingLevel: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'B1',
      },
      categories: {
        type: [String],
        default: ['news', 'technology', 'science', 'culture'],
      },
      updateFrequency: {
        type: String,
        enum: ['daily', 'alternate-days', 'weekly'],
        default: 'daily',
      },
      includeAudio: {
        type: Boolean,
        default: true,
      },
      audioSpeed: {
        type: Number,
        enum: [0.75, 1.0, 1.25, 1.5],
        default: 1.0,
      },
    },
    
    // 学习统计
    statistics: {
      articlesReceived: {
        type: Number,
        default: 0,
      },
      articlesOpened: {
        type: Number,
        default: 0,
      },
      audioPlayed: {
        type: Number,
        default: 0,
      },
      totalReadingTime: {
        type: Number,
        default: 0, // 分钟
      },
      totalAudioTime: {
        type: Number,
        default: 0, // 分钟
      },
      lastActivityDate: Date,
      streakDays: {
        type: Number,
        default: 0,
      },
    },
    
    // 时区
    timezone: {
      type: String,
      default: 'Asia/Shanghai',
      index: true,
    },
    
    // 是否推送
    isNotified: {
      type: Boolean,
      default: true,
    },
    
    // 错误追踪
    lastPushError: String,
    pushErrorCount: {
      type: Number,
      default: 0,
    },
    
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
    collection: 'users',
  }
);

userSchema.index({ subscribed: 1, createdAt: -1 });
userSchema.index({ timezone: 1, subscribed: 1 });

module.exports = mongoose.model('User', userSchema);
