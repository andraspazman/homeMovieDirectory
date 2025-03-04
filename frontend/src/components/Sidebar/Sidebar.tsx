import { FunctionComponent } from "react";
import { Box, Flex, Button, Divider, Checkbox, CheckboxGroup, Stack, Text } from "@chakra-ui/react";
import { Film, MonitorPlay, House, CirclePlay } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { SidebarProps } from "../../interfaces/IsidebarProps.types";

const Sidebar: FunctionComponent<SidebarProps> = ({
  isOpen,
  selectedGenres,
  setSelectedGenres,
  selectedCountries,
  setSelectedCountries,
}) => {
  return (
    <Box className={`${styles.sidebar} ${isOpen ? styles["sidebar-open"] : styles["sidebar-closed"]}`}>
      {isOpen && (
        <Flex className={styles.sidebarFlex}>
          <Button
            as={Link}
            to="/"
            className={styles.sidebarButton}
            variant="ghost"
            color="white"
            leftIcon={<House />}
          >
            Home
          </Button>
          <Button
            as={Link}
            to="/series"
            className={styles.sidebarButton}
            variant="ghost"
            color="white"
            leftIcon={<MonitorPlay />}
          >
            Series
          </Button>
          <Button
            as={Link}
            to="/movies"
            className={styles.sidebarButton}
            variant="ghost"
            color="white"
            leftIcon={<Film />}
          >
            Movies
          </Button>

          <Divider my={4} borderColor="gray.600" />

          <Button
            as={Link}
            to="/playlist"
            className={styles.sidebarButton}
            variant="ghost"
            color="white"
            leftIcon={<CirclePlay />}
          >
            Playlist
          </Button>

          <Divider my={4} borderColor="gray.600" />

          <Box className={styles.chechboxgroup}>
            <Text className={styles.text}>Genre</Text>
            <CheckboxGroup
              value={selectedGenres}
              onChange={(values: string[]) => setSelectedGenres(values)}
            >
              <Stack className={styles.stack}>
                <Checkbox className={styles.checkbox} value="action">
                  Action
                </Checkbox>
                <Checkbox className={styles.checkbox} value="comedy">
                  Comedy
                </Checkbox>
                <Checkbox className={styles.checkbox} value="drama">
                  Drama
                </Checkbox>
                <Checkbox className={styles.checkbox} value="horror">
                  Horror
                </Checkbox>
                <Checkbox className={styles.checkbox} value="animation">
                  Animation
                </Checkbox>
              </Stack>
            </CheckboxGroup>
          </Box>

          {/* Country szűrés */}
          <Box className={styles.chechboxgroup}>
            <Text className={styles.text}>Country</Text>
            <CheckboxGroup
              value={selectedCountries}
              onChange={(values: string[]) => setSelectedCountries(values)}
            >
              <Stack className={styles.stack}>
                <Checkbox className={styles.checkbox} value="Hungary">
                  Hungary
                </Checkbox>
                <Checkbox className={styles.checkbox} value="Germany">
                  Germany
                </Checkbox>
                <Checkbox className={styles.checkbox} value="USA">
                  USA
                </Checkbox>
                <Checkbox className={styles.checkbox} value="China">
                  China
                </Checkbox>
                <Checkbox className={styles.checkbox} value="UK">
                  UK
                </Checkbox>
              </Stack>
            </CheckboxGroup>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default Sidebar;
