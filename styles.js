import styled from 'styled-components'
import { themeGet } from '@styled-system/theme-get'

export const Container = styled.div`
  width: 100%;
`

export const Content = styled.div`
  padding: ${themeGet('space.3')}px 0;
`

export const Email = styled.div`
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  align-items: center;

  svg {
    display: none;
    margin-left: 2px;
  }

  :hover {
    color: ${themeGet('colors.primary')};
    text-decoration: underline;

    svg {
      display: block;
    }
  }
`
