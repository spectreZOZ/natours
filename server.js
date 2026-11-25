const dns = require('dns');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD),
);

console.log('DATABASE exists:', !!process.env.DATABASE);
console.log('DATABASE_PASSWORD exists:', !!process.env.DATABASE_PASSWORD);
console.log('Placeholder replaced:', !DB.includes('<PASSWORD>'));

try {
  const parsedURI = new URL(DB);

  console.log('MongoDB protocol:', parsedURI.protocol);
  console.log('MongoDB hostname:', parsedURI.hostname);
  console.log('MongoDB username exists:', !!parsedURI.username);
  console.log('MongoDB password exists:', !!parsedURI.password);
} catch (error) {
  console.error('Invalid MongoDB URI:', error.message);
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION! 💥 Shutting down...');
  console.log(err);

  server.close(() => {
    process.exit(1);
  });
});
