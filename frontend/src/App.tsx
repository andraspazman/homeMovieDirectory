// App.tsx
import { UserProvider } from "./context/UserContext";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import ProfileLoader from "./components/ProfileLoader/ProfileLoader"; // importáld be a létrehozott komponens

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        {/* ProfileLoader lefut, lekéri a /profile adatot, és setUser-rel beállítja a Contextet */}
        <ProfileLoader />

        {/* Ezután minden route hozzáfér a frissített user állapothoz */}
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
