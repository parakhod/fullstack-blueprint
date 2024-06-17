const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs')
const multer  = require('multer')
const cors = require('cors');
var proxy = require('express-http-proxy');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const axios = require('axios');

const upload = multer()
const app = express();
const router = express.Router();

const port = process.env.PORT ?? 4005;

const OPENAI_TOKEN = process.env.OPENAI_TOKEN

const AUDIO_DIR = process.env.AUDIO_DIR ?? '/audio';

if (!fs.existsSync(AUDIO_DIR)){
    fs.mkdirSync(AUDIO_DIR);
}

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


router.post('/summary', async (req, res) => {
  console.log('Received', req.body)
  try {

  const result = await axios.post('https://api.openai.com/v1/chat/completions', {
         "model": "gpt-3.5-turbo",
            "messages": [{
              "role": "user", 
              "content": `Below is transcript from a video. Your task is to write a summary of the transcript in 10 words.\n${req.body.text}`}],
              "temperature": 0.7
            }, { 
                  headers: {
                  Authorization: `Bearer ${OPENAI_TOKEN}`,
              }
      })


      console.log('result', result.data)

      const choices = result.data.choices ?? []

      const [ choice ] = choices

      const summary = choice.message.content

      console.log('result', {summary})

      const speechSummary = await axios.post('https://api.openai.com/v1/audio/speech', {
         "model": "tts-1",
         "input": summary,
         "voice": "alloy"
            }, { 

              responseType: 'stream',
              headers: {
                  Authorization: `Bearer ${OPENAI_TOKEN}`,
              }
      })

      const audioFileName = `${uuidv4()}.mp3`

      const writer = fs.createWriteStream(`${AUDIO_DIR}/${audioFileName}`);

      speechSummary.data.pipe(writer);


      writer.on('finish', (v) => {
        console.log('done')
        res.json({summary, audio: audioFileName});

      })
    } catch (err) {
      console.error(err)

      res.status(500).send(err);

    }
});


router.post('/transcribe-audio', upload.single("file"), async (req, res) => {
  try {
      if(!req.file) {
          res.status(412).send({
              status: false,
              message: 'No audio data present'
          });
          return
      } 
      const file = req.file;
      const form = new FormData();

      form.append('file', file.buffer, file.originalname);
      form.append('model', "whisper-1");
      form.append('response_format', "verbose_json");

      const result = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, { 
        headers: {
        Authorization: `Bearer ${OPENAI_TOKEN}`,
          "Content-Type": "multipart/form-data"
        }
      })

      res.send({
        status: true,
        message: 'Transcribed',
        data: result.data
      })
         
      
  } catch (err) {
      console.error(err)
      res.status(500).send(err);
  }
});

// End of silly code

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/audio', express.static(AUDIO_DIR))


app.use('/', router);

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})

mongoose.connect('mongodb://mongo:27017')
  .then(() => console.log('MongoDB connected'))
  .catch((e) => console.error('Unable connect to db', e))
