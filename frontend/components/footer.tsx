import { Box, Button, Flex, Grid, GridItem, LinkBox } from '@chakra-ui/react';
import styles from "./footer.module.css"
import Link from 'next/link';

export default function Footer() {
  return (
    <Flex
      bg="teal.500"
      color="white"

      justifyContent="center"
      alignItems="center"
      position="fixed"
      left="0"
      bottom="0"
      width="100%"
    >

      <Button as="a" p="10"
        color="white"
        bg="teal.500"
        width="50%">

        <Link
          href="/list">List</Link> 
      </Button>
      <Button as="a" p="10"
        color="white"
        bg="teal.500"
        width="50%">

        <Link
          href="/wallet">Wallet</Link>
      </Button>

    </Flex>


  )
}
