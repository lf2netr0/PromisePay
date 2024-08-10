import { Flex } from '@chakra-ui/react';
import styles from "./footer.module.css"

export default function Footer() {
  return (
    <Flex
      bg="teal.500"
      color="white"
      p="4"
      justifyContent="center"
      alignItems="center"
      position="fixed"
      left="0"
      bottom="0"
      width="100%"
    >
      <footer className={styles.footer}>
        <hr />
        <ul className={styles.navItems}>
          <li className={styles.navItem}>
            <a href="/list">List</a>
          </li>
          <li className={styles.navItem}>
            <a href="/wallet">Wallet</a>
          </li>
        </ul>
      </footer>
    </Flex>


  )
}
