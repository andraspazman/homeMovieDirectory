import { FunctionComponent } from "react";
import { Box, Flex, IconButton, Input, Menu, MenuButton, MenuList, MenuItem, Divider, Avatar, Text, Switch, InputGroup, InputRightElement, Button, } from "@chakra-ui/react";
import { HamburgerIcon, SearchIcon } from "@chakra-ui/icons";
import { CircleUserRound, Heart, LogOut, Settings, UserRoundPen } from "lucide-react";

import styles from "./NavBar.module.scss";
import { useUser } from "../../context/UserContext";

interface NavBarProps {
  onSettingsClick: () => void;
  onEditProfileClick: () => void;
  onFavouritesClick: () => void;
  onLogoutClick: () => void;
  toggleSidebar: () => void;
  onLoginClick: () => void; // Ezt adjuk hozzá
}

const NavBar: FunctionComponent<NavBarProps> = ({
  onSettingsClick,
  onEditProfileClick,
  onFavouritesClick,
  onLogoutClick,
  toggleSidebar,
  onLoginClick,
}) => {
  const { user, setUser } = useUser();

  return (
    <Box className={styles.navBar}>
      <Flex className={styles.navBarFlex}>
        <Flex className={styles.leftSection}>
          <IconButton icon={<HamburgerIcon />} variant="ghost" color="red" mr={5} onClick={toggleSidebar} aria-label="Toggle Sidebar" />
          <Text fontWeight="bold" fontSize="lg">
            hoomiFlix
          </Text>
        </Flex>

        <Flex className={styles.centerSection} justifyContent="center">
          <InputGroup>
            <InputRightElement
              cursor="pointer"
              onClick={() => console.log("Search clicked")}
            >
              <SearchIcon color="gray.300" />
            </InputRightElement>
            <Input
              className={styles.searchInput}
              placeholder="Search..."
              _placeholder={{ color: "gray.300" }}
            />
          </InputGroup>
        </Flex>

        <Flex className={styles.rightSection}>
          {user ? (
            <>
              <Menu>
                <MenuButton
                  as={Avatar}
                  size="sm"
                  cursor="pointer"
                  bg="gray.600"
                  src={user.profilePicture}
                />
                <MenuList bg="gray.800" className={styles.myMenuList}>
                  <MenuItem
                    bg="gray.800"
                    className={styles.myMenuItem}
                    onClick={onSettingsClick}
                  >
                    <Settings /> Settings
                  </MenuItem>
                  <MenuItem
                    bg="gray.800"
                    className={styles.myMenuItem}
                    onClick={onEditProfileClick}
                  >
                    <UserRoundPen /> Edit Profile Picture
                  </MenuItem>
                  <MenuItem
                    bg="gray.800"
                    className={styles.myMenuItem}
                    onClick={onFavouritesClick}
                  >
                    <Heart /> Favourites
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    bg="gray.800"
                    className={styles.myMenuItem}
                    onClick={() => {
                      onLogoutClick();
                      setUser(null);
                    }}
                  >
                    <LogOut /> Log out
                  </MenuItem>
                </MenuList>
              </Menu>
              <Text ml={1} mr={5}>
                {user.username}
              </Text>
            </>
          ) : (
            <Button  onClick={onLoginClick} className={styles.loginButton}  variant="ghost" color={"white"} leftIcon={<CircleUserRound/>}>
              Login
            </Button>
          )}
          <Switch colorScheme="gray" mr={2} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default NavBar;
