export interface SidebarProps {
  isOpen: boolean;
  selectedGenres?: string[];
  setSelectedGenres?: (genres: string[]) => void;
  selectedDecades?: string[];
  setSelectedDecades?: (countries: string[]) => void;
}