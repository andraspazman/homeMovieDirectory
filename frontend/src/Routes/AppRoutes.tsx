import { Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout";
import AdminRoute from "../components/ProfileLoader/AdminRoute";
import HomePage from "../pages/HomePage";
import MoviePage from "../pages/MoviePage";
import SeriesPage from "../pages/SeriesPage";
import SelectedMoviePage from "../pages/SelectedMovieContentPage";
import SelectedSeriesPage from "../pages/SelectedSeriesContentPage";
import StatisticsPage from "../pages/StatisticsPage";
import  ManageUsersPage  from "../pages/ManageUsersPage";
import UserProfileSettings from "../pages/EditUserProfile";
import PlaylistPage from "../pages/PlaylistPage"


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage/>} />
        <Route path="movies" element={<MoviePage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="movie/:id" element={< SelectedMoviePage/>} />
        <Route path="/profile-settings" element={< UserProfileSettings/>} />
        <Route path="/playlist" element={< PlaylistPage/>} />
        {/* MOD: Dinamikus route a sorozat részletek megjelenítéséhez */}
        <Route path="series/:id" element={<SelectedSeriesPage />} />
        <Route path="/statistics" element={<AdminRoute element={<StatisticsPage />} />}/>
        <Route path="/manage-users"element={<AdminRoute element={<ManageUsersPage />} />}/>
        
      </Route>
    </Routes>
  );
}
