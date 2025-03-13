import { useState } from "react";
import { useParams } from "react-router-dom";
import * as api from "../../utils/api";
import { Flex, Box, Image,Text,Spinner,Heading,UnorderedList,ListItem,Button,Modal,ModalOverlay,ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,useDisclosure,} from "@chakra-ui/react";
import { FilePenLine, SquarePlus, Trash2 } from "lucide-react";
import styles from "./SelectedContentpane.module.scss";
import { SeriesDTO } from "../../types/SeriesDTO";
import { EpisodeDTO } from "../../types/EpisodeDTO";
import { EditSeriesModal } from "../SelectedContentForms/EditSeriesModal";
import { AddSeasonModal } from "../../components/AddContent/AddSeasonForm";
import { EditEpisodeModal } from "../SelectedContentForms/EditEpisodeModal";
import { EditSeasonModal } from "../SelectedContentForms/EditSeasonModal";
import { AddEpisodeModal } from "../AddContent/AddEpisodeForm";
import { useUser } from "../../context/UserContext";
import { useSeriesData } from "../../hooks/useSeriesData";
import { useEpisodeDetails } from "../../hooks/useEpisodeDetails";

const SelectedSeriesContentPane = () => {
  const { id } = useParams();
  const { item, setItem, episodeId, seasonsWithEpisodes, setSeasonsWithEpisodes, loading, error } = useSeriesData(id!);
  const { personsWithCharacters, productionCompany } = useEpisodeDetails(episodeId);
  const { user } = useUser();
  const isLoggedIn = !!user;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVideoPath, setSelectedVideoPath] = useState<string>("");

  // Modals for editing/adding
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

  const handleSeasonAdded = (newSeason: any) => {
    const newEntry = { season: newSeason, episodes: [] };
    setSeasonsWithEpisodes((prev) => {
      const updated = [...prev, newEntry];
      updated.sort((a, b) => a.season.seasonNumber - b.season.seasonNumber);
      return updated;
    });
  };

  const [isEditEpisodeModalOpen, setIsEditEpisodeModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeDTO | null>(null);

  const handleEditEpisode = (episodeId: string) => {
    const allEpisodes = seasonsWithEpisodes.flatMap((entry) => entry.episodes);
    const foundEpisode = allEpisodes.find((ep) => ep.id === episodeId);
      if (foundEpisode) {
        setSelectedEpisode(foundEpisode);
        setIsEditEpisodeModalOpen(true);
      } else {
        console.error("Episode not found for editing");
      }
  };

  const [isEditSeasonModalOpen, setIsEditSeasonModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const handleEditSeason = (seasonId: string) => {
    const foundSeason = seasonsWithEpisodes.find((entry) => entry.season.id === seasonId)?.season;
      if (foundSeason) {
        setSelectedSeason(foundSeason);
        setIsEditSeasonModalOpen(true);
      } else {
        console.error("Season not found for editing");
      }
  };

  const handleDeleteEpisode = (episodeId: string) => {
    if (window.confirm("Are you sure you want to delete this episode?")) {
      api
        .deleteEpisode(episodeId)
        .then(() => {
          setSeasonsWithEpisodes((prev) =>
            prev.map((entry) => ({
              ...entry,
              episodes: entry.episodes.filter((ep) => ep.id !== episodeId),
            }))
          );
        })
        .catch((err) => {
          console.error("Error deleting episode:", err);
          alert("Failed to delete episode.");
        });
    }
  };

  const handleDeleteSeason = (seasonId: string) => {
    if (window.confirm("Are you sure to delete this season?")) {
      api
        .deleteSeason(seasonId)
        .then(() => {
          setSeasonsWithEpisodes((prev) => prev.filter((entry) => entry.season.id !== seasonId));
        })
        .catch((err) => {
          console.error("Error deleting season:", err);
          alert("Season deletion failed. It might contain episodes.");
        });
    }
  };

  const [isAddEpisodeModalOpen, setIsAddEpisodeModalOpen] = useState(false);
  const [selectedSeasonForEpisode, setSelectedSeasonForEpisode] = useState<string | null>(null);
  const handleAddEpisode = (seasonId: string) => {
    if (!isLoggedIn) {
      alert("You must login to add an episode!");
      return;
    }
    setSelectedSeasonForEpisode(seasonId);
    setIsAddEpisodeModalOpen(true);
  };

  const handleWatchNow = (epId?: string) => {
    if (!isLoggedIn) {
      alert("Login or register to watch");
      return;
    }
    if (epId) {
      setSelectedVideoPath(`https://localhost:7204/video/episode/${epId}`);
    } else {
      setSelectedVideoPath("");
    }
    onOpen();
  };

  const handleAddPerson = () => console.log("Add Person clicked");
  const handleDeletePerson = (personId: string) => console.log("Delete Person clicked, ID:", personId);
  const handleAddCharacter = () => console.log("Add Character clicked");

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
  if (!item) return null;

  const directors = personsWithCharacters.filter((pwc) => pwc.person.role === "director");
  const characters = personsWithCharacters.filter((pwc) => pwc.person.role !== "director");

  return (
    <Box>
      <Flex className={styles.topSection}>
        <Box className={styles.imageContainer}>
          <Image src={`https://localhost:7204/images/${item.coverImagePath}`} alt={item.title} className={styles.coverImage} />
        </Box>
        <Box className={styles.detailsContainer}>
          <Heading size="xl" mb={3}> {item.title}{isLoggedIn && (<Button size="sm" colorScheme="yellow" ml="2" onClick={() => openEditSeries(item)}><FilePenLine /></Button>)}</Heading>
            <Box mb={3} />
              <Text><strong>Year:</strong> {item.releaseYear}</Text>
              <Text><strong>Genre:</strong> {item.genre}</Text>
              <Text><strong>Description:</strong> {item.description}</Text>
              <Text><strong>Production Company:</strong> {productionCompany ? productionCompany.name : "n/a"}</Text>
              <Text><strong>Website:</strong> {productionCompany ? productionCompany.website : "n/a"}</Text>
          </Box>
        <Box className={styles.castContainer} border="1px solid #ccc" borderRadius="md" p={10}>
          <Heading size="sm" mb={2}>Director(s)</Heading>
          {directors.length > 0 ? (
            <UnorderedList>
              {directors.slice(0, 2).map((pwc) => (
                <ListItem key={pwc.person.id}>
                  {pwc.person.name}
                  {isLoggedIn && (<Button size="xs" color="red" colorScheme="white" onClick={() => handleDeletePerson(pwc.person.id)}><Trash2 size={20} /></Button>)}
                  {pwc.characters && pwc.characters.length > 0 && (
                    <UnorderedList>{pwc.characters.slice(0, 5).map((character) => (<ListItem key={character.id}>{character.characterName}</ListItem>))}</UnorderedList>
                  )}
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
              {characters.slice(0, 5).map((pwc) => (
                <ListItem key={pwc.person.id}>
                  {pwc.person.name} {pwc.person.role && `(${pwc.person.role})`}{" "}
                  {isLoggedIn && (<Button size="xs" color="red" colorScheme="white" onClick={() => handleDeletePerson(pwc.person.id)}><Trash2 size={20} /></Button>)}
                  {pwc.characters && pwc.characters.length > 0 && (
                    <UnorderedList>
                      {pwc.characters.slice(0, 5).map((character) => (
                        <ListItem key={character.id}>
                          {character.characterName} {character.nickName ? ` - ${character.nickName}` : ""}{" "}
                          {character.role ? ` (${character.role})` : ""}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  )}
                </ListItem>
              ))}
            </UnorderedList>
          ) : (
            <Text>No cast information provided.</Text>
          )}
          <Box mb={2} mt={5}>
            {isLoggedIn && (<Button size="xs" colorScheme="green" mr={2} onClick={handleAddPerson}>Add Person <SquarePlus /></Button>)}
            {isLoggedIn && (<Button size="xs" colorScheme="green" onClick={handleAddCharacter}>Add Character <SquarePlus /></Button> )}
          </Box>
        </Box>
      </Flex>

      <Box className={styles.lowerSection}>
        <Heading size="md" mb={4}>
          Seasons &amp; Episodes
          {isLoggedIn && (<Button size="s" colorScheme="green" ml={2} onClick={openAddSeasonModal}><SquarePlus /></Button> )}
        </Heading>
        {seasonsWithEpisodes.length > 0 ? (
          <UnorderedList styleType="none" ml={0}>
            {seasonsWithEpisodes.map((entry) => {
              const { season, episodes } = entry;
              return (
                <ListItem key={season.id} border="1px solid #ccc" p={3} mb={4} borderRadius="md">
                  <Box mb={2}>
                    <Text fontWeight="bold" display="inline-block" mr={2}>Season {season.seasonNumber} ({season.releaseYear})</Text>
                    {isLoggedIn && (
                      <>
                        <Button size="xs" color="green" mr={1} onClick={() => handleAddEpisode(season.id)}><SquarePlus size={17} /></Button>
                        <Button size="xs" color="orange" mr={2} onClick={() => handleEditSeason(season.id)}><FilePenLine size={17} /></Button>
                        <Button size="xs" color="red" onClick={() => handleDeleteSeason(season.id)}><Trash2 size={17} /></Button>
                      </>
                    )}
                  </Box>
                  {episodes.length > 0 ? (
                    <UnorderedList styleType="disc" ml={4} fontWeight="semibold">
                      {episodes.map((ep) => (
                        <ListItem key={ep.id} mb={2} p={1}>
                          {isLoggedIn && (
                            <>
                              <Button size="xs" color="orange" mr={1} onClick={() => handleEditEpisode(ep.id)}><FilePenLine size={13} /></Button>
                              <Button size="xs" color="red" mr={1} onClick={() => handleDeleteEpisode(ep.id)}><Trash2 size={13} /></Button>
                            </>
                          )}
                          {ep.title}{" "}
                          <Button size="s" colorScheme="blue" p={1} ml={3} onClick={() => handleWatchNow(ep.id)}>Watch now</Button>
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

        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{item.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedVideoPath ? (
                <video width="100%" height="auto" controls> <source src={selectedVideoPath} type="video/mp4" />Your browser does not support video playback.</video>
              ) : (
                <Text>No video available.</Text>
              )}
            </ModalBody>
            <ModalFooter>{/* Optionally extra controls */}</ModalFooter>
          </ModalContent>
        </Modal>
      </Box>

      {isEditSeriesOpen && editSeriesData && (
        <EditSeriesModal
          isOpen={isEditSeriesOpen}
          onClose={closeEditSeries}
          series={editSeriesData}
          onSeriesUpdated={(updatedSeries) => setItem(updatedSeries)}
        />
      )}
      {isAddSeasonOpen && item && (
        <AddSeasonModal
          isOpen={isAddSeasonOpen}
          onClose={closeAddSeasonModal}
          seriesId={item.id}
          onSeasonAdded={handleSeasonAdded}
        />
      )}
      {isEditEpisodeModalOpen && selectedEpisode && (
        <EditEpisodeModal
          isOpen={isEditEpisodeModalOpen}
          onClose={() => setIsEditEpisodeModalOpen(false)}
          episode={selectedEpisode}
          onEpisodeUpdated={(updatedEpisode) => {
            console.log("Episode updated:", updatedEpisode);
            setIsEditEpisodeModalOpen(false);
          }}
        />
      )}
      {isAddEpisodeModalOpen && selectedSeasonForEpisode && (
        <AddEpisodeModal
          isOpen={isAddEpisodeModalOpen}
          onClose={() => setIsAddEpisodeModalOpen(false)}
          seasonId={selectedSeasonForEpisode}
          onEpisodeAdded={(newEpisode: EpisodeDTO) => {
            setSeasonsWithEpisodes((prev) =>
              prev.map((entry) =>
                entry.season.id === selectedSeasonForEpisode
                  ? { season: entry.season, episodes: [...entry.episodes, newEpisode] }
                  : entry
              )
            );
          }}
        />
      )}
      {isEditSeasonModalOpen && selectedSeason && (
        <EditSeasonModal
          isOpen={isEditSeasonModalOpen}
          onClose={() => setIsEditSeasonModalOpen(false)}
          season={selectedSeason}
          onSeasonUpdated={(updatedSeason) => {
            setSeasonsWithEpisodes((prev) =>
              prev.map((entry) =>
                entry.season.id === updatedSeason.id ? { ...entry, season: updatedSeason } : entry
              )
            );
            setIsEditSeasonModalOpen(false);
          }}
        />
      )}
    </Box>
  );
};

export default SelectedSeriesContentPane;
