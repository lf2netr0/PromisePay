
import { Link } from '@chakra-ui/next-js'
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"

import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// Import Single Factor Auth SDK for no redirect flow
import { Web3Auth, decodeToken } from "@web3auth/single-factor-auth";
import { useEffect, useState } from "react";
import {addressAtom, balanceAtom, providerAtom} from './state'
import { Flex, Text, Box } from '@chakra-ui/react';
// RPC libraries for blockchain calls
import RPC from "./evm.web3";
import { useAtom } from "jotai";
// import RPC from "./evm.ethers";
// import RPC from "./evm.viem";

const verifier = "wld-id-login";

const clientId = "BIDkIB_b8KGDnF1rj77nInYKlrmqk1yL2B9-xvfH2ngARHSeHxlst0Y97HgEpUe8Xg2GySwzUyO2l3EyP3lZWVE"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainId: "0x14a34",
  // chainId: "0x539",
  displayName: "Base Sepolia",
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  tickerName: "Ethereum",
  ticker: "ETH",
  decimals: 18,
  rpcTarget: "https://base-sepolia.g.alchemy.com/v2/Uye7DOCgmKHvFB8vOHGyC_sh4ysKjQNb",
  // rpcTarget: "HTTP://127.0.0.1:7545",
  blockExplorerUrl: "https://sepolia.basescan.org/",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

// Initialising Web3Auth Single Factor Auth SDK
const web3authSfa = new Web3Auth({
  clientId, // Get your Client ID from Web3Auth Dashboard
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // ["cyan", "testnet"]
  privateKeyProvider,
});
// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [account, setAccount] = useAtom(addressAtom)
  const [balance, setBalance] = useAtom(balanceAtom)
  const [provider, setProvider] = useAtom(providerAtom)

  const getAccounts = async () => {
    if (!provider) {
      console.log("No provider found");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    setAccount(userAccount[0]);
    const bal = await rpc.getBalance();
    setBalance((Number(bal)/10**18).toString());
    console.log(balance);
    console.log(account);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await web3authSfa.init();
        if(web3authSfa.provider){
          setProvider(web3authSfa.provider)
        }
        if (web3authSfa.state.privKey) {
          await getAccounts()
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
    return ()=>{
      setProvider(null)
      setAccount('')
      setBalance('')
    }
  }, []);
  useEffect(() => {
    async function getWallet() {
      try {
        if (!web3authSfa) {
          console.log("Web3Auth Single Factor Auth SDK not initialized yet");
          return;
        }
        setIsLoggingIn(true);
        const idTokenResult = decodeToken(session.accessToken)
        console.log(idTokenResult)
        await web3authSfa.connect({
          verifier,
          verifierId: (idTokenResult.payload as any).sub,
          idToken: session.accessToken,
        });
        // await getAccounts()
        setIsLoggingIn(false);
        setIsLoggedIn(true);
      } catch (err) {
        // Single Factor Auth SDK throws an error if the user has already enabled MFA
        // One can use the Web3AuthNoModal SDK to handle this case
        setIsLoggingIn(false);
        console.error(err);
      }
    }
    console.log(session, web3authSfa.state.privKey)
    if (session?.accessToken && !web3authSfa.state.privKey) {
      getWallet()
    }
    if (web3authSfa.state.privKey) {
      getAccounts()
    }
  }, [session, web3authSfa.state.privKey, web3authSfa.provider]);
  return (
    <Flex
      bg="teal.500"
      color="white"
      p="4"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
        <p
          className={`nojs-show ${!session && loading ? styles.loading : styles.loaded
            }`}
        >
          {!session && (
            <>
              <span className={styles.notSignedInText}>
                You are not signed in
              </span>
              <a
                href={`/api/auth/signin`}
                className={styles.buttonPrimary}
                onClick={async (e) => {
                  e.preventDefault()
                  let res = await signIn("worldcoin") // when worldcoin is the only provider
                  console.log(res)
                  // signIn() // when there are multiple providers
                }}
              >
                Sign in
              </a>
            </>
          )}
          {session?.user && (
            <>
              {session.user.image && (
                <span
                  style={{ backgroundImage: `url('${session.user.image}')` }}
                  className={styles.avatar}
                />
              )}
              <span className={styles.signedInText}>
                <small>Signed in as</small>
                <br />
                <strong>{session.user.email ?? session.user.name}</strong>
              </span>
              <a
                href={`/api/auth/signout`}
                className={styles.button}
                onClick={(e) => {
                  e.preventDefault()
                  signOut()
                  web3authSfa.logout()
                }}
              >
                Sign out
              </a>
            </>
          )}
        </p>
      </div>
      <nav>
        <ul className={styles.navItems}>
          <li className={styles.navItem}>
            <Link href="/create" color='blue.400' _hover={{ color: 'blue.500' }}>Create Promise</Link>
          </li>
        </ul>
      </nav>
      <Text fontSize="lg" fontWeight="bold">App Name</Text>
    </Flex>
  )
}
