import { inject, observer } from 'mobx-react'
import React from 'react'
import type { RouteComponentProps } from 'react-router'
import { Loader } from 'oa-components'
import { Text } from 'theme-ui'
import type { IUserPP } from 'src/models'
import { ProfileType } from 'src/modules/profile/types'
import type { ThemeStore } from 'src/stores/Theme/theme.store'
import type { UserStore } from 'src/stores/User/user.store'
import type { AggregationsStore } from 'src/stores/Aggregations/aggregations.store'
// import { useCommonStores } from 'src/index'

import { MemberProfile } from './MemberProfile'
import { SpaceProfile } from './SpaceProfile'

interface IRouterCustomParams {
  id: string
}

interface InjectedProps extends RouteComponentProps<IRouterCustomParams> {
  userStore: UserStore
  themeStore: ThemeStore
  aggregationsStore: AggregationsStore
}

interface IState {
  user?: IUserPP
  isLoading: boolean
}

interface IProps {}

// TODO: Replace this logic with a simpler mobx-react hook: https://mobx-react.js.org/recipes-migration
@inject('userStore', 'themeStore', 'aggregationsStore')
@observer
export class UserPage extends React.Component<
  RouteComponentProps<IRouterCustomParams>,
  IState,
  IProps
> {
  constructor(props: any) {
    super(props)
    this.state = {
      user: undefined,
      isLoading: true,
    }
  }

  get injected() {
    return this.props as InjectedProps
  }

  /* eslint-disable @typescript-eslint/naming-convention*/
  async UNSAFE_componentWillMount() {
    const userid = this.props.match.params.id
    const userData = await this.injected.userStore.getUserProfile(userid)
    this.setState({
      user: userData || null,
      isLoading: false,
    })
  }

  componentDidMount() {
    // Ensure aggregations up-to-date when using any child pages
    this.injected.aggregationsStore!.updateAggregation(
      'users_votedUsefulHowtos',
    )
    this.injected.aggregationsStore!.updateAggregation(
      'users_votedUsefulResearch',
    )
  }
  componentWillUnmount() {
    // Stop receiving updates when navigating away from child pages
    this.injected.aggregationsStore!.stopAggregationUpdates(
      'users_votedUsefulHowtos',
    )
    this.injected.aggregationsStore!.stopAggregationUpdates(
      'users_votedUsefulResearch',
    )
  }

  render() {
    const { user, isLoading } = this.state
    if (isLoading) {
      return <Loader />
    }
    if (!user) {
      return (
        <Text
          sx={{
            width: '100%',
            textAlign: 'center',
            display: 'block',
            marginTop: 10,
          }}
        >
          User not found
        </Text>
      )
    }
    return (
      <>
        {user.profileType === ProfileType.MEMBER ||
        user.profileType === undefined ? (
          <MemberProfile data-cy="memberProfile" user={user} />
        ) : (
          <SpaceProfile data-cy="spaceProfile" user={user} />
        )}
      </>
    )
  }
}
