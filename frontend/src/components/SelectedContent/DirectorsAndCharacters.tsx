import React from "react";
import { Box, Heading, UnorderedList, ListItem, Text, Button } from "@chakra-ui/react";
import { Trash2, SquarePlus } from "lucide-react";
import { PersonWithCharacterDTO } from "../../types/PersonWithCharacterDTO";



type DirectorsAndCharactersProps = {
  directors: PersonWithCharacterDTO[];
  characters: PersonWithCharacterDTO[];
  isLoggedIn: boolean;
  onDeletePerson: (personId: string) => void;
  onAddCharacter: (personId: string) => void;
  /** 
   * ÚJ: Add Person gomb callback
   * (pl. megnyit egy modált, ahol új Person-t lehet felvenni)
   */
  onAddPerson: () => void;
};

export const DirectorsAndCharacters: React.FC<DirectorsAndCharactersProps> = ({
  directors,
  characters,
  isLoggedIn,
  onDeletePerson,
  onAddCharacter,
  onAddPerson, // ÚJ
}) => {
  return (
    <Box border="1px solid #ccc" borderRadius="md" p={10}>
      {/* --- Directors part --- */}
      <Heading size="sm" mb={2}>Director(s)</Heading>
      {directors.length > 0 ? (
        <UnorderedList>
          {directors.slice(0, 2).map((pwc, index) => (
            <ListItem key={pwc.person.id ||index}>
              {pwc.person.name}
              {isLoggedIn && (
                <Button size="xs"  colorScheme="white"  color="red" ml={2} onClick={() => onDeletePerson(pwc.person.id)}><Trash2 size={20} /></Button>
              )}
              {pwc.characters && pwc.characters.length > 0 && (
                <UnorderedList mt={2}>
                  {pwc.characters.slice(0, 5).map((character, index) => (<ListItem key={character.id || index}>  {character.characterName} </ListItem>))}
                </UnorderedList>
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
          {characters.slice(0, 5).map((pwc, index) => (
            <ListItem key={pwc.person.id || index} mt={2}>
              {pwc.person.name} {pwc.person.role && `(${pwc.person.role})`}{" "}
              {isLoggedIn && (
                <>
                  <Button size="xs"   colorScheme="white"  color="green"  ml={2} onClick={() => onAddCharacter(pwc.person.id)}  > <SquarePlus size={18} />
                  </Button>  <Button  size="xs" colorScheme="white"   color="red"   ml={2} onClick={() => onDeletePerson(pwc.person.id)} >   <Trash2 size={18} />  </Button>
                </>
              )}
              {pwc.characters && pwc.characters.length > 0 && (
                <UnorderedList mt={2}>
                  {pwc.characters.slice(0, 5).map((character, index) => (
                    <ListItem key={character.id || index}>
                      {character.characterName}
                      {character.nickName ? ` - ${character.nickName}` : ""}
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

      {/* --- ÚJ: Add Person gomb, ha be vagyunk jelentkezve --- */}
      {isLoggedIn && (
        <Box mt={5}>
          <Button size="xs"  colorScheme="green"  onClick={onAddPerson} > Add Person <SquarePlus size={18} /></Button>
        </Box>
      )}
    </Box>
  );
};
