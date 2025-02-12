import { Flex, Heading, Button, Input, IconButton, Avatar } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useState } from "react";
import styles from "../styles/TopBar.module.css"

// Kibővített interfész, amely tartalmazza az onShowAddSeries callback-et is
interface TopBarProps {
  onToggleSidebar: () => void;
  isAuthenticated: boolean;
  onSignOut: () => void;
  onShowAddSeries: () => void;
}

export default function TopBar({ onToggleSidebar, isAuthenticated, onSignOut, onShowAddSeries }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={styles.topbar}>
      {/* Bal oldali rész - Hamburger gomb és logo */}
      <div className={styles.leftSection}>
        <IconButton
          aria-label="Open Sidebar"
          icon={<HamburgerIcon />}
          variant="ghost"
          color="white"
          onClick={onToggleSidebar}
        />
        <Heading className={styles.logo} size="md">
          Logo
        </Heading>
      </div>

      {/* Keresőmező középen */}
      <div className={styles.centerSection}>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          size="sm"
          width="300px"
        />
      </div>

      {/* Jobb oldali rész - "Add Series" gomb, felhasználói ikon és be-/kilépés */}
      <div className={styles.rightSection}>
        <Button colorScheme="blue" onClick={onShowAddSeries} mr={3}>
          Add Series
        </Button>
        {isAuthenticated && (
          <Avatar size="sm" mr={3} />
        )}
        <Button colorScheme="red" onClick={onSignOut}>
          {isAuthenticated ? "Sign Out" : "Sign In"}
        </Button>
      </div>
    </div>
  );
}
