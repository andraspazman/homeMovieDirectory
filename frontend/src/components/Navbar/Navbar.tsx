import { FunctionComponent, useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Spinner,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Avatar,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, SearchIcon } from "@chakra-ui/icons";
import {
  CircleUserRound,
  Clapperboard,
  LogOut,
  Settings,
  UserRoundPen,
  UserCog,
  BarChart2,
} from "lucide-react";
import axios from "axios";
import { useUser, useIsAdmin } from "../../context/UserContext";
import styles from "./NavBar.module.scss";
import { useNavigate } from "react-router-dom";
import { SearchResultDTO } from "../../types/SearchResultDTO";
import { NavBarProps } from "../../interfaces/INavBarProps";

const NavBar: FunctionComponent<NavBarProps> = ({
  onSettingsClick,
  onEditProfileClick,
  toggleSidebar,
  onLoginClick,
  onAddMediaClick,
}) => {
  const { user, logout } = useUser();
  const isAdmin = useIsAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResultDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keresés debounce megoldás
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    if (searchQuery.trim() === "") {
      setResults([]);
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      axios
        .get(`https://localhost:7204/search?q=${encodeURIComponent(searchQuery)}`)
        .then((response) => setResults(response.data))
        .catch((err) => {
          console.error("Search error:", err);
          setResults([]);
        })
        .finally(() => setIsLoading(false));
    }, 300);

    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [searchQuery, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Box className={styles.navBar}>
      <Flex className={styles.navBarFlex}>
        <Flex className={styles.leftSection}>
          <IconButton
            icon={<HamburgerIcon />}
            variant="ghost"
            color="red"
            mr={5}
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          />
          <Text fontWeight="bold" fontSize="lg">
            homeFlix
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
                <Input
                  ref={inputRef}
                  className={styles.searchInput}
                  placeholder="Search..."
                  _placeholder={{ color: "gray.300" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  results.slice(0, 3).map((result) => (
                    <Box
                      key={result.id}
                      p={2}
                      borderBottom="1px solid #ccc"
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      color="red"
                      tabIndex={-1}
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

        {/* Jobb oldali rész: Felhasználói menü, login, stb. */}
        <Flex className={styles.rightSection} alignItems="center" w="35%" >
            {user && isAdmin && (
              <Flex alignItems="center" mr={1}>
                <Button
                  variant="ghost"
                  color="red"
                  leftIcon={<BarChart2 />}
                  onClick={() => navigate("/statistics")}
                >
                  Statistics
                </Button>
                <Button
                  variant="ghost"
                  color="red"
                  leftIcon={<UserCog />}
                  onClick={() => navigate("/manage-users")}
                >
                  Manage Users
                </Button>
                <Button
                  onClick={onAddMediaClick}
                  variant="ghost"
                  color="white"
                  leftIcon={<Clapperboard />}
                >
                  Add media
                </Button>
              </Flex>
            )}

            <Spacer />

            {user && !isAdmin && (
              <Button
                onClick={onAddMediaClick}
                variant="ghost"
                color="white"
                leftIcon={<Clapperboard />}
                mr={5}
              >
                Add media
              </Button>
            )}

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
                      onClick={() => navigate("/profile-settings")}
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
                    <Divider />
                    <MenuItem
                      bg="gray.800"
                      className={styles.myMenuItem}
                      onClick={handleLogout}
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
              <Button
                onClick={onLoginClick}
                className={styles.loginButton}
                variant="ghost"
                color="white"
                leftIcon={<CircleUserRound />}
                mr="5%"
              >
                Login
              </Button>
            )}
          </Flex>
      </Flex>
    </Box>
  );
};

export default NavBar;
