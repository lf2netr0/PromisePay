import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"


import { List, ListItem, ListIcon, Box, Text, Link, Button } from '@chakra-ui/react';
import { MdCheckCircle } from "react-icons/md";


import RPC from "../components/evm.web3";

import { useAtom } from 'jotai';
import { addressAtom, providerAtom } from '../components/state';

export default function ProtectedList() {
  const [provider] = useAtom(providerAtom)
  const { data: session } = useSession()
  const [content, setContent] = useState()
  const [account] = useAtom(addressAtom)
  console.log(provider)

  const [promises, setPromises] = useState([]);
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




  useEffect(() => {
    const rpc = new RPC(provider);
    setPromises([])
    rpc.contract.events.PromiseCreated({
      fromBlock: 13773164
    }).on('data', event => {
      console.log(event.returnValues)
      const { host, promiseId, promiseAddress } = event.returnValues;
      setPromises(prevPromises => [
        ...prevPromises,
        { host, promiseId, promiseAddress }
      ]);
    })

    return () => {
      // Cleanup listener when the component is unmounted
      rpc.contract.removeAllListeners('PromiseCreated');
    };
  }, [provider]);



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

      <Box p={5}>
        <Text fontSize="xl" mb={4}>Promise Events</Text>
        <List spacing={3}>
          {promises.map((promise) => (
            <ListItem key={promise.promiseId}>
              <ListIcon as={MdCheckCircle} color="green.500" />
              <Box>
                <Text>Host: {promise.host}</Text>
                <Text>ID: {promise.promiseId.toString()}</Text>
                <Text>Address: {promise.promiseAddress}</Text>
              </Box>
              <Button as="a" ml={4} color="blue.500" >
                <Link href={`/detail/${promise.promiseAddress}`} passhref={true}>

                  View Details

                </Link>
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>

    </Layout>
  )
}
