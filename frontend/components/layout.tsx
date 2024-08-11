import type { ReactNode } from "react"
import { Flex } from '@chakra-ui/react';
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Flex
      direction="column"
      align="center"
      maxW={{ xl: "1200px" }}
      m="0 auto"
      px={4}
      flex="1"
      pt="40"
      pb="20" // Give enough padding-bottom to avoid content being overlaid by the footer
    >
      {children}
    </Flex>
  )
}
