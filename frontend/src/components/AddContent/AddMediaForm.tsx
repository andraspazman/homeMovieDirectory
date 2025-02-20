import React, { useState, FormEvent } from "react";
import {Modal, ModalOverlay, ModalContent, ModalHeader,ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Textarea, RadioGroup, Radio, Stack, useToast,} from "@chakra-ui/react";

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
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Series field
  const [finalYear, setFinalYear] = useState("");

  // Movie fields
  const [director, setDirector] = useState("");
  const [duration, setDuration] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Common data
      formData.append("Title", title);
      formData.append("Genre", genre);
      formData.append("ReleaseYear", releaseYear);
      formData.append("Description", description);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      let endpoint = "";

      if (mediaType === "series") {
        // Series specific data
        if (finalYear) {
          formData.append("FinalYear", finalYear);
        }
        endpoint = "https://localhost:7204/series";
      } else if (mediaType === "movie") {
        //Movie data
        formData.append("Director", director);
        formData.append("Duration", duration);
        endpoint = "/api/movies";  //TODO: movie endpoint
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Data recording failed.");
      }

      const data = await response.json();

      toast({
        title: "Succes!",
        description: mediaType === "series" ? "The series has been successfully recorded." : "The movie has been successfully recorded.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "An error occurred.",
        description: error.message || "unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Új {mediaType === "series" ? "series" : "movies"} add</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            {/* Choose series or movie */}
            <FormControl mb={4}>
              <FormLabel>Select type</FormLabel>
              <RadioGroup
                onChange={(value: MediaType) => setMediaType(value)}
                value={mediaType}
              >
                <Stack direction="row">
                  <Radio value="series">Series</Radio>
                  <Radio value="movie">Movie</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* commond fields */}
            <FormControl isRequired mb={3}>
              <FormLabel>Title</FormLabel>
              <Input
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Genre</FormLabel>
              <Input
                placeholder="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired mb={3}>
              <FormLabel>Release year</FormLabel>
              <Input
                type="number"
                placeholder="year"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
              />
            </FormControl>

            {/* series specific fields */}
            {mediaType === "series" && (
              <FormControl mb={3}>
                <FormLabel>Final year (optional)</FormLabel>
                <Input
                  type="number"
                  placeholder="year"
                  value={finalYear}
                  onChange={(e) => setFinalYear(e.target.value)}
                />
              </FormControl>
            )}

            {/* Movie spicific */}
            {mediaType === "movie" && (
              <>
                <FormControl isRequired mb={3}>
                  <FormLabel>Director</FormLabel>
                  <Input
                    placeholder="name"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired mb={3}>
                  <FormLabel>Time (minute)</FormLabel>
                  <Input
                    type="number"
                    placeholder="time"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </FormControl>
              </>
            )}

            <FormControl isRequired mb={3}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Cover</FormLabel>
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
            <Button colorScheme="blue" mr={3} type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
