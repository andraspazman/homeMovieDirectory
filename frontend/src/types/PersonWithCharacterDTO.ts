import { PersonDTO } from "./PersonDTO";
import { CharacterDTO } from "./CharacterDTO";

export interface PersonWithCharacterDTO {
  person: PersonDTO;
  characters: CharacterDTO[];
}
