export interface ProductionCompanyProps {
  name?: string;
  website?: string;
  isLoggedIn?: boolean;
  onEdit?: () => void;
  onAdd?: () => void;
}