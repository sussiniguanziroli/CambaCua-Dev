import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/main.css";
import Header from './components/header/Header.jsx'
import Landing from './components/Landing'
import ItemListContainer from './components/products/ItemListContainer'
import Contacto from './components/Contacto'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import Carrito from './components/Carrito.jsx';
import Checkout from './components/checkout/Checkout.jsx';
import ItemDetailContainer from './components/products/ItemDetailContainer.jsx';


function App() {


    return (
        <CarritoProvider>
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/productos' element={<ItemListContainer />} />
                <Route path='/contacto' element={<Contacto />} />
                <Route path='/carrito' element={<Carrito />}/>
                <Route path='/checkout' element={<Checkout />} />
                <Route path='/producto/:itemId' element={<ItemDetailContainer/>} />
            </Routes>
            <Footer />
        </BrowserRouter>
        </CarritoProvider>


    )
}

export default App
