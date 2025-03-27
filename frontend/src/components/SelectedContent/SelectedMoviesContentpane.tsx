import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Flex,
  Box,
  Image,
  Text,
  Spinner,
  Heading,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useUser } from "../../context/UserContext";
import ProductionCompany from "../SelectedContent/ProductionCompany";
import { DirectorsAndCharacters } from "../SelectedContent/DirectorsAndCharacters";
import { MovieDTO } from "../../types/MovieDTO";
import { PersonWithCharacterDTO } from "../../types/PersonWithCharacterDTO";
import EditProductionCompanyModal from "../SelectedContentForms/EditProductionCompanyModal";
import AddProductionCompanyModal from "../../components/AddContent/AddProductionCompanyForm";
import styles from "./SelectedContentpane.module.scss";
import { ProductionCompanyDTO } from "../../types/ProductionCompanyDTO";
import { AddCharacterModal } from "../../components/AddContent/AddCharaterModal";
import { AddPersonModal } from "../AddContent/AddPersonForm";
import { EditMovieModal } from "../../components/SelectedContentForms/EditMovieModal";
import { FilePenLine } from "lucide-react";

const SelectedMovieContentPane = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const isLoggedIn = !!user;
  const toast = useToast();

  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [loadingMovie, setLoadingMovie] = useState<boolean>(true);
  const [errorMovie, setErrorMovie] = useState<string>("");

  // Production company state
  const [productionCompany, setProductionCompany] = useState<ProductionCompanyDTO | null>(null);

  // Persons and characters state
  const [persons, setPersons] = useState<PersonWithCharacterDTO[]>([]);
  const [characters, setCharacters] = useState<PersonWithCharacterDTO[]>([]);

  // Video modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Edit Movie modal controls
  const { isOpen: isEditMovieOpen, onOpen: onEditMovieOpen, onClose: onEditMovieClose } = useDisclosure();

  // Edit Production Company modal state
  const [isEditProductionCompanyOpen, setIsEditProductionCompanyOpen] = useState(false);
  const openEditProductionCompany = () => setIsEditProductionCompanyOpen(true);
  const closeEditProductionCompany = () => setIsEditProductionCompanyOpen(false);

  // Add Production Company modal state
  const [isAddProductionCompanyOpen, setIsAddProductionCompanyOpen] = useState(false);
  const openAddProductionCompany = () => setIsAddProductionCompanyOpen(true);
  const closeAddProductionCompany = () => setIsAddProductionCompanyOpen(false);

  // Add Character modal state
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [selectedPersonIdForCharacter, setSelectedPersonIdForCharacter] = useState<string | null>(null);
  const handleOpenAddCharacter = (personId: string) => {
    setSelectedPersonIdForCharacter(personId);
    setIsAddCharacterModalOpen(true);
  };

  // Add Person modal controls
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const handleOpenAddPerson = () => {
    setIsAddPersonModalOpen(true);
  };

  const handleAddProductionCompany = () => {
    if (!id) {
      toast({
        title: "Movie ID missing",
        description: "Cannot add production company without a valid movie ID.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    openAddProductionCompany();
  };

  const handleDeletePerson = (personId: string) => {
    axios
      .delete(`https://localhost:7204/person/${personId}`)
      .then(() => {
        setPersons((prev) => prev.filter((pwc) => pwc.person.id !== personId));
        toast({
          title: "Person deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Error deleting person:", err);
        toast({
          title: "Error deleting person",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleAddCharacter = (personId: string) => {
    toast({
      title: "Add character clicked",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleAddPerson = () => {
    toast({
      title: "Add person clicked",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Function to add the current movie to the user's playlist.
  const handleAddToPlaylist = async () => {
    if (!user || !movie) return;
    try {
      // First, fetch the user's playlist to get its ID.
      const playlistResponse = await fetch(`https://localhost:7204/playlist/user/${user.id}`);
      if (!playlistResponse.ok) {
        throw new Error("Failed to fetch user's playlist.");
      }
      const playlistData = await playlistResponse.json();
      const playlistId = playlistData.id; // Assuming the playlist object contains an 'id' field.

      // Prepare the payload. For a movie, we use the movie's id as moviesAndEpisodesId and set seriesId to null.
      const payload = {
        playlistId: playlistId,
        userId: user.id,
        moviesAndEpisodesId: movie.id,
        seriesId: null,
      };

      // Call the POST endpoint to add the movie to the playlist.
      const response = await fetch("https://localhost:7204/playlist/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to add movie to playlist.");
      }
      toast({
        title: "Added to Playlist",
        description: "The movie has been added to your playlist.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add movie to playlist.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Film details fetching (/movie/{id})
  useEffect(() => {
    if (!id) return;
    setLoadingMovie(true);
    axios
      .get<MovieDTO>(`https://localhost:7204/movie/${id}`)
      .then((response) => {
        setMovie(response.data);
        if ((response.data as any).productionCompany) {
          setProductionCompany((response.data as any).productionCompany);
        }
      })
      .catch((err) => {
        console.error("Error loading movie data:", err);
        setErrorMovie("Failed to load movie data.");
      })
      .finally(() => {
        setLoadingMovie(false);
      });
  }, [id]);

  // Production company fetching
  useEffect(() => {
    if (!id) return;
    axios
      .get<ProductionCompanyDTO>(`https://localhost:7204/episode/${id}/productioncompany`)
      .then((response) => {
        const data = response.data;
        setProductionCompany({
          id: data.id || "",
          name: data.name,
          website: data.website || "n/a",
        });
      })
      .catch((err) => {
        console.error("Error loading production company:", err);
        setProductionCompany(null);
      });
  }, [id]);

  // Persons fetching
  useEffect(() => {
    if (!id) return;
    axios
      .get<any[]>(`https://localhost:7204/episode/${id}/persons`)
      .then((response) => {
        const transformed = response.data.map((p) => {
          if (p.person) return p as PersonWithCharacterDTO;
          return {
            person: {
              id: p.id,
              name: p.name,
              role: p.role,
            },
            characters: [],
          };
        });
        setPersons(transformed);
      })
      .catch((err) => {
        console.error("Error loading persons:", err);
        setPersons([]);
      });
  }, [id]);

  // Characters fetching
  useEffect(() => {
    if (!id) return;
    axios
      .get<any[]>(`https://localhost:7204/character/episode/${id}/characters`)
      .then((response) => {
        const transformed = response.data.map((c) => {
          if (c.person) return c as PersonWithCharacterDTO;
          return {
            person: {
              id: c.id,
              name: c.characterName,
              role: c.role,
            },
            characters: [
              {
                id: c.id,
                characterName: c.characterName,
                role: c.role,
                nickName: c.nickName,
                episodeId: c.episodeId,
                personId: c.personId ? c.personId : c.id,
              },
            ],
          };
        });
        setCharacters(transformed);
      })
      .catch((err) => {
        console.error("Error loading characters:", err);
        setCharacters([]);
      });
  }, [id]);

  if (loadingMovie) {
    return (
      <Flex className={styles.loadingContainer}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (errorMovie || !movie) {
    return (
      <Box className={styles.errorBox}>
        <Text>{errorMovie || "No movie found."}</Text>
      </Box>
    );
  }

  // Filter directors.
  const directors = persons.filter((pwc) => pwc.person?.role === "director");

  return (
    <Box>
      <Flex className={styles.topSection} pr="10%" pl="10%">
        {/* Left Side: Cover Image and Buttons */}
        <Box className={styles.imageContainer}>
          <Image
            src={`https://localhost:7204/images/${movie.coverImagePath}`}
            alt={movie.title}
            className={styles.coverImage}
          />
          <Button colorScheme="blue" onClick={onOpen} mt={2}>
            Watch now
          </Button>
          {/* Add to Playlist button */}
          {isLoggedIn && (
            <Button colorScheme="green" onClick={handleAddToPlaylist} mt={2}>
              Add to Playlist
            </Button>
          )}
        </Box>

        {/* Right Side: Movie Details */}
        <Box className={styles.detailsContainer}>
          <Flex alignItems="center" mb={3}>
            <Heading size="xl">{movie.title}</Heading>
            {isLoggedIn && (
              <Button ml={3} colorScheme="yellow" size="sm" onClick={onEditMovieOpen}>
                <FilePenLine />
              </Button>
            )}
          </Flex>
          {movie.releaseYear && <Text><strong>Year:</strong> {movie.releaseYear}</Text>}
          <Text><strong>Genre:</strong> {movie.genre}</Text>
          <Text><strong>Language:</strong> {movie.language}</Text>
          {movie.award && <Text><strong>Award:</strong> {movie.award}</Text>}
          <Text mt={2}><strong>Description:</strong> {movie.description}</Text>
          
          {/* Production Company and other components */}
          <Flex direction="row" mt={4} gap={4}>
            <Box flex="1">
              <ProductionCompany
                name={productionCompany ? productionCompany.name : undefined}
                website={productionCompany ? productionCompany.website : undefined}
                isLoggedIn={isLoggedIn}
                onEdit={openEditProductionCompany}
                onAdd={handleAddProductionCompany}
              />
            </Box>
          </Flex>
        </Box>
        <Box flex="1">
          <DirectorsAndCharacters
            directors={directors}
            characters={persons.filter((pwc) => pwc.person?.role !== "director")}
            isLoggedIn={isLoggedIn}
            onDeletePerson={handleDeletePerson}
            onAddCharacter={handleOpenAddCharacter}
            onAddPerson={handleOpenAddPerson}
          />
        </Box>
      </Flex>

      {/* Video modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{movie.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <video width="100%" height="auto" controls>
              <source src={`https://localhost:7204/video/${movie.id}`} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </ModalBody>
          <ModalFooter>
            {/* Optional controls */}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Movie Modal */}
      <EditMovieModal
        isOpen={isEditMovieOpen}
        onClose={onEditMovieClose}
        movie={movie}
        onMovieUpdated={(updatedMovie: MovieDTO) => setMovie(updatedMovie)}
      />

      {/* Edit Production Company Modal */}
      {isEditProductionCompanyOpen && productionCompany && (
        <EditProductionCompanyModal
          isOpen={isEditProductionCompanyOpen}
          onClose={closeEditProductionCompany}
          productionCompany={productionCompany}
          onProductionCompanyUpdated={(updatedCompany) => {
            setProductionCompany(updatedCompany);
          }}
        />
      )}

      {/* Add Production Company Modal */}
      {isAddProductionCompanyOpen && (
        <AddProductionCompanyModal
          isOpen={isAddProductionCompanyOpen}
          onClose={closeAddProductionCompany}
          episodeId={id!}
          onProductionCompanyAdded={(newCompany) => {
            setProductionCompany(newCompany);
            setMovie((prev) => (prev ? { ...prev, productionCompany: newCompany } : prev));
            axios.get<ProductionCompanyDTO>(`https://localhost:7204/episode/${id}/productioncompany`)
              .then((response) => {
                const data = response.data;
                setProductionCompany({
                  id: data.id || "",
                  name: data.name,
                  website: data.website || "n/a"
                });
              })
              .catch((err) => console.error("Error reloading production company:", err));
            closeAddProductionCompany();
          }}
        />
      )}

      {isAddCharacterModalOpen && selectedPersonIdForCharacter && (
        <AddCharacterModal
          isOpen={isAddCharacterModalOpen}
          onClose={() => setIsAddCharacterModalOpen(false)}
          episodeId={id!}
          personId={selectedPersonIdForCharacter}
          onCharacterAdded={(newCharacter) => {
            setPersons((prev) =>
              prev.map((item) =>
                item.person.id === selectedPersonIdForCharacter
                  ? { ...item, characters: [...item.characters, newCharacter] }
                  : item
              )
            );
            setIsAddCharacterModalOpen(false);
          }}
        />
      )}

      {isAddPersonModalOpen && (
        <AddPersonModal
          isOpen={isAddPersonModalOpen}
          onClose={() => setIsAddPersonModalOpen(false)}
          episodeId={id!}
          onPersonAdded={(newPerson) => {
            setPersons((prev) => [...prev, { person: newPerson, characters: [] }]);
            setIsAddPersonModalOpen(false);
          }}
        />
      )}
    </Box>
  );
};

export default SelectedMovieContentPane;
