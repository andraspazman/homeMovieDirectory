import React, { useEffect, useState } from "react";
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  ModalFooter, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  useToast,
  Select,
  Progress
} from "@chakra-ui/react";
import axios from "axios";
import { MovieDTO } from "../../types/MovieDTO";

interface EditMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieDTO; // a kiválasztott film adatai
  onMovieUpdated: (updated: MovieDTO) => void;
}

export const EditMovieModal: React.FC<EditMovieModalProps> = ({ isOpen, onClose, movie, onMovieUpdated }) => {
  const [title, setTitle] = useState(movie.title);
  const [genre, setGenre] = useState(movie.genre);
  const [releaseYear, setReleaseYear] = useState<number>(movie.releaseYear || 0);
  const [description, setDescription] = useState(movie.description);
  const [language, setLanguage] = useState(movie.language);
  const [award, setAward] = useState(movie.award || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const toast = useToast();

  // Statikus opciók a lenyíló listákhoz
  const genreOptions = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"];
  const languageOptions = ["English", "Hungarian", "French", "German", "Spanish", "Italian"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(new Array(50), (_, i) => currentYear - i);

  useEffect(() => {
    setTitle(movie.title);
    setGenre(movie.genre);
    setReleaseYear(movie.releaseYear || 0);
    setDescription(movie.description);
    setLanguage(movie.language);
    setAward(movie.award || "");
    setVideoFile(null);
    setCoverImage(null);
    setVideoUploadProgress(0);
  }, [movie]);

  const handleUpdate = async () => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("releaseYear", releaseYear.toString());
      formData.append("description", description);
      formData.append("language", language);
      formData.append("award", award);
      formData.append("isMovie", movie.isMovie.toString());
      
      if (videoFile) {
        formData.append("newVideoFile", videoFile);
      } else {
        formData.append("videoPath", movie.videoPath || "");
      }
      
      if (coverImage) {
        formData.append("newCoverImage", coverImage);
      } else {
        formData.append("coverImagePath", movie.coverImagePath || "");
      }
      
      const response = await axios.put<MovieDTO>(
        `https://localhost:7204/movie/${movie.id}`, 
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? 1;
            const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
            setVideoUploadProgress(percentCompleted);
          }
        }
      );
      
      onMovieUpdated(response.data);
      toast({
        title: "Movie updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error("Error updating movie:", err);
      toast({
        title: "Error updating movie",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Movie</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Genre</FormLabel>
            <Select value={genre} onChange={(e) => setGenre(e.target.value)}>
              {genreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Release Year</FormLabel>
            <Select value={releaseYear} onChange={(e) => setReleaseYear(parseInt(e.target.value))}>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Language</FormLabel>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Award</FormLabel>
            <Input value={award} onChange={(e) => setAward(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Video File</FormLabel>
            <Input 
              type="file" 
              accept="video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setVideoFile(e.target.files[0]);
                }
              }}
            />
          </FormControl>
          {/* Megjelenítjük a feltöltési csíkot, amíg a video file feltöltés folyamatban van */}
          {videoFile && isUploading && (
            <Progress value={videoUploadProgress} size="sm" colorScheme="blue" mb={3} />
          )}
          <FormControl mb={3}>
            <FormLabel>Cover Image</FormLabel>
            <Input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCoverImage(e.target.files[0]);
                }
              }}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            onClick={handleUpdate} 
            isLoading={isUploading}
            loadingText="Updating"
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
