import React from 'react';
import {useSelector} from 'react-redux';

import {Session} from 'next-auth';
import {getSession} from 'next-auth/react';
import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import {TopNavbarComponent} from 'src/components/atoms/TopNavbar';
import {DefaultLayout} from 'src/components/template/Default/DefaultLayout';
import {initialize} from 'src/lib/api/base';
import {healthcheck} from 'src/lib/api/healthcheck';
import {getServer, Server} from 'src/lib/api/server';
import i18n from 'src/locale';
import {RootState} from 'src/reducers';
import {fetchAvailableToken} from 'src/reducers/config/actions';
import {fetchExchangeRates} from 'src/reducers/exchange-rate/actions';
import {countNewNotification} from 'src/reducers/notification/actions';
import {
  setAnonymous,
  fetchConnectedSocials,
  fetchUser,
  fetchUserExperience,
  fetchUserWallets,
  fetchNetwork,
} from 'src/reducers/user/actions';
import {UserState} from 'src/reducers/user/reducer';
import {wrapper} from 'src/store';
import {ThunkDispatchAction} from 'src/types/thunk';

const {publicRuntimeConfig} = getConfig();

const MyWalletContainerWithoutSSR = dynamic(
  () => import('../src/components/MyWallet/MyWalletContainer'),
  {
    ssr: false,
  },
);

type WalletPageProps = {
  session: Session;
  logo: string;
  server?: Server;
};

const Wallet: React.FC<WalletPageProps> = props => {
  const {user} = useSelector<RootState, UserState>(state => state.userState);

  if (!user) return null;

  return (
    <DefaultLayout isOnProfilePage={false} {...props}>
      <Head>
        <title>{i18n.t('Wallet.Title', {appname: publicRuntimeConfig.appName})}</title>
      </Head>
      <TopNavbarComponent
        sectionTitle={i18n.t('TopNavbar.Title.Wallet')}
        description={i18n.t('TopNavbar.Subtitle.Wallet')}
        type={'menu'}
      />
      <MyWalletContainerWithoutSSR />
    </DefaultLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(store => async context => {
  const {req} = context;

  const dispatch = store.dispatch as ThunkDispatchAction;

  const available = await healthcheck();

  if (!available) {
    return {
      redirect: {
        destination: '/maintenance',
        permanent: false,
      },
    };
  }

  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const anonymous = Boolean(session?.user.anonymous);
  const userId = session?.user.address as string;

  initialize({cookie: req.headers.cookie}, anonymous);

  if (anonymous || !userId) {
    const username = session?.user.name as string;

    await dispatch(setAnonymous(username));
  } else {
    await dispatch(fetchUser(userId));

    await Promise.all([
      dispatch(fetchConnectedSocials()),
      dispatch(fetchAvailableToken()),
      dispatch(countNewNotification()),
      dispatch(fetchUserExperience()),
      dispatch(fetchUserWallets()),
    ]);
  }

  await dispatch(fetchNetwork());
  await dispatch(fetchExchangeRates());

  const data = await getServer();

  return {
    props: {
      session,
      logo: data.images.logo_banner,
      server: data,
    },
  };
});

export default Wallet;
