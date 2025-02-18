export interface SidebarProps {
  isOpen: boolean;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  selectedCountries: string[];
  setSelectedCountries: (countries: string[]) => void;
}