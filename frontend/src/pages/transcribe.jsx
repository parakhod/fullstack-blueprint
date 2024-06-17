import React, {useState, useRef, useEffect} from 'react'
import { Container, Button, Divider, MessageHeader, Message, TextArea } from 'semantic-ui-react'
import FileSaver from 'file-saver';

import { Navbar } from '../components/navbar';
import { api, uploadFile } from '../api'

// const options = [
//   { key: 1, text: 'Key 1', value: 'key1' },
//   { key: 2, text: 'Key 2', value: 'key2' },
//   { key: 3, text: 'Key 3', value: 'key3' },
// ]

const Transcribe = () => {

  const audio = useRef()

  const [localFile, setLocalFile] = useState();
  const [isPlaying, setIsPlaying ] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState();
  const [uploadError, setUploadError] = useState(null);
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState("")
  const [summaryAudio, setSummaryAudio] = useState("")
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [isCreatingSummary, setIsCreatingSummary] = useState(false)


  const inputRef = useRef(null);



  const handleFileChange = (e) => {
    if (!e.target.files) {
      return;
    }
    setIsLoadingAudio(true)
    setSummary('')
    setSummaryAudio('')
    const audioFile = e.target.files[0]
    setLocalFile(audioFile);

    uploadFile('/transcribe-audio', audioFile)
      .then(res => {
        setTranscriptionData(res.data.data);
        setTranscript(res.data.data.text)
        setUploadError(null)
        setIsLoadingAudio(false)

      })
      .catch(e => {
        console.log(e)
        setUploadError(e.message)
        setIsLoadingAudio(false)
      })


  };

  const createSummary = () => {
    setIsCreatingSummary(true)
    api.post(
      'summary',
      { text: transcript }
    )
      .then(({ data }) => {
        console.log('Summary created', data)
        setSummary(data.summary)
        setIsCreatingSummary(false)
        setSummaryAudio(`http://localhost:4005/audio/${data.audio}`)
      })
      .catch(e => {
        setIsCreatingSummary(false)
        console.error(e)
      })
  }

  const playSummary = () => {
    //if (!audio.current) {
      console.log('play', summaryAudio)
      audio.current = new Audio(summaryAudio);
      audio.current.play();
      // setIsPlaying(true)
   // }

  }


  const downloadSummary = () => {
    FileSaver.saveAs(summaryAudio, 'summary.mp3');
  }

//   useEffect(() => {
//     if (summaryAudio !== '') {
//       playSummary()
//     }
//   }, [playSummary, summaryAudio])



  return (
    <>
      <Navbar current="test" />
      <Divider hidden />
      <Container>
        <Button content='Upload audio file' primary onClick={() => inputRef.current?.click()} loading={isLoadingAudio} />
        {uploadError && (
          <Message negative>
            <MessageHeader>Error uploading file</MessageHeader>
            <p>{uploadError}</p>
          </Message>
        )}

      </Container>
      {transcriptionData?.text && ( <> <Divider hidden />
        <Container>
          <textarea
            name="postContent"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            rows={4}
            cols={40}
          />
          <Divider hidden />
          <Button content='Create summary' primary onClick={() => createSummary()} loading={isCreatingSummary} />
        </Container>
      </>)}
      <Divider hidden />
      <Container>
        {summary !== '' && (
          <Message info>
            <MessageHeader>Summary</MessageHeader>
            <p>{summary}</p>
            <Button content={isPlaying ? '⏸' : '⏵'} secondary onClick={() => playSummary()} />
            <Button content='Download summary audio' secondary onClick={downloadSummary} />
          </Message>
        )}

      </Container>


      <input
        type="file"
        accept=".mp3,audio/*"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  )}

export { Transcribe }
