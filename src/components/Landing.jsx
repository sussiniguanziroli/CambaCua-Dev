import React from 'react';
import Carrousel from './Carrousel';
import Accordeon from './Accordeon';
import Carousel from 'react-bootstrap/Carousel';
import { NavLink } from 'react-router-dom';

const ImageCarousel = ({ images }) => (
    <Carousel>
        {images.map((img, index) => (
            <Carousel.Item key={index} interval={4000}>
                <img src={img.src} alt={img.alt} />
            </Carousel.Item>
        ))}
    </Carousel>
);

const Landing = () => {
    const serviciosImages1 = [
        { src: "https://i.ibb.co/qD5p6dJ/consul-3.jpg", alt: "consul-3" },
        { src: "https://i.ibb.co/x3hVQgD/consul-1.jpg", alt: "consul-1" }
    ];

    const serviciosImages2 = [
        { src: "https://i.ibb.co/7gBkk2p/salon-1.jpg", alt: "salon-1" },
        { src: "https://i.ibb.co/q1np82S/salon-2.jpg", alt: "salon-2" },
        { src: "https://i.ibb.co/zHr6HSR/consul-0.jpg", alt: "consul-0" }
    ];

    return (
        <div className='landing-dad'>
            <Carrousel />
            <div className="landing-container">
                <section className="welcome-section">
                    <h1>Bienvenidos a Cambá Cuá Vet Shop</h1>
                    <h2>Tu lugar de confianza para el cuidado de tus mascotas. Descubre nuestros productos y servicios.</h2>
                    <h2>Lanzamos nuestra tienda virtual, para que tu peludo tenga todo lo que necesita desde la comodidad de tu hogar!</h2>
                    <NavLink className="explore-button" activeclassname="active" to="/productos">Ir a la Tienda!</NavLink>
                </section>

                

                
            </div>
        </div>
    );
};

export default Landing;
