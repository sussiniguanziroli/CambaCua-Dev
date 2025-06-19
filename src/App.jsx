import "bootstrap/dist/css/bootstrap.min.css";
import "./css/main.css";
import Header from "./components/header/Header.jsx";
import Landing from "./components/Landing";
import ItemListContainer from "./components/products/ItemListContainer";
import Contacto from "./components/Contacto";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Carrito from "./components/Carrito.jsx";
import Checkout from "./components/checkout/Checkout.jsx";
import ItemDetailContainer from "./components/products/ItemDetailContainer.jsx";
import OrderDetails from "./components/OrderDetails.jsx";
import OrderSummary from "./components/checkout/OrderSummary.jsx";
import FloatingCartButton from "./components/carrito/FloatingCartButton.jsx";
import AuthPage from "./components/auth/AuthPage.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <div className="app-container">
            <Header />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/productos" element={<ItemListContainer />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/producto/:itemId"
                element={<ItemDetailContainer />}
              />
              <Route
                path="/miscompras"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-summary/:orderId"
                element={<OrderSummary />}
              />
            </Routes>
            <FloatingCartButton />
            <Footer />
          </div>
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
