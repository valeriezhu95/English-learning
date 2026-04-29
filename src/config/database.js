/**
 * 数据库配置和连接
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('✅ MongoDB 连接成功');
    return mongoose.connection;
  } catch (error) {
    logger.error('❌ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('✅ MongoDB 连接已关闭');
  } catch (error) {
    logger.error('❌ MongoDB 关闭失败:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
