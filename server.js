const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log({ err });
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});

const app = require('./app');

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to DB'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log({ err });
  server.close(() => {
    process.exit(1);
  });
});
