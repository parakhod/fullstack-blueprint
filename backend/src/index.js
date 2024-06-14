const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const cors = require('cors');

const mongoose = require('mongoose');

const router = express.Router();

const port = 4005;

router.use(function (req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', (req, res) => {
    res.send('I am the server!');
});

router.get('/health', (req, res) => {
    res.json({ alive: true });
});

// Silly code comes here

const TestDataSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    index: { unique: true, dropDups: true }
  },
  value: {
    type: String,
  },
  timestamp: { type: Date, default: Date.now },
});

const TestDataModel = mongoose.model("MyTestData", TestDataSchema);

router.get('/test_api', async (req, res) => {
  console.log('Received', req.query)
  const data = await TestDataModel.findOne({ key: req.query.key})
  res.json(data);
});

router.put('/test_api', async (req, res) => {
  console.log('Received', req.body)
  const data = await TestDataModel.updateOne({ key: req.body.key}, req.body)
  res.json(data);
});

router.post('/test_api', async (req, res) => {
    console.log('Received', req.body)
    const data = new TestDataModel(req.body);
    try {
      await data.save();
      res.json(data);
    } catch (error) {
      res.status(500).send(error);
    }
});

// End of silly code

app.use(cors());
app.use(bodyParser.json())

app.use('/', router);

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})

mongoose.connect('mongodb://mongo:27017')
  .then(() => console.log('MongoDB connected'))
  .catch((e) => console.error('Unable connect to db', e))
