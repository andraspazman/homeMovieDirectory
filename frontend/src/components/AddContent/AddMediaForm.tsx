import React, { useState, FormEvent, useEffect } from "react";
import {Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button,FormControl, FormLabel, Input,Textarea, RadioGroup, Radio, Stack, Select, useToast,} from "@chakra-ui/react";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  //resel all fields when close form
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
    }
  }, [isOpen]);

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
      } else if (mediaType === "movie") {
        if (videoFile) {
          formData.append("videoFile", videoFile);
        }
        endpoint = "https://localhost:7204/movie";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Data recording failed.");
      }

      await response.json();

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
      onClose(); //reset fields
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
    }
  };

  const releaseYearOptions = Array.from({ length: 2024 - 1900 + 1 }, (_, i) => {
    const year = (1900 + i).toString();
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

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
                <option value="drama">Drama</option>
                <option value="action">Action</option>
                <option value="animation">Animation</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="horror">Sci-Fi</option>
                <option value="thriller">Sci-Fi</option>
                <option value="adventure">Sci-Fi</option>
                <option value="biography">Sci-Fi</option>
                <option value="crime">Sci-Fi</option>
                <option value="romance">Sci-Fi</option>
                <option value="comedy">Sci-Fi</option>
                <option value="documentary">Sci-Fi</option>
                <option value="family">Sci-Fi</option>
                <option value="history">Sci-Fi</option>
                <option value="reality">Sci-Fi</option>
                <option value="war">Sci-Fi</option>
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
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Language</FormLabel>
              <Select placeholder="Select language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="english">English</option>
                <option value="hungarian">Hungarian</option>
                <option value="japanese">Japanese</option>
                <option value="french">French</option>
                <option value="spanish">Spanish</option>
                <option value="german">german</option>
                <option value="russian">Russian</option>
                <option value="italian">Italian</option>
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
