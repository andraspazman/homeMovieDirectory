import { FunctionComponent, useState } from "react";
import {
  Box,
  Flex,
  Button,
  Divider,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Film, MonitorPlay, House, CirclePlay } from "lucide-react"; // Ikonok importálása
import styles from "./Sidebar.module.scss";
import { SidebarProps } from "../../interfaces/IsidebarProps.types";

const Sidebar: FunctionComponent<SidebarProps> = ({
  isOpen,
  selectedGenres,
  setSelectedGenres,
  selectedDecades,
  setSelectedDecades,
}) => {
  
  const highestDecade = 2025; // Fix érték, de szükség esetén dinamikus is lehet
  const decadeOptions = [];
  for (let start = highestDecade; start > 2000; start -= 5) {
    let end = start - 5 + 1;
    if (start === 2005) {
      end = 2000;
    }
    decadeOptions.push(`${start}-${end}`);
  }

  return (
    <Box
      className={`${styles.sidebar} ${
        isOpen ? styles["sidebar-open"] : styles["sidebar-closed"]
      }`}
    >
      {isOpen && (
        <Flex className={styles.sidebarFlex} direction="column">
          {/* Gombok ikonokkal */}
          <Button
            as={Link}
            to="/"
            className={styles.sidebarButton}
            variant="ghost"
            color="white"
            leftIcon={<House size={20} />}
          >
            Home
          </Button>
          <Button
            as={Link}
            to="/series"
            className={styles.sidebarButton}
            variant="ghost"
            color="white"
            leftIcon={<MonitorPlay size={20} />}
          >
            Series
          </Button>
          <Button
            as={Link}
            to="/movies"
            className={styles.sidebarButton}
            variant="ghost"
            color="white"
            leftIcon={<Film size={20} />}
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
            leftIcon={<CirclePlay size={20} />}
          >
            Playlist
          </Button>
          <Divider my={4} borderColor="gray.600" />

          {/* GENRE-szűrők */}
          {selectedGenres && setSelectedGenres && (
            <Box className={styles.chechboxgroup}>
              <Text className={styles.text}>Genre</Text>
              <CheckboxGroup
                value={selectedGenres}
                onChange={(values: (string | number)[]) =>
                  setSelectedGenres(values as string[])
                }
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
          )}

          {/* DECade-szűrők */}
          {selectedDecades && setSelectedDecades && (
            <Box className={styles.chechboxgroup}>
              <Text className={styles.text}>Decade</Text>
              <CheckboxGroup
                value={selectedDecades}
                onChange={(values: (string | number)[]) =>
                  setSelectedDecades(values as string[])
                }
              >
                <Stack className={styles.stack}>
                  {decadeOptions.map((decade) => (
                    <Checkbox key={decade} className={styles.checkbox} value={decade}>
                      {decade}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </Box>
          )}
        </Flex>
      )}
    </Box>
  );
};

export default Sidebar;
