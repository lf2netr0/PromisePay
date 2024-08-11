import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"
import EthereumRpc from "../components/evm.web3"
import React from "react";
import QRCode from "react-qr-code";
import { useAtom } from "jotai";
import {addressAtom, balanceAtom} from '../components/state'
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

      <div style={{ height: "auto", margin: "0 auto", maxWidth: 64, width: "100%" }}>
        <h1>wallet:</h1>
        <p>
          <strong>{account ?? "\u00a0"}</strong>
        </p>
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={account}
          viewBox={`0 0 256 256`}
        />
        <p>
          balance: {balance}
        </p>
      </div>
    </Layout>
  )
}
