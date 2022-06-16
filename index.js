import React, { useCallback, useRef } from 'react'

import { ModifySkillModal } from 'Components/Blocks/Admin/Modals'
import { Dialog } from 'Components/Blocks/Modals'
import { Button, Flex, Row, Text } from 'Components/UI'
import { Pagination, Table } from 'Components/UI/Admin'
import { Input } from 'Components/UI/Forms'

import removeSkillMutation from 'GraphQL/Mutations/Skill/removeSkill.graphql'
import skillsQuery from 'GraphQL/Queries/skills.graphql'
import { entityCacheRemover } from 'GraphQL/Updaters/Common'

import {
  useEntityModal,
  useEntityTable,
  useTablePagination,
  useTableSearch,
} from 'Hooks'

import { useAdminMutation, useAdminQuery } from 'Services/Apollo'
import _, { useScopedI18n } from 'Services/I18n'
import toast from 'Services/Toast'

import { useColumns } from './columns'
import TableContext from './context'
import { Container, Content } from './styles'

const SORT_BY = [
  {
    column: 'name',
    order: 'asc',
  },
]

function SkillsTable() {
  const s = useScopedI18n('skill')

  const mostRecentPage = useRef(0)
  const mostRecentLimit = useRef(10)

  const { data, loading, refetch, fetchMore } = useAdminQuery(skillsQuery, {
    variables: {
      page: mostRecentPage.current,
      limit: mostRecentLimit.current,
      sort: SORT_BY,
    },
  })

  const columns = useColumns()
  const entities = data?.skills ?? {}
  const [tableProps, rowsCount] = useEntityTable({
    data: entities,
    columns,
    disableSortBy: true,
  })
  const { pageSize, pageIndex } = tableProps.state

  mostRecentPage.current = pageIndex
  mostRecentLimit.current = pageSize

  const refetchOnClose = useCallback(
    ({ context }) =>
      async success => {
        if (!success) {
          return
        }

        try {
          await refetch()
        } catch (error) {
          toast.error({
            title: context,
            text: error?.message,
          })
        }
      },
    [refetch],
  )

  const [editModal, editActions] = useEntityModal({
    refetch: refetchOnClose({ context: s('actions.edit') }),
  })

  const [createModal, createActions] = useEntityModal({
    refetch: refetchOnClose({ context: s('actions.create') }),
  })

  const [deleteModal, deleteActions] = useEntityModal()

  const [deleteSkill] = useAdminMutation(removeSkillMutation, {
    update: entityCacheRemover({
      entity: deleteModal.entity,
      pageSize,
      queryKey: 'skills',
    }),
  })

  const [search, changeSearch] = useTableSearch({
    onSearch: value => {
      tableProps.gotoPage(0)

      refetch({
        limit: pageSize,
        search: value || undefined,
        sort: SORT_BY,
      })
    },
  })

  const [handleFetchMore] = useTablePagination({
    fetchMore,
    limit: pageSize,
    search: search || undefined,
    sort: SORT_BY,
  })

  const handleDeleteSkill = useCallback(
    async success => {
      if (!success) {
        return
      }

      try {
        await deleteSkill({
          variables: {
            id: deleteModal.entity?.id,
          },
        })

        toast.success({
          title: s('actions.delete'),
          text: s('deleteSuccess'),
        })
      } catch (error) {
        toast.error({
          title: s('actions.delete'),
          text: error.message,
        })
      }
    },
    [deleteModal.entity?.id, deleteSkill, s],
  )

  const handleEditModalClose = editActions.closeModal
  const handleCreateModalOpen = createActions.openModal
  const handleCreateModalClose = createActions.closeModal
  const handleDeleteModalClose = deleteActions.closeModal

  const deleteSkillMessage = (
    <Text
      dangerouslySetInnerHTML={{
        __html: s('messages.delete', {
          skillName: deleteModal.entity?.name,
        }),
      }}
    />
  )

  return (
    <TableContext.Provider
      value={{
        onEditRow: editActions.openModal,
        onDeleteRow: deleteActions.openModal,
      }}
    >
      <Container>
        <Text big bolder mb={3} mt={4}>
          Skills management
        </Text>

        <Content>
          <Row borderBottom center mb={2} pb={3} spaceBetween>
            <Flex>
              <Input
                label={_('search.byName')}
                name="search"
                small
                value={search}
                width={300}
                onChange={changeSearch}
                onClear={changeSearch}
              />
            </Flex>

            <Flex>
              <Button small onClick={handleCreateModalOpen}>
                {s('actions.create')}
              </Button>
            </Flex>
          </Row>

          <Table {...tableProps} loading={loading} />

          <Row borderTop mt={2} pt={3}>
            <Pagination
              {...tableProps}
              fetchMore={handleFetchMore}
              total={rowsCount}
            />
          </Row>
        </Content>
      </Container>

      <ModifySkillModal
        isOpen={editModal.isOpen}
        skill={editModal.entity}
        onClose={handleEditModalClose}
      />

      <ModifySkillModal
        isOpen={createModal.isOpen}
        onClose={handleCreateModalClose}
      />

      <Dialog
        content={deleteSkillMessage}
        isOpen={deleteModal.isOpen}
        title={s('actions.delete')}
        onClose={handleDeleteModalClose}
        onFinish={handleDeleteSkill}
      />
    </TableContext.Provider>
  )
}

export default SkillsTable
