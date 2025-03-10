import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Flex, Box, Image, Text, Spinner, Heading, UnorderedList, ListItem, Button, 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure
} from "@chakra-ui/react";
import { FilePenLine, SquarePlus, Trash2 } from "lucide-react";
import styles from "./SelectedContentpane.module.scss";

// Importáljuk a frontend DTO-kat (interface-eket)
import { SeriesDTO } from "../../types/SeriesDTO";
import { PersonWithCharacterDTO } from "../../types/PersonWithCharacterDTO";
import { ProductionCompanyDTO } from "../../types/ProductionCompanyDTO";
import { SeasonDTO } from "../../types/SeasonDTO";
import { EpisodeDTO } from "../../types/EpisodeDTO";
import { EpisodeIdDTO } from "../../types/EpisodeIdDTO";

import { EditSeriesModal } from "../SelectedContentForms/EditSeriesModal";
import { AddSeasonModal } from "../../components/AddContent/AddSeasonForm";


import { useUser } from "../../context/UserContext";




const SelectedSeriesContentPane = () => {
  const { id } = useParams();

  const [item, setItem] = useState<SeriesDTO | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [personsWithCharacters, setPersonsWithCharacters] = useState<PersonWithCharacterDTO[]>([]);
  const [productionCompany, setProductionCompany] = useState<ProductionCompanyDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { user } = useUser();
  const isLoggedIn = !!user;

  // Tömb: { season: SeasonDTO, episodes: EpisodeDTO[] }
  const [seasonsWithEpisodes, setSeasonsWithEpisodes] = useState<Array<{
    season: SeasonDTO;
    episodes: EpisodeDTO[];
  }>>([]);

  const [selectedVideoPath, setSelectedVideoPath] = useState<string>("");

  // Videólejátszás modál
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Edit Series modal
  const [isEditSeriesOpen, setIsEditSeriesOpen] = useState(false);
  const [editSeriesData, setEditSeriesData] = useState<SeriesDTO | null>(null);

  const openEditSeries = (series: SeriesDTO) => {
    setEditSeriesData(series);
    setIsEditSeriesOpen(true);
  };
  const closeEditSeries = () => setIsEditSeriesOpen(false);

  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const openAddSeasonModal = () => setIsAddSeasonOpen(true);
  const closeAddSeasonModal = () => setIsAddSeasonOpen(false);

  // Callback a frissítéshez
  const handleSeasonAdded = (newSeason: SeasonDTO) => {
    // Ha az új évadnak még nincsenek epizódjai, üres tömbbel jelenítjük meg
    const newEntry = { season: newSeason, episodes: [] };
  
    // Az új season hozzáadása a meglévő tömbhöz; opcionálisan rendezheted is a tömböt
    setSeasonsWithEpisodes((prev) => {
      const updated = [...prev, newEntry];
      // Rendezés seasonNumber szerint (növekvő sorrendbe)
      updated.sort((a, b) => a.season.seasonNumber - b.season.seasonNumber);
      return updated;
    });
  };

  // Endpointok
  const seriesEndpoint = `https://localhost:7204/series/${id}`;
  const episodeIdEndpoint = `https://localhost:7204/series/${id}/ep1-id`;
  const seasonsEndpoint = `https://localhost:7204/seasons/byseries/${id}`;

  // 1. Sorozat adatok lekérése
  useEffect(() => {
    if (!seriesEndpoint) return;
    setLoading(true);

    axios
      .get<SeriesDTO>(seriesEndpoint)
      .then((response) => {
        setItem(response.data);
      })
      .catch((err) => {
        console.error("Error loading series data:", err);
        setError("Failed to load series data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [seriesEndpoint]);

  // 2. EP1 episodeId lekérése
  useEffect(() => {
    if (!episodeIdEndpoint) return;
    axios
      .get<EpisodeIdDTO>(episodeIdEndpoint)
      .then((response) => {
        setEpisodeId(response.data.episodeId);
      })
      .catch((err) => {
        console.error("Error loading episode id:", err);
      });
  }, [episodeIdEndpoint]);

  // 3. Karakterek + produkciós cég lekérése az EP1-hez
  useEffect(() => {
    if (!episodeId) return;

    axios
      .get<PersonWithCharacterDTO[]>(`https://localhost:7204/character/episode/${episodeId}/persons-with-characters`)
      .then((response) => {
        setPersonsWithCharacters(response.data);
      })
      .catch((err) => {
        console.error("Error loading persons with characters:", err);
      });

    axios
      .get<ProductionCompanyDTO>(`https://localhost:7204/episode/${episodeId}/productioncompany`)
      .then((response) => {
        setProductionCompany(response.data);
      })
      .catch((err) => {
        console.error("Error loading production company:", err);
      });
  }, [episodeId]);

  // 4. Lekérjük az összes seasont, majd mindegyikhez az epizódokat.
  useEffect(() => {
    if (!id) return;
    axios
      .get<SeasonDTO[]>(seasonsEndpoint)
      .then(async (seasonResponse) => {
        const seasonsData = seasonResponse.data;
        // Promise-okkal kérjük le minden season epizódjait
        const promises = seasonsData.map(async (s) => {
          const epResponse = await axios.get<EpisodeDTO[]>(`https://localhost:7204/episode/season/${s.id}`);
          return { season: s, episodes: epResponse.data };
        });

        const results = await Promise.all(promises);

        // Rendezés seasonNumber szerint
        results.sort((a, b) => {
          return a.season.seasonNumber - b.season.seasonNumber;
        });
        setSeasonsWithEpisodes(results);
      })
      .catch((err) => {
        console.error("Error loading seasons or episodes:", err);
        setError("Failed to load seasons or episodes data.");
      });
  }, [id, seasonsEndpoint]);

  // Video: "Watch now" button
  const handleWatchNow = (videoPath?: string) => {
    if (!isLoggedIn) {
      alert("Login or register to watch");
      return;
    }
    setSelectedVideoPath(videoPath || "");
    onOpen();
  };

  // Placeholder callbackek
  const handleAddPerson = () => console.log("Add Person clicked");
  const handleDeletePerson = (personId: string) => console.log("Edit Person clicked, ID:", personId);
  const handleAddCharacter = () => console.log("Add Character clicked");
  const handleAddSeason = () => console.log("Add Season clicked");
  const handleEditSeason = (seasonId: string) => console.log("Edit Season clicked, ID:", seasonId);
  const handleDeleteSeason = (seasonId: string) => console.log("Delete Season clicked, ID:", seasonId);
  const handleAddEpisode = (seasonId: string) => console.log("Add Episode clicked, SeasonId:", seasonId);
  const handleEditEpisode = (episodeId: string) => console.log("Edit Episode clicked, ID:", episodeId);
  const handleDeleteEpisode = (episodeId: string) => console.log("Delete Episode clicked, ID:", episodeId);

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------
  if (loading) {
    return (
      <Flex className={styles.loadingContainer}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box className={styles.errorBox}>
        <Text>{error}</Text>
      </Box>
    );
  }

  if (!item) {
    return null;
  }

  // **Itt választjuk szét Director és characters**:
  const directors = personsWithCharacters.filter(
    (pwc) => pwc.person.role === "director"
  );
  const characters = personsWithCharacters.filter(
    (pwc) => pwc.person.role !== "director"
  );

  return (
    <Box>
      <Flex className={styles.topSection}>
        <Box className={styles.imageContainer}>
          <Image 
            src={`https://localhost:7204/images/${item.coverImagePath}`} alt={item.title} className={styles.coverImage}
          />
        </Box>

        <Box className={styles.detailsContainer}>
          <Heading size="xl" mb={3}>{item.title}
          {isLoggedIn &&(<Button size="sm" colorScheme="yellow" ml={"2"} onClick={() => openEditSeries(item)}> <FilePenLine /> </Button>)}
          </Heading> 
          <Box mb={3}> 
          </Box>
          <Text><strong>Year:</strong> {item.releaseYear}</Text>
          <Text><strong>Genre:</strong> {item.genre}</Text>
          <Text><strong>Description:</strong> {item.description}</Text>
          <Text><strong>Production Company:</strong> {productionCompany ? productionCompany.name : "n/a"} </Text>
          <Text><strong>Website:</strong> {productionCompany ? productionCompany.website : "n/a"} </Text>
        </Box>
        <Box className={styles.castContainer}  border="1px solid #ccc" borderRadius="md"  p={10} >
          <Heading size="sm" mb={2}>Director(s)</Heading>
          {directors.length > 0 ? (
            <UnorderedList>
              {directors.map((pwc) => (
                <ListItem  key={pwc.person.id}>
                  {pwc.person.name}
                  {isLoggedIn &&( <Button size="xs" colorScheme="white" color={"black"} onClick={() => handleDeletePerson(pwc.person.id)}> <Trash2 /> </Button>)}
                  {pwc.characters && pwc.characters.length > 0 && (<UnorderedList> {pwc.characters.map((character) => ( <ListItem key={character.id}> {character.characterName} </ListItem>))}</UnorderedList>)}
                </ListItem>
              ))}
            </UnorderedList>
          ) : (
            <Text>No director found.</Text>
          )}

          <Box mt={4} />
          <Heading size="sm" mb={2}>Cast &amp; Characters</Heading>
          {characters.length > 0 ? (
            <UnorderedList>
              {characters.map((pwc) => (
                <ListItem key={pwc.person.id} >
                  {pwc.person.name} {pwc.person.role && `(${pwc.person.role})`}{" "} 
                  {isLoggedIn &&( <Button size="xs"  colorScheme="white" color={"black"} onClick={() => handleDeletePerson(pwc.person.id)}><Trash2 /> </Button>)}
                  {pwc.characters && pwc.characters.length > 0 && (
                    <UnorderedList>
                      {pwc.characters.map((character) => (
                        <ListItem key={character.id}> {character.characterName} {character.nickName ? ` - ${character.nickName}` : ""} {character.role ? ` (${character.role})` : ""} </ListItem>
                      ))}
                    </UnorderedList>
                  )}
                </ListItem>
              ))}
            </UnorderedList>
          ) : (
            <Text>No cast information provided.</Text>
          )}
          {/* People/Characters buttons */}
          <Box mb={2} mt={5}>
          {isLoggedIn &&(  <Button size="xs" colorScheme="green" mr={2} onClick={handleAddPerson}> Add Person <SquarePlus /> </Button>)}
          {isLoggedIn &&(   <Button size="xs" colorScheme="green" onClick={handleAddCharacter}> Add Character <SquarePlus /> </Button>)} 
          </Box>
        </Box>
      </Flex>

      {/* Alsó rész: Megjelenítjük az összes season-t és epizódot */}
      <Box className={styles.lowerSection}>
        <Heading size="md" mb={4}>Seasons &amp; Episodes
         {isLoggedIn &&( <Button size="s" colorScheme="green" ml={2} onClick={openAddSeasonModal}> <SquarePlus /> </Button>)}
        </Heading>
       
        {seasonsWithEpisodes.length > 0 ? (
          <UnorderedList styleType="none" ml={0}>
            {seasonsWithEpisodes.map((entry) => {
              const { season, episodes } = entry;
              return (
                <ListItem  key={season.id}  border="1px solid #ccc" p={3}  mb={4}  borderRadius="md">
                  <Box mb={2}>
                    <Text fontWeight="bold" display="inline-block" mr={2}> Season {season.seasonNumber} ({season.releaseYear}) </Text>
                    {/* Buttons for addm edit, delete */}
                    {isLoggedIn && (<Button size="xs" mr={1} onClick={() => handleAddEpisode(season.id)}> <SquarePlus /> </Button>)}
                    {isLoggedIn && ( <Button size="xs" mr={2} onClick={() => handleEditSeason(season.id)} ><FilePenLine /></Button> )}
                    {isLoggedIn && ( <Button size="xs" onClick={() => handleDeleteSeason(season.id)}> <Trash2 /></Button> )}
                  </Box>

                  {episodes.length > 0 ? (
                    <UnorderedList styleType="disc" ml={4} fontWeight="semibold" >
                      {episodes.map((ep) => (
                        <ListItem key={ep.id} mb={2}>
                          {ep.title}{" "}
                          <Button size="xs" colorScheme="blue"  ml={2}  onClick={() => handleWatchNow(ep.videoPath)} > Watch now </Button>
                          { isLoggedIn && ( <Button  size="xs" ml={2} onClick={() => handleEditEpisode(ep.id)}> <FilePenLine /> </Button>)}
                          { isLoggedIn && ( <Button size="xs"  ml={2} onClick={() => handleDeleteEpisode(ep.id)}><Trash2 /> </Button>) }
                        </ListItem>
                      ))}
                    </UnorderedList>
                  ) : (
                    <Text mt={2}>No episodes found for this season.</Text>
                  )}
                </ListItem>
              );
            })}
          </UnorderedList>
        ) : (
          <Text>No seasons found for this series.</Text>
        )}

        {/* Modal a video lejátszáshoz */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{item.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedVideoPath ? ( <video width="100%" height="auto" controls> <source  src={selectedVideoPath}  type="video/mp4" />Your browser does not support video playback. </video>
              ) : (
                <Text>No video available.</Text>
              )}
            </ModalBody>
            <ModalFooter>
              {/* Optionally extra controls */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>

      {/* EditSeriesModal conditionAL rendering */}
      {isEditSeriesOpen && editSeriesData && (<EditSeriesModal isOpen={isEditSeriesOpen} onClose={closeEditSeries} series={editSeriesData} onSeriesUpdated={(updatedSeries) => {setItem(updatedSeries);}}/>)}
      {isAddSeasonOpen && ( <AddSeasonModal isOpen={isAddSeasonOpen} onClose={closeAddSeasonModal} seriesId={item.id} onSeasonAdded={handleSeasonAdded}/>
)}
    </Box>
  );
};

export default SelectedSeriesContentPane;
