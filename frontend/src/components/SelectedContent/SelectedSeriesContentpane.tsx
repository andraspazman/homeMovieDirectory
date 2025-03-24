import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import * as api from "../../utils/ApiClient";
import {Flex,Box,Image,Text,Spinner,Heading,Button,Modal, ModalOverlay,ModalContent,ModalHeader,ModalCloseButton,ModalBody,useDisclosure,} from "@chakra-ui/react";
import { FilePenLine } from "lucide-react";
import styles from "./SelectedContentpane.module.scss";
import { SeriesDTO } from "../../types/SeriesDTO";
import { EpisodeDTO } from "../../types/EpisodeDTO";
import { EditSeriesModal } from "../SelectedContentForms/EditSeriesModal";
import { AddSeasonModal } from "../../components/AddContent/AddSeasonForm";
import { EditEpisodeModal } from "../SelectedContentForms/EditEpisodeModal";
import { EditSeasonModal } from "../SelectedContentForms/EditSeasonModal";
import EditProductionCompanyModal from "../SelectedContentForms/EditProductionCompanyModal";
import { AddEpisodeModal } from "../AddContent/AddEpisodeForm";
import { AddPersonModal } from "../AddContent/AddPersonForm";
import { useUser } from "../../context/UserContext";
import { useSeriesData } from "../../hooks/useSeriesData";
import { useEpisodeDetails } from "../../hooks/useEpisodeDetails";
import { AddCharacterModal } from "../../components/AddContent/AddCharaterModal";
import { DirectorsAndCharacters } from "../../components/SelectedContent/DirectorsAndCharacters";
import { PersonWithCharacterDTO } from "../../types/PersonWithCharacterDTO";
import { SeriesEpisodes } from "../SelectedContent/SeriesWithEpisodes";
import ProductionCompany from "../SelectedContent/ProductionCompany";
import { ProductionCompanyDTO } from "../../types/ProductionCompanyDTO";
import AddProductionCompanyModal from "../AddContent/AddProductionCompanyForm";

const SelectedSeriesContentPane = () => {
  const { id } = useParams();
  const { item, setItem, episodeId, seasonsWithEpisodes, setSeasonsWithEpisodes, loading, error } = useSeriesData(id!);
  const { personsWithCharacters, productionCompany: fetchedProductionCompany } = useEpisodeDetails(episodeId);
  const { user } = useUser();
  const toast = useToast();
  const isLoggedIn = !!user;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVideoPath, setSelectedVideoPath] = useState<string>("");

  // Lokális production company state: ha fetchedProductionCompany null, undefined-et állítunk be.
  const [localProductionCompany, setLocalProductionCompany] = useState<ProductionCompanyDTO | undefined>(fetchedProductionCompany ?? undefined);
  useEffect(() => {
    // Csak akkor állítsuk be, ha localProductionCompany még undefined
    if (!localProductionCompany && fetchedProductionCompany) {
      setLocalProductionCompany(fetchedProductionCompany);
    }
  }, [fetchedProductionCompany, localProductionCompany]);

  // Állapot az Add Production Company modal számára
  const [isAddProductionCompanyOpen, setIsAddProductionCompanyOpen] = useState(false);
  const openAddProductionCompany = () => setIsAddProductionCompanyOpen(true);
  const handleAddProductionCompany = () => {
    // If EP1 does not exist
    if (!episodeId) {
      toast({
        title: "No EP1 episode found",
        description: "Please add EP1 before adding a production company.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    openAddProductionCompany();
  };
  
  const closeAddProductionCompany = () => setIsAddProductionCompanyOpen(false);

  // Állapot az Edit Production Company modal számára
  const [isEditProductionCompanyOpen, setIsEditProductionCompanyOpen] = useState(false);
  const openEditProductionCompany = () => setIsEditProductionCompanyOpen(true);
  const closeEditProductionCompany = () => setIsEditProductionCompanyOpen(false);

  // Személy/karakter state és kezelők
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [selectedEpisodeForPerson, setSelectedEpisodeForPerson] = useState<string | null>(null);
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [selectedPersonIdForCharacter, setSelectedPersonIdForCharacter] = useState<string | null>(null);
  const handleAddCharacter = (personId: string) => {
    setSelectedPersonIdForCharacter(personId);
    setIsAddCharacterModalOpen(true);
  };

  const [localPersons, setLocalPersons] = useState<PersonWithCharacterDTO[]>(personsWithCharacters);
  useEffect(() => {
    setLocalPersons(personsWithCharacters);
  }, [personsWithCharacters]);

  // Series, season, episode modálisok
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
    if (!window.confirm("Are you sure you want to delete this episode?")) return;
    api
      .deleteEpisode(episodeId)
      .then(() =>
        setSeasonsWithEpisodes((prev) =>
          prev.map((entry) => ({ ...entry, episodes: entry.episodes.filter((ep) => ep.id !== episodeId) }))
        )
      )
      .catch((err) => {
        console.error("Error deleting episode:", err);
        alert("Failed to delete episode.");
      });
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

  const handleAddPerson = () => {
    if (!episodeId) {
      toast({
        title: "No EP1 episode found",
        description: "Please add EP1 before adding a person.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedEpisodeForPerson(episodeId);
    setIsAddPersonModalOpen(true);
  };

  const handleDeletePerson = (personId: string) => {
    if (!window.confirm("Are you sure you want to delete this person?")) return;
    api
      .deletePerson(personId)
      .then(() => {
        setLocalPersons((prev) => prev.filter((pwc) => pwc.person.id !== personId));
      })
      .catch((err) => {
        console.error("Error deleting person:", err);
        alert("Failed to delete person.");
      });
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

  if (loading) {
    return (<Flex className={styles.loadingContainer}><Spinner size="xl" /></Flex>);
  }
  if (error) {
    return (<Box className={styles.errorBox}><Text>{error}</Text></Box>);
  }
  if (!item) return null;

  const directors = localPersons.filter((pwc) => pwc.person.role === "director");
  const characters = localPersons.filter((pwc) => pwc.person.role !== "director");

  return (
    <Box>
      <Flex className={styles.topSection}>
        <Box className={styles.imageContainer}>
          <Image src={`https://localhost:7204/images/${item.coverImagePath}`} alt={item.title} className={styles.coverImage} />
        </Box>
        <Box className={styles.detailsContainer}>
          <Heading size="xl" mb={3}> {item.title}
            {isLoggedIn && (
              <Button size="sm" colorScheme="yellow" ml="2" onClick={() => openEditSeries(item)}><FilePenLine /></Button>
            )}
          </Heading>
          <Box mb={3} />
          <Text><strong>Year:</strong> {item.releaseYear}</Text>
          <Text><strong>Genre:</strong> {item.genre}</Text>
          <Text><strong>Description:</strong> {item.description}</Text>
          <ProductionCompany
            name={localProductionCompany ? localProductionCompany.name : undefined}
            website={localProductionCompany ? localProductionCompany.website : undefined}
            isLoggedIn={isLoggedIn}
            onEdit={openEditProductionCompany}
            onAdd={handleAddProductionCompany}
          />
        </Box>
          <DirectorsAndCharacters
            directors={directors}
            characters={characters}
            isLoggedIn={isLoggedIn}
            onDeletePerson={handleDeletePerson}
            onAddCharacter={handleAddCharacter}
            onAddPerson={handleAddPerson}
          />
      </Flex>
          <Box className={styles.lowerSection}>
            <SeriesEpisodes
              seasonsWithEpisodes={seasonsWithEpisodes}
              isLoggedIn={isLoggedIn}
              onAddSeason={openAddSeasonModal}
              onAddEpisode={handleAddEpisode}
              onEditEpisode={handleEditEpisode}
              onDeleteEpisode={handleDeleteEpisode}
              onEditSeason={handleEditSeason} onDeleteSeason={handleDeleteSeason} onWatchNow={handleWatchNow}
            />
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{item.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {selectedVideoPath ? (
                    <video width="100%" height="auto" controls><source src={selectedVideoPath} type="video/mp4" />Your browser does not support video playback.</video>
                  ) : (
                    <Text>No video available.</Text>
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>
      </Box>
      {isEditSeriesOpen && editSeriesData && (
        <EditSeriesModal isOpen={isEditSeriesOpen} onClose={closeEditSeries} series={editSeriesData} onSeriesUpdated={(updatedSeries) => setItem(updatedSeries)} />
      )}

      {isAddSeasonOpen && item && (
        <AddSeasonModal isOpen={isAddSeasonOpen} onClose={closeAddSeasonModal} seriesId={item.id} onSeasonAdded={handleSeasonAdded}/>
      )}

      {isEditEpisodeModalOpen && selectedEpisode && (
        <EditEpisodeModal isOpen={isEditEpisodeModalOpen} onClose={() => setIsEditEpisodeModalOpen(false)} episode={selectedEpisode}
          onEpisodeUpdated={(updatedEpisode) => {
            console.log("Episode updated:", updatedEpisode);
            setIsEditEpisodeModalOpen(false);
          }}
        />
      )}

      {isAddEpisodeModalOpen && selectedSeasonForEpisode && (
        <AddEpisodeModal isOpen={isAddEpisodeModalOpen} onClose={() => setIsAddEpisodeModalOpen(false)} seasonId={selectedSeasonForEpisode}
          onEpisodeAdded={(newEpisode: EpisodeDTO) => {
            setSeasonsWithEpisodes((prev) =>
              prev.map((entry) =>
                entry.season.id === selectedSeasonForEpisode ? { season: entry.season, episodes: [...entry.episodes, newEpisode] }: entry
              )
            );
          }}
        />
      )}

      {isEditSeasonModalOpen && selectedSeason && (
        <EditSeasonModal isOpen={isEditSeasonModalOpen}  onClose={() => setIsEditSeasonModalOpen(false)} season={selectedSeason}
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
      {isAddPersonModalOpen && selectedEpisodeForPerson && (
        <AddPersonModal isOpen={isAddPersonModalOpen} onClose={() => setIsAddPersonModalOpen(false)} episodeId={selectedEpisodeForPerson}
          onPersonAdded={(newPerson) => {
            console.log("New person added:", newPerson);
            setLocalPersons((prev) => [...prev, { person: newPerson, characters: [] }]);
            setIsAddPersonModalOpen(false);
          }}
        />
      )}
      {isAddCharacterModalOpen && selectedPersonIdForCharacter && episodeId && (
        <AddCharacterModal isOpen={isAddCharacterModalOpen} onClose={() => setIsAddCharacterModalOpen(false)} episodeId={episodeId}
          personId={selectedPersonIdForCharacter}
          onCharacterAdded={(newCharacter) => {
            setLocalPersons((prev) =>
              prev.map((p) =>
                p.person.id === selectedPersonIdForCharacter ? { ...p, characters: p.characters ? [...p.characters, newCharacter] : [newCharacter] } : p
              )
            );
            setIsAddCharacterModalOpen(false);
          }}
        />
      )}
      {isEditProductionCompanyOpen && localProductionCompany && (
        <EditProductionCompanyModal isOpen={isEditProductionCompanyOpen}  onClose={closeEditProductionCompany}  productionCompany={localProductionCompany}
          onProductionCompanyUpdated={(updatedCompany) => {
            setLocalProductionCompany(updatedCompany);     
            setItem({ ...item, productionCompany: updatedCompany } as SeriesDTO & { productionCompany: ProductionCompanyDTO });
          }}
        />
      )}
      {isAddProductionCompanyOpen && (
        <AddProductionCompanyModal isOpen={isAddProductionCompanyOpen} onClose={closeAddProductionCompany}  episodeId={episodeId!}
          onProductionCompanyAdded={(newCompany) => {
            setLocalProductionCompany(newCompany);
            setItem({ ...item, productionCompany: newCompany } as SeriesDTO & { productionCompany: ProductionCompanyDTO });
          }}
        />
      )}
    </Box>
  );
};

export default SelectedSeriesContentPane;
