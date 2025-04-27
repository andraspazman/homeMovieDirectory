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

// mocking axios to simulate API calls during testing
vi.mock('axios');

// mocking react-router-dom to simulate route parameter retrieval
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

describe('SelectedMovieContentPane', () => {
  const mockAxiosGet = axios.get as unknown as ReturnType<typeof vi.fn>;
  const mockUseParams = useParams as unknown as ReturnType<typeof vi.fn>;

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

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '1' });
  });

  it('should render movie data correctly', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: mockMovieData });

    render(<SelectedMovieContentPane />);

    await waitFor(() => screen.getByText('Test Movie'));

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
  });

  it('should show loading spinner when movie data is loading', () => {
    mockAxiosGet.mockResolvedValueOnce({ data: null });

    render(<SelectedMovieContentPane />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error message if movie data fails to load', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('Failed to load movie'));

    render(<SelectedMovieContentPane />);

    await waitFor(() =>
      expect(screen.getByText('Failed to load movie data.')).toBeInTheDocument()
    );
  });

  it('should call handleWatchNow when watch button is clicked', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: mockMovieData });

    render(<SelectedMovieContentPane />);

    const watchButton = await screen.findByRole('button', { name: /watch now/i });
    fireEvent.click(watchButton);


  });

  it('should call handleAddToPlaylist when add to playlist button is clicked', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: mockMovieData });

    render(<SelectedMovieContentPane />);

    const addToPlaylistButton = await screen.findByRole('button', { name: /add to playlist/i });
    fireEvent.click(addToPlaylistButton);

  });
});
