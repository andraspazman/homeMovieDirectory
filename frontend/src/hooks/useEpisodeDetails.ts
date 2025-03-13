import { useState, useEffect } from "react";
import * as api from "../utils/api";
import { PersonWithCharacterDTO } from "../types/PersonWithCharacterDTO";
import { ProductionCompanyDTO } from "../types/ProductionCompanyDTO";

export const useEpisodeDetails = (episodeId: string | null) => {
  const [personsWithCharacters, setPersonsWithCharacters] = useState<PersonWithCharacterDTO[]>([]);
  const [productionCompany, setProductionCompany] = useState<ProductionCompanyDTO | null>(null);

  useEffect(() => {
    if (!episodeId) return;
    api
      .fetchPersonsWithCharacters(episodeId)
      .then((response) => setPersonsWithCharacters(response.data))
      .catch((err) => console.error("Error loading persons with characters:", err));

    api
      .fetchProductionCompany(episodeId)
      .then((response) => setProductionCompany(response.data))
      .catch((err) => console.error("Error loading production company:", err));
  }, [episodeId]);

  return { personsWithCharacters, productionCompany };
};
