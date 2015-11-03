var localConfig;
try {
	localConfig = require('./config_local');	
} catch(err) {
	localConfig = false;
}

module.exports = {
  SUPER_USER_API_KEY: process.env.API_KEY || localConfig.SUPER_USER_API_KEY,
  MONGO_URI: process.env.MONGOLAB_URI || localConfig.MONGO_URI,
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || localConfig.FACEBOOK_SECRET,
  TWITTER_KEY: process.env.TWITTER_KEY || localConfig.TWITTER_KEY,
  TWITTER_SECRET: process.env.TWITTER_SECRET || localConfig.TWITTER_SECRET,
  TWITTER_CALLBACK: process.env.TWITTER_CALLBACK || localConfig.TWITTER_CALLBACK,
  tokenSecret: process.env.tokenSecret || localConfig.tokenSecret
};