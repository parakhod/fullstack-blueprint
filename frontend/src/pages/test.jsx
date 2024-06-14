import React, {useState} from 'react'
import { Container, Button, Divider, Input, Menu, Dropdown } from 'semantic-ui-react'

import { Navbar } from '../components/navbar';
import { api } from '../api'

const options = [
  { key: 1, text: 'Key 1', value: 'key1' },
  { key: 2, text: 'Key 2', value: 'key2' },
  { key: 3, text: 'Key 3', value: 'key3' },
]

const Test = () => {
  const [selectedKey, setSelectedKey] = useState(options[0].value)
  const [localValue, setLocalValue] = useState('')

  const [serverData, setServerData] = useState('')

  const postData = () => api.post(
    'test_api',
    { key: selectedKey, value: localValue }
  )
    .then(({ data }) => {
      console.log('Record created', data)
    })
    .catch(e => console.error(e))

  const putData = () => api.put(
    'test_api',
    { key: selectedKey, value: localValue }
  )
    .then(({ data }) => {
      console.log('Record Updated', data)
    })
    .catch(e => console.error(e))

  const getData = () => api.get(`test_api?key=${selectedKey}`)
    .then(({ data }) => {
      console.log('Data received', data)
      setServerData(data.value)
    })
    .catch(e => console.error(e))

  return (
    <>
      <Navbar current="test" />
      <Divider hidden />
      <Container>
        Data key
        <Menu compact style={{ marginLeft: 15 }}>
          <Dropdown
            options={options}
            simple
            item
            value={selectedKey}
            onChange={(_, { value }) => setSelectedKey(value)}/>
        </Menu>
        <Divider hidden />
        <Input
          focus
          placeholder='Enter value'
          value={localValue}
          onChange={(_, {value}) => setLocalValue(value)}
        />
      </Container>
      <Container>
        <Divider hidden />
        <Button content='Recive via GET' secondary onClick={() => getData()} />
        <Button content='Send via POST' primary onClick={() => postData()} />
        <Button content='Update via PUT' onClick={() => putData()} />
      </Container>
      <Divider hidden />
      <Container>
        Received value: {serverData}
      </Container>
    </>
  )}

export { Test }
