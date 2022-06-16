import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router'
import PropTypes from 'prop-types'

import UserCard from 'Components/Blocks/CommunityGraph/UserCard'
import Graph from 'Components/Blocks/Graph'

import { useAppContext, useEventBusSubscribe } from 'Hooks'

import { COMMUNITY_USER } from 'Router/routes'

import EventBus from 'Services/EventBus'

import { Container, Content } from './styles'
import useNotesGraph from './useNotesGraph'
import { COMBO_NAME } from './utils'

function NotesGraph({
  users,
  targetUserId,
  appendSkills,
  appendUserIds,
  meetUserIds,
  mentionedSkills,
  projectValues,
  eventValues,
  roleValues,
  mentionedUserIds,
  needSkills,
  ...rest
}) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)

  const history = useHistory()

  const { me } = useAppContext()

  const [combineState, setCombineState] = useState({
    combine: { properties: ['kind', 'tag'] },
    openCombos: {},
  })

  const [items] = useNotesGraph({
    users,
    targetUserId,
    appendSkills,
    appendUserIds,
    meetUserIds,
    mentionedSkills,
    mentionedUserIds,
    projectValues,
    eventValues,
    roleValues,
    needSkills,
  })
  const [focusedUser, setFocusedUser] = useState(null)

  const handleSelectNode = useCallback(
    clickedNode => {
      if (clickedNode?.id) {
        setFocusedUser(items[clickedNode?.id]?.data)
      }
    },
    [items],
  )

  const handleShowUserInfo = useCallback(
    user => {
      if (user?.id) {
        history.push(COMMUNITY_USER(user?.id))
      }
    },
    [history],
  )

  useEffect(() => {
    graphRef.current?.setLayout({
      name: 'radial',
      top: [me.id, targetUserId],
    })
  }, [items, me, targetUserId])

  useEventBusSubscribe(
    EventBus.actions.dashboard.setClickedNode,
    handleSelectNode,
  )

  const handleDoubleClick = useCallback(({ id }) => {
    if (!id?.startsWith('_combonode_')) return

    setCombineState(prevState => ({
      combine: { ...prevState.combine },
      openCombos: {
        ...prevState.openCombos,
        [id]: !prevState.openCombos[id],
      },
    }))
  }, [])

  const handleCombineNodes = useCallback(({ combo, setStyle }) => {
    setStyle({
      open: true,
      size: 4,
      label: {
        text: COMBO_NAME[combo.kind],
        fontSize: 4,
        backgroundColor: 'rgba(255,255,255,0)',
      },
    })
  }, [])

  const handleCombineLinks = useCallback(({ setStyle }) => {
    setStyle({
      contents: true,
    })
  }, [])

  return (
    <Container {...rest}>
      <Content ref={containerRef}>
        <Graph
          border="none"
          combineState={combineState}
          gridHorizontalCount={8}
          gridVerticalCount={14}
          height="calc(100vh - 52px)"
          items={items}
          popoverContent={
            <UserCard user={focusedUser} onClick={handleShowUserInfo} />
          }
          popoverContentHeight={415}
          popoverContentWidth={260}
          ref={graphRef}
          width="100%"
          onCombineLinks={handleCombineLinks}
          onCombineNodes={handleCombineNodes}
          onDoubleClick={handleDoubleClick}
          onSelect={() => {}}
        />
      </Content>
    </Container>
  )
}

NotesGraph.defaultProps = {
  appendSkills: new Map(),
  appendUserIds: new Set(),
  meetUserIds: new Set(),
  mentionedSkills: new Map(),
  mentionedUserIds: new Set(),
  needSkills: new Map(),
  projectValues: new Set(),
  eventValues: new Set(),
  roleValues: new Set(),
}

NotesGraph.propTypes = {
  appendSkills: PropTypes.object,
  appendUserIds: PropTypes.object,
  eventValues: PropTypes.object,
  meetUserIds: PropTypes.object,
  mentionedSkills: PropTypes.object,
  mentionedUserIds: PropTypes.object,
  needSkills: PropTypes.object,
  projectValues: PropTypes.object,
  roleValues: PropTypes.object,
  targetUserId: PropTypes.string.isRequired,
  users: PropTypes.object.isRequired,
}

export default NotesGraph
