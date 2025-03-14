export interface SeriesDTO {
    id: string;
    title: string;
    genre: string;
    releaseYear: number;
    finalYear?: number;
    description: string;
    coverImagePath?: string;
}