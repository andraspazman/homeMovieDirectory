/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SelectedMovieContentPane from '../components/SelectedContent/SelectedMoviesContentpane';

// Mock axios
vi.mock('axios');

// Mock useParams
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

describe('SelectedMovieContentPane', () => {
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

  beforeEach(() => {
    // Correctly typing useParams mock with vi.Mock
    (useParams as vi.Mock).mockReturnValue({ id: '1' });
  });

  it('should render movie data correctly', async () => {
    // Correctly typing axios.get mock with vi.Mock
    (axios.get as vi.Mock).mockResolvedValueOnce({
      data: mockMovieData,
    });

    render(<SelectedMovieContentPane />);

    // Wait for movie data to load
    await waitFor(() => screen.getByText('Test Movie'));

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
  });

  it('should show loading spinner when movie data is loading', () => {
    // Mocking an empty response to simulate loading
    (axios.get as vi.Mock).mockResolvedValueOnce({
      data: null,
    });

    render(<SelectedMovieContentPane />);

    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner should be present
  });

  it('should show error message if movie data fails to load', async () => {
    // Mocking a failed axios call to simulate error
    (axios.get as vi.Mock).mockRejectedValueOnce(new Error('Failed to load movie'));

    render(<SelectedMovieContentPane />);

    await waitFor(() => expect(screen.getByText('Failed to load movie data.')).toBeInTheDocument());
  });

  it('should call handleWatchNow when watch button is clicked', async () => {
    render(<SelectedMovieContentPane />);

    const watchButton = screen.getByRole('button', { name: /watch now/i });
    fireEvent.click(watchButton);

    // Here you can test that the modal opens (if that's what happens when clicking "Watch now")
    // For example, check if modal opens or if toast is shown
  });

  it('should call handleAddToPlaylist when add to playlist button is clicked', async () => {
    render(<SelectedMovieContentPane />);

    const addToPlaylistButton = screen.getByRole('button', { name: /add to playlist/i });
    fireEvent.click(addToPlaylistButton);

    // Add assertions to check that the movie is added to the playlist
    // For example, check if a toast appears
  });
});
