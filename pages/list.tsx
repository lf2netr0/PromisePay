import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"

import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit'
import { useAtom } from "jotai"
import { addressAtom } from "../components/state"


export default function ProtectedPage() {
  const { data: session } = useSession()
  const [content, setContent] = useState()
  const [account] = useAtom(addressAtom)

  // Fetch content from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/examples/protected")
      const json = await res.json()
      if (json.content) {
        setContent(json.content)
      }
    }
    fetchData()
  }, [session])

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }
  const handleVerify = async (proof: ISuccessResult) => {
    console.log(proof)
};

  const onSuccess = () => {
    // This is where you should perform any actions after the modal is closed
    // Such as redirecting the user to a new page
    console.log("/success");
  };

  // If session exists, display content
  return (
    <Layout>
      <h1>Protected Page</h1>
      <p>
        <strong>{content ?? "\u00a0"}</strong>
      </p>

      <IDKitWidget
        app_id="app_GBkZ1KlVUdFTjeMXKlVUdFT" // must be an app set to on-chain in Developer Portal
        action="claim_nft"
        signal={account} // proof will only verify if the signal is unchanged, this prevents tampering
        handleVerify={handleVerify} // callback when the proof is received
        onSuccess={onSuccess} // use onSuccess to call your smart contract
      // no use for handleVerify, so it is removed
      // use default verification_level (orb-only), as device credentials are not supported on-chain
      >
        {({ open }) => <button onClick={open}>Verify with World ID</button>}
      </IDKitWidget>
    </Layout>
  )
}
