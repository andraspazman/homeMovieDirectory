import React, { useState, FormEvent, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  RadioGroup,
  Radio,
  Stack,
  Select,
  useToast,
  Progress,
} from "@chakra-ui/react";
import axios from "axios";

type MediaType = "series" | "movie";

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({ isOpen, onClose }) => {
  const [mediaType, setMediaType] = useState<MediaType>("series");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [award, setAward] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [finalYear, setFinalYear] = useState("");
  // Movie fields
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // Feltöltési progress state
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Statikus opciók a lenyíló listákhoz
  const genreOptions = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"];
  const languageOptions = ["English", "Hungarian", "French", "German", "Spanish", "Italian"];
  const currentYear = new Date().getFullYear();

  // Reset fields when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setMediaType("series");
      setTitle("");
      setGenre("");
      setReleaseYear("");
      setDescription("");
      setLanguage("");
      setAward("");
      setCoverImage(null);
      setFinalYear("");
      setVideoFile(null);
      setVideoUploadProgress(0);
    }
  }, [isOpen]);

  // Generáljuk a release year opciókat dinamikusan (1900-tól 2024-ig)
  const releaseYearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
    const year = (currentYear - i).toString();
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("Title", title);
      formData.append("Genre", genre);
      formData.append("ReleaseYear", releaseYear);
      formData.append("Description", description);
      formData.append("Language", language);
      if (award) formData.append("Award", award);
      if (coverImage) formData.append("coverImage", coverImage);

      let endpoint = "";

      if (mediaType === "series") {
        if (finalYear) {
          formData.append("FinalYear", finalYear);
        }
        endpoint = "https://localhost:7204/series";
        await axios.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (mediaType === "movie") {
        if (videoFile) {
          formData.append("videoFile", videoFile);
        }
        endpoint = "https://localhost:7204/movie";
        await axios.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? 1;
            const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
            setVideoUploadProgress(percentCompleted);
          },
        });
      }

      toast({
        title: "Success!",
        description:
          mediaType === "series"
            ? "The series has been successfully recorded."
            : "The movie has been successfully recorded.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose(); // Reset fields and close modal
    } catch (error: any) {
      toast({
        title: "An error occurred.",
        description: error.message || "Unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setVideoUploadProgress(0);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add new {mediaType === "series" ? "Series" : "Movie"}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Select type</FormLabel>
              <RadioGroup onChange={(value) => setMediaType(value as MediaType)} value={mediaType}>
                <Stack direction="row">
                  <Radio value="series">Series</Radio>
                  <Radio value="movie">Movie</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Title</FormLabel>
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Genre</FormLabel>
              <Select placeholder="Select genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
                {genreOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Release Year</FormLabel>
              <Select placeholder="Select release year" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)}>
                {releaseYearOptions}
              </Select>
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Description"
                value={description}
                maxLength={300} // Maximum 300 karakter
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Language</FormLabel>
              <Select placeholder="Select language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Award (optional)</FormLabel>
              <Input placeholder="Award" value={award} onChange={(e) => setAward(e.target.value)} />
            </FormControl>

            {mediaType === "series" && (
              <FormControl mb={3}>
                <FormLabel>Final Year (optional)</FormLabel>
                <Input type="number" placeholder="Final Year" value={finalYear} onChange={(e) => setFinalYear(e.target.value)} />
              </FormControl>
            )}

            {mediaType === "movie" && (
              <>
                <FormControl mb={3}>
                  <FormLabel>Video File (optional)</FormLabel>
                  <Input
                    type="file"
                    accept=".mp4"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                </FormControl>
                {videoFile && videoUploadProgress < 100 && (
                  <Progress value={videoUploadProgress} size="sm" colorScheme="blue" mb={3} />
                )}
              </>
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
            <Button colorScheme="green" mr={3} type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
