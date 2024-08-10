
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// Import Single Factor Auth SDK for no redirect flow
import { Web3Auth, decodeToken } from "@web3auth/single-factor-auth";
import { atom, useAtom } from "jotai";
// RPC libraries for blockchain calls

// import RPC from "./evm.ethers"; 
// import RPC from "./evm.viem";

const verifier = "wld-id-login";

const clientId = "BIDkIB_b8KGDnF1rj77nInYKlrmqk1yL2B9-xvfH2ngARHSeHxlst0Y97HgEpUe8Xg2GySwzUyO2l3EyP3lZWVE"; // get from https://dashboard.web3auth.io

const chainConfig = {
    chainId: "0x14a34",
    displayName: "Base Sepolia",
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    tickerName: "Ethereum",
    ticker: "ETH",
    decimals: 18,
    rpcTarget: "https://sepolia.base.org",
    blockExplorerUrl: "https://sepolia.basescan.org/",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
});
export const web3authSfaAtom = atom(new Web3Auth({
    clientId, // Get your Client ID from Web3Auth Dashboard
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // ["cyan", "testnet"]
    usePnPKey: false, // Setting this to true returns the same key as PnP Web SDK, By default, this SDK returns CoreKitKey.
    privateKeyProvider,
}))

 
// export { web3authSfaAtom }
export async function getWallet(web3authSfa: Web3Auth, session: any) {
    console.log(web3authSfa)
    const idTokenResult = decodeToken(session.accessToken)
    await web3authSfa.connect({
        verifier,
        verifierId: (idTokenResult.payload as any).sub,
        idToken: session.accessToken,
    });
    

}
