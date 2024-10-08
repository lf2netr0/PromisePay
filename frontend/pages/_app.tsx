import { SessionProvider } from "next-auth/react"
import "./styles.css"

import type { AppProps } from "next/app"
import type { Session } from "next-auth"
import { CSSReset, ChakraProvider, Flex } from '@chakra-ui/react'
import Header from "../components/header"
import Layout from "../components/layout"
import Footer from "../components/footer"

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <ChakraProvider>
      <SessionProvider session={session}>
        <CSSReset />
        <Flex direction="column" minHeight="100vh">
          <Header />
          {/* <Layout> */}

            <Component {...pageProps} />
          {/* </Layout> */}
          <Footer />
        </Flex>
      </SessionProvider>
    </ChakraProvider>
  )
}
