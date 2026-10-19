import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import PrivateRoute from "./components/PrivateRoute";

import GuestRoute from "./components/GuestRoute";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";

import Catalog from "./pages/Catalog";
import Details from "./pages/Details";

import Login from "./pages/Login";

import Register from "./pages/Register";
import CreateGroup from "./pages/CreateGroup";
import EditGroup from "./pages/EditGroup";


import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
              <Route path="/" element={<Home />} />


           <Route path="/groups" element={<Catalog />} />
          <Route path="/groups/:id" element={<Details />} />
      


                 <Route element={<GuestRoute />}>

              <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />
            </Route>

          <Route element={<PrivateRoute />}>
             <Route path="/groups/create" element={<CreateGroup />} />
              <Route path="/groups/:id/edit" element={<EditGroup />} />
           </Route>
           <Route path="*" element={<NotFound />} />
        </Routes>
          </BrowserRouter>
    </AuthProvider>
  );
}

export default App;