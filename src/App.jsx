
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/main.css";
import Header from './components/header/Header.jsx'
import Landing from './components/Landing'
import ItemListContainer from './components/products/ItemListContainer'
import Contacto from './components/Contacto'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer.jsx';

function App() {


    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/productos' element={<ItemListContainer />} />
                <Route path='/contacto' element={<Contacto />} />
            </Routes>
            <Footer />
        </BrowserRouter>


    )
}

export default App
