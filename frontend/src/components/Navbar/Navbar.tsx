import { FunctionComponent, useState, useEffect, useRef } from "react";
import {
  Box,Flex,IconButton, Input, InputGroup, InputRightElement, Popover, PopoverTrigger, PopoverContent,PopoverArrow, PopoverBody,Spinner,
  Text,Button, Menu, MenuButton, MenuList, MenuItem, Divider, Avatar,  Spacer, useDisclosure, } from "@chakra-ui/react";
import { HamburgerIcon, SearchIcon } from "@chakra-ui/icons";
import {CircleUserRound, Clapperboard, Heart, LogOut,Settings, UserRoundPen, } from "lucide-react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import styles from "./NavBar.module.scss";
import { useNavigate } from "react-router-dom";
import { SearchResultDTO } from "../../types/SearchResultDTO";
import { NavBarProps } from "../../interfaces/INavBarProps";



const NavBar: FunctionComponent<NavBarProps> = ({
  onSettingsClick,
  onEditProfileClick,
  onFavouritesClick,
  onLogoutClick,
  toggleSidebar,
  onLoginClick,
  onAddMediaClick,
}) => {
  const { user, setUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResultDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // useDisclosure a popover nyitás/zárás kezeléséhez
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Ref az input számára, hogy a popover megnyitásakor a fókusz az inputon maradjon
  const inputRef = useRef<HTMLInputElement>(null);

  //MOD: Inicializáljuk a useNavigate hookot a navigációhoz
  const navigate = useNavigate();

  // Élő keresés: debounce, majd API hívás
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    // Ha a keresési lekérdezés üres, ürítjük az eredményeket és bezárjuk a popovert
    if (searchQuery.trim() === "") {
      setResults([]);
      onClose();
      return;
    }
    const timer = setTimeout(() => {
      setIsLoading(true);
      axios
        .get(`https://localhost:7204/search?q=${encodeURIComponent(searchQuery)}`)
        .then((response) => {
          setResults(response.data);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [searchQuery, onClose]);

  return (
    <Box className={styles.navBar}>
      <Flex className={styles.navBarFlex}>
        <Flex className={styles.leftSection}>
          <IconButton icon={<HamburgerIcon />} variant="ghost" color="red" mr={5} onClick={toggleSidebar} aria-label="Toggle Sidebar"/>
          <Text fontWeight="bold" fontSize="lg">
            hoomiFlix
          </Text>
        </Flex>

        <Flex className={styles.centerSection} justifyContent="center">
          <Popover
            placement="bottom"
            isOpen={isOpen && searchQuery.trim() !== ""}
            onClose={onClose}
            initialFocusRef={inputRef}
            closeOnBlur
          >
            <PopoverTrigger>
              <InputGroup w="300px">
                <InputRightElement cursor="pointer">
                  <SearchIcon color="gray.300" />
                </InputRightElement>
                <Input ref={inputRef} className={styles.searchInput} placeholder="Search..." _placeholder={{ color: "gray.300" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={onOpen}
                  onClick={onOpen}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault();
                    }
                  }}
                />
              </InputGroup>
            </PopoverTrigger>
            <PopoverContent w="300px" zIndex={10} autoFocus={false}>
              <PopoverArrow />
              <PopoverBody maxH="300px" overflowY="auto">
                {isLoading ? (
                  <Flex justifyContent="center" alignItems="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : results.length === 0 ? (
                  <Text p={2}>Not found.</Text>
                ) : (
                  // Csak maximum 3 találatot jelenítünk meg
                  results.slice(0, 3).map((result) => (
                    <Box key={result.id} p={2} borderBottom="1px solid #ccc" cursor="pointer" _hover={{ bg: "gray.100" }} color={"red"} tabIndex={-1}
                      onClick={() => {
                        console.log("Selected:", result);
                        onClose();
                        if (result.type === "Movie") {
                          navigate(`/movie/${result.id}`);
                        } else if (result.type === "Series") {
                          navigate(`/series/${result.id}`);
                        }
                      }}
                    >
                      <Text fontWeight="bold">{result.title}</Text>
                      <Text fontSize="sm">
                        {result.genre} - {result.releaseYear}
                      </Text>
                      <Text fontSize="xs">{result.type}</Text>
                    </Box>
                  ))
                )}
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>

        <Flex className={styles.rightSection} alignItems="center" w="15%" p="0%">
          {user ? (
            <>
              <Button onClick={onAddMediaClick} variant="ghost" color="white" leftIcon={<Clapperboard />}>
                Add media
              </Button>
              <Spacer />
              <Menu>
                <MenuButton as={Avatar} size="sm" cursor="pointer" bg="gray.600" src={user.profilePicture}
                />
                <MenuList bg="gray.800" className={styles.myMenuList}>
                  <MenuItem bg="gray.800" className={styles.myMenuItem} onClick={onSettingsClick}>
                    <Settings /> Settings
                  </MenuItem>
                  <MenuItem bg="gray.800" className={styles.myMenuItem} onClick={onEditProfileClick} >
                    <UserRoundPen /> Edit Profile Picture
                  </MenuItem>
                  <MenuItem bg="gray.800" className={styles.myMenuItem} onClick={onFavouritesClick}>
                    <Heart /> Favourites
                  </MenuItem>
                  <Divider />
                  <MenuItem bg="gray.800" className={styles.myMenuItem}
                    onClick={() => {
                      onLogoutClick();
                      localStorage.removeItem("jwt");
                      setUser(null);
                    }}
                  >
                    <LogOut /> Log out
                  </MenuItem>
                </MenuList>
              </Menu>
              <Text ml={1} mr={5}>{user.username}</Text>
            </>
          ) : (
            <Button  onClick={onLoginClick} className={styles.loginButton} variant="ghost" color="white" leftIcon={<CircleUserRound />} mr="5%">
              Login
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default NavBar;
