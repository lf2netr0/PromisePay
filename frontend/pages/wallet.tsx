import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"
import EthereumRpc from "../components/evm.web3"
import React from "react";
import QRCode from "react-qr-code";
import { useAtom } from "jotai";
import { addressAtom, balanceAtom } from '../components/state'
import { Text } from "@chakra-ui/react"
export default function ProtectedPage() {
  const { data: session } = useSession()
  const [account, setAccount] = useAtom(addressAtom)
  const [balance, setBalance] = useAtom(balanceAtom)

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }

  // If session exists, display content
  return (
    <Layout>
      {account && (
        <>
        <Text>Address: {account ?? "\u00a0"}</Text>
        <Text>Balance: {balance ?? "\u00a0"} ETH</Text>
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={account}
          viewBox={`0 0 256 256`}
        /></>
      )}
      {!account && (
        <Text>Loading...</Text>

      )}
    </Layout>
  )
}
