module.exports = {
  SUPER_USER_API_KEY: process.env.API_KEY || 'Pa$$w0rd',
  MONGO_URI: process.env.MONGOLAB_URI || 'mongodb://localhost/tasks',
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || '36dbcc90d1b67e6cf33b7b9e8597c520',
  TWITTER_KEY: process.env.TWITTER_KEY || '15klJNAfjHmJfzJsEtS9Tbd5j',
  TWITTER_SECRET: process.env.TWITTER_SECRET || '0tZI3dSgYxfdvTzbhUdNkZGFI201pcWRIrm8VTalnKsmhkXE1M',
  TWITTER_CALLBACK: process.env.TWITTER_CALLBACK || 'http://localhost:3000',
  tokenSecret: process.env.tokenSecret || 'I love managing tasks, feed me more!'
};