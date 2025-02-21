// App.tsx
import { UserProvider } from "./context/UserContext";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
