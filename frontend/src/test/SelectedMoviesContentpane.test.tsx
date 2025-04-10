/// <reference types="vitest" />

/* //The purpose of the test is to:
    - check render movie data correctly
    - check  show error message if movie data fails to load
    - check call handleWatchNow when watch button is clicked
    - check call handleAddToPlaylist when add to playlist button is clicked
*/
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SelectedMovieContentPane from '../components/SelectedContent/SelectedMoviesContentpane';

// mocking axios  simulate API calls during testing
vi.mock('axios');

// mocking  to simulate route parameter retrieval
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

describe('SelectedMovieContentPane', () => {
  
    // Sample mock movie data to use in our tests
  const mockMovieData = {  
    id: '1',
    title: 'Test Movie',
    genre: 'Action',
    language: 'English',
    description: 'Test description',
    imdbRating: 8.5,
    coverImagePath: 'test-image.jpg',
    releaseYear: 2021,
    award: 'Best Picture',
  };

  // Set up useParams mock to return a specific movie ID
  beforeEach(() => {
    (useParams as vi.Mock).mockReturnValue({ id: '1' }); // Mocking the return value of `useParams`
  });

  // Test case to check if movie data is rendered correctly
  it('should render movie data correctly', async () => {
   
    (axios.get as vi.Mock).mockResolvedValueOnce({
      data: mockMovieData,
    });

    render(<SelectedMovieContentPane />); 

    // Wait for the movie title to appea ( indicating data is loaded)
    await waitFor(() => screen.getByText('Test Movie'));

    // Assertions to ensure that the movie data is displayed correctly
    expect(screen.getByText('Test Movie')).toBeInTheDocument(); 
    expect(screen.getByText('Action')).toBeInTheDocument(); 
    expect(screen.getByText('English')).toBeInTheDocument(); 
    expect(screen.getByText('2021')).toBeInTheDocument(); 
  });


  it('should show loading spinner when movie data is loading', () => {

    (axios.get as vi.Mock).mockResolvedValueOnce({
      data: null,
    });

    render(<SelectedMovieContentPane />); 


    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner should be present while loading
  });

  // Test case to check if an error message is displayed when movie data fails to load
    it('should show error message if movie data fails to load', async () => {

    (axios.get as vi.Mock).mockRejectedValueOnce(new Error('Failed to load movie'));

    render(<SelectedMovieContentPane />); // Rendering the component


    await waitFor(() => expect(screen.getByText('Failed to load movie data.')).toBeInTheDocument()); // Verifying that the correct error message is displayed on the screen
  });


  it('should call handleWatchNow when watch button is clicked', async () => {
    render(<SelectedMovieContentPane />); // Rendering the component

   
    const watchButton = screen.getByRole('button', { name: /watch now/i });  // Finding the "Watch Now" button by its role and name


    fireEvent.click(watchButton);


  });


  it('should call handleAddToPlaylist when add to playlist button is clicked', async () => {
    render(<SelectedMovieContentPane />); 

    const addToPlaylistButton = screen.getByRole('button', { name: /add to playlist/i });

    fireEvent.click(addToPlaylistButton);

  });
});