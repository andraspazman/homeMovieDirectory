import React, { FunctionComponent } from "react";
import { Box, Flex, IconButton, Input, Menu, MenuButton, MenuList, MenuItem, Divider, Avatar, Text, Switch, InputGroup, InputLeftElement, InputRightElement} from "@chakra-ui/react";
import { HamburgerIcon, SearchIcon, SettingsIcon,EditIcon,StarIcon, UnlockIcon,} from "@chakra-ui/icons";

import styles from "./NavBar.module.scss";

interface NavBarProps {
  userName: string;
  onSettingsClick: () => void;
  onEditProfileClick: () => void;
  onFavouritesClick: () => void;
  onLogoutClick: () => void;
}


const NavBar: FunctionComponent<NavBarProps> = ({
  userName,
  onSettingsClick,
  onEditProfileClick,
  onFavouritesClick,
  onLogoutClick,
}) => {
  return (
    <Box className={styles.navBar}>
     
      <Flex className={styles.navBarFlex} >     
      
        
        <Flex className={styles.leftSection} >
          <IconButton aria-label="Hamburger Menu" icon={<HamburgerIcon/>}  variant="ghost" color="red" mr={5}
            onClick={() => console.log("palceholder")}
          />
          <Text fontWeight="bold" fontSize="lg"> EvoWatch </Text>
        </Flex>

        <Flex className={styles.centerSection}  justifyContent="center">
          <InputGroup>
            <InputRightElement cursor="pointer" onClick={() => console.log("placeholder")} >
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
          <Menu>
            <MenuButton as={Avatar} size="sm" cursor="pointer" bg="gray.600"
              //src={userProfilePicUrl}
            />
            <MenuList bg="gray.800" className={styles.myMenuList}>
            <MenuItem  bg="gray.800" className={styles.myMenuItem} onClick={onSettingsClick}>
              <SettingsIcon mr={2} />
               Settings
            </MenuItem>

            <MenuItem bg="gray.800" className={styles.myMenuItem} onClick={onEditProfileClick}>
              <EditIcon mr={2} />
              Edit Profile Picture
            </MenuItem>

            <MenuItem bg="gray.800" className={styles.myMenuItem} onClick={onFavouritesClick} >
              <StarIcon mr={2} />
              Favourites
            </MenuItem>

            <Divider />

            <MenuItem
              bg="gray.800"
              className={styles.myMenuItem}
              onClick={onLogoutClick}
            >
              <UnlockIcon mr={2} />
              Log out
            </MenuItem>
          </MenuList>
          </Menu>
            
          <Text ml={1} mr={5}>{"placeholder"}</Text>
          <Switch colorScheme="gray" mr={2}></Switch>
        </Flex>
      </Flex>
    </Box>
  );
};

export default NavBar;
