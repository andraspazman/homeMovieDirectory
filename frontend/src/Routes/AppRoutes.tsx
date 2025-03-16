import { Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout";
import HomePage from "../pages/HomePage";
import MoviePage from "../pages/MoviePage";
import SeriesPage from "../pages/SeriesPage";
import SelectedMoviePage from "../pages/SelectedMovieContentPage";
import SelectedSeriesPage from "../pages/SelectedSeriesContentPage";
import StatisticsPage from "../pages/StatisticsPage";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage/>} />
        <Route path="movies" element={<MoviePage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="movie/:id" element={< SelectedMoviePage/>} />
        {/* MOD: Dinamikus route a sorozat részletek megjelenítéséhez */}
        <Route path="series/:id" element={<SelectedSeriesPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Route>
    </Routes>
  );
}
