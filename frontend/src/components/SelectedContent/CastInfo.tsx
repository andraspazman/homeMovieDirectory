import React from "react";
import { UnorderedList, ListItem, Text, Heading, Button } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import styles from "./SelectedContentpane.module.scss";
import { PersonWithCharacterDTO } from "../../types/PersonWithCharacterDTO";

interface CastInfoProps {
  personsWithCharacters: PersonWithCharacterDTO[];
  isLoggedIn: boolean;
  onDeletePerson: (personId: string) => void;
}

const CastInfo: React.FC<CastInfoProps> = ({ personsWithCharacters, isLoggedIn, onDeletePerson }) => {
  const directors = personsWithCharacters.filter(
    (pwc) => pwc.person.role === "director"
  );
  const cast = personsWithCharacters.filter(
    (pwc) => pwc.person.role !== "director"
  );

  return (
    <div className={styles.castContainer}>
      <Heading size="sm" mb={2}>Director(s)</Heading>
      {directors.length > 0 ? (
        <UnorderedList>
          {directors.slice(0, 2).map((pwc) => (
            <ListItem key={pwc.person.id}>
              {pwc.person.name}
              {isLoggedIn && (
                <Button
                  size="xs"
                  color="red"
                  colorScheme="white"
                  onClick={() => onDeletePerson(pwc.person.id)}
                >
                  <Trash2 size={20} />
                </Button>
              )}
              {pwc.characters && pwc.characters.length > 0 && (
                <UnorderedList>
                  {pwc.characters.slice(0, 5).map((character) => (
                    <ListItem key={character.id}>{character.characterName}</ListItem>
                  ))}
                </UnorderedList>
              )}
            </ListItem>
          ))}
        </UnorderedList>
      ) : (
        <Text>No director found.</Text>
      )}

      <Heading size="sm" mb={2} mt={4}>Cast &amp; Characters</Heading>
      {cast.length > 0 ? (
        <UnorderedList>
          {cast.slice(0, 5).map((pwc) => (
            <ListItem key={pwc.person.id}>
              {pwc.person.name} {pwc.person.role && `(${pwc.person.role})`}{" "}
              {isLoggedIn && (
                <Button
                  size="xs"
                  color="red"
                  colorScheme="white"
                  onClick={() => onDeletePerson(pwc.person.id)}
                >
                  <Trash2 size={20} />
                </Button>
              )}
              {pwc.characters && pwc.characters.length > 0 && (
                <UnorderedList>
                  {pwc.characters.slice(0, 5).map((character) => (
                    <ListItem key={character.id}>
                      {character.characterName}{" "}
                      {character.nickName ? `- ${character.nickName}` : ""}{" "}
                      {character.role ? `(${character.role})` : ""}
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
    </div>
  );
};

export default CastInfo;
