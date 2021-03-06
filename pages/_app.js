import { useState }           from "react";
import { UseWalletProvider }  from "use-wallet";
import { ApolloProvider }     from '@apollo/client';
import { ChakraProvider }     from "@chakra-ui/core";
import { useApollo }          from "../apollo/client";
import Layout                 from "../components/Layout";
import theme                  from "../theme";
import Head from 'next/head'
import "../styles/globals.css";

const fakeStorageManager = {
  get: () => "dark",
  set: (value) => {},
  type: "cookie",
};

const App = ({ Component, pageProps }) => {
  const apolloClient = useApollo({});
  return (
    <UseWalletProvider
      chainId={1}
      connectors={{
        walletconnect: { rpcUrl: "https://mainnet.eth.aragon.network/" },
      }}
    >
      <Head>
        <title>Unibond</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ApolloProvider client={apolloClient}>
        <ChakraProvider theme={theme} colorModeManager={fakeStorageManager}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </ApolloProvider>
    </UseWalletProvider>
  )
};

export default App;
