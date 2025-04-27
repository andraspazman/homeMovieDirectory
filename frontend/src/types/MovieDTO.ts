export interface MovieDTO {
    id: string;
    title: string;
    genre: string;
    releaseYear?: number;
    description: string;
    language: string;
    award?: string;
    videoPath?: string;
    coverImagePath?: string;
    isMovie: boolean;
    imdbRating : string;
}
  