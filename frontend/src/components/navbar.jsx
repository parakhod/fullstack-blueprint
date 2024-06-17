import React from 'react'
import { Link } from "react-router-dom";
import { Menu, Segment } from 'semantic-ui-react'

const Navbar = ({ current = 'home' }) => (
  <Segment inverted attached size='mini'>
    <Menu inverted secondary>
      <Menu.Item
        as={ Link }
        name='home'
        active={current === 'home'}
        to='/'
      >
        Home
      </Menu.Item>
      <Menu.Item
        as={ Link }
        name='transcribe'
        active={current === 'transcribe'}
        to='/transcribe'
      >
        Transcribe
      </Menu.Item>
    </Menu>
  </Segment>
)

export { Navbar }
