import React, { useState, useEffect } from 'react';
import Carrousel from './Carrousel';
import { NavLink } from 'react-router-dom';
import { FaDog, FaCat, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext
} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const topSellers = [
    { id: 1, name: 'Alimento Balanceado VitalCan para Perros Medianos y Grandes', category: 'Perros', price: '$25.000', image: 'https://i.ibb.co/n7ZJxqh/alimento-perro.jpg' },
    { id: 2, name: 'Pipeta Antipulgas Power para Perros', category: 'Perros', price: '$8.500', image: 'https://i.ibb.co/Y0d7Sg8/pipeta-perro.jpg' },
    { id: 3, name: 'Alimento Húmedo Royal Canin para Gatos', category: 'Gatos', price: '$5.200', image: 'https://i.ibb.co/3WqjVwZ/alimento-gato.jpg' },
    { id: 4, name: 'Rascador de Cartón para Gatos', category: 'Gatos', price: '$12.000', image: 'https://i.ibb.co/T1H8brB/rascador-gato.jpg' },
    { id: 5, name: 'Juguete Pelota Resistente', category: 'Perros', price: '$6.800', image: 'https://i.ibb.co/hK5J8Lp/juguete-perro.jpg' },
    { id: 6, name: 'Cama Antiestrés Mediana', category: 'Perros', price: '$35.000', image: 'https://i.ibb.co/9V0gV3f/cama-perro.jpg' }

];

const dogFood = [
    { id: 11, name: 'Royal Canin Medium Adult', category: 'Perros', price: '$28.500', image: 'https://i.ibb.co/n7ZJxqh/alimento-perro.jpg' },
    { id: 12, name: 'Eukanuba Adult Small Breed', category: 'Perros', price: '$26.300', image: 'https://i.ibb.co/JqjT6hR/snacks-perro.jpg' },
];

const catFood = [
    { id: 13, name: 'Pro Plan Cat Adult', category: 'Gatos', price: '$22.000', image: 'https://i.ibb.co/3WqjVwZ/alimento-gato.jpg' },
    { id: 14, name: 'Excellent Gato Adulto', category: 'Gatos', price: '$19.800', image: 'https://i.ibb.co/P9tWcKy/fuente-gato.jpg' },
];

const accessories = [
    { id: 15, name: 'Collar de Cuero Premium', category: 'Accesorios', price: '$15.300', image: 'https://i.ibb.co/GvxDsTj/collar-perro.jpg' },
    { id: 16, name: 'Juguete Interactivo para Gato', category: 'Accesorios', price: '$9.900', image: 'https://i.ibb.co/yQW23D2/juguete-gato.jpg' },
    { id: 17, name: 'Rascador Torre para Gato', category: 'Accesorios', price: '$45.000', image: 'https://i.ibb.co/T1H8brB/rascador-gato.jpg' },
];


const ProductCard = ({ product }) => (
    <div className="product-card">
        <NavLink to={`/producto/${product.id}`} className="image-container">
            <img className="product-image" src={product.image} alt={product.name} />
        </NavLink>
        <div className="product-info">
            <p className='product-category'>{product.category}</p>
            <h3 className="product-name">{product.name}</h3>
            <strong className="product-price">{product.price}</strong>
            <NavLink to={`/producto/${product.id}`} className="add-to-cart-button">
                Ver Producto
            </NavLink>
        </div>
    </div>
);

const ProductSlider = ({ products }) => {
    const [visibleSlides, setVisibleSlides] = useState(1.3);
    const [step, setStep] = useState(1);
    const [naturalSlideHeight, setNaturalSlideHeight] = useState(180);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 480) {
                setVisibleSlides(1.3);
                setStep(1);
                setNaturalSlideHeight(180);
            } else if (width < 768) {
                setVisibleSlides(2.3);
                setStep(2);
                setNaturalSlideHeight(170);
            } else if (width < 1024) {
                setVisibleSlides(3);
                setStep(2);
                setNaturalSlideHeight(160);
            } else {
                setVisibleSlides(4);
                setStep(3);
                setNaturalSlideHeight(160);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <CarouselProvider
            naturalSlideWidth={100}
            naturalSlideHeight={naturalSlideHeight}
            totalSlides={products.length}
            visibleSlides={visibleSlides}
            step={step}
            infinite={products.length > visibleSlides}
            className="product-carousel-provider"
            dragEnabled={true}
        >
            <Slider>
                {products.map((product, index) => (
                    <Slide index={index} key={product.id}>
                        <ProductCard product={product} />
                    </Slide>
                ))}
            </Slider>
            <ButtonBack className="carousel-arrow-prod left"><FaChevronLeft /></ButtonBack>
            <ButtonNext className="carousel-arrow-prod right"><FaChevronRight /></ButtonNext>
        </CarouselProvider>
    );
};


const Landing = () => {
    return (
        <div className='landing-dad'>
            <Carrousel />

            <div className="landing-container">
                <section className="welcome-section">
                    <h1>Bienvenidos a <span className="vet-name">Cambá Cuá</span></h1>
                    <p className="welcome-subtitle">Tu lugar de confianza para el cuidado de tus mascotas</p>
                    <p className="welcome-text">Descubre nuestra tienda virtual, donde tu peludo encontrará todo lo que necesita 🐶🐱</p>
                </section>

                <section className="shop-by-pet-section">
                    <h2>Comprar por Mascota</h2>
                    <div className="pet-options">
                        <NavLink to="/productos?categoria=perros" className="pet-card">
                            <FaDog className="pet-icon" />
                            <h3>Perros</h3>
                        </NavLink>
                        <NavLink to="/productos?categoria=gatos" className="pet-card">
                            <FaCat className="pet-icon" />
                            <h3>Gatos</h3>
                        </NavLink>
                    </div>
                </section>

                <section className="product-carousel-section">
                    <h2>Los Más Vendidos</h2>
                    <ProductSlider products={topSellers} />
                </section>

                <section className="product-carousel-section">
                    <h2>Alimentos para Perros</h2>
                    <ProductSlider products={dogFood} />
                </section>

                <section className="product-carousel-section">
                    <h2>Alimentos para Gatos</h2>
                    <ProductSlider products={catFood} />
                </section>
                
                <section className="product-carousel-section">
                    <h2>Juguetes y Accesorios</h2>
                    <ProductSlider products={accessories} />
                </section>
            </div>
        </div>
    );
};

export default Landing;
