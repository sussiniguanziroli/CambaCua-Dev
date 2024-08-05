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
                    <p>Tu tienda de confianza para el cuidado de tus mascotas. Descubre nuestros productos y servicios.</p>
                    <NavLink className="explore-button" activeclassname="active" to="/productos">Explorar Productos</NavLink>
                </section>

                <section className="servicios-veterinarios">
                    <h2>Servicios Veterinarios</h2>
                    <div className="servicios-content">
                        <section className='carrouseles-section'>
                            <div className="servicios-images">
                                <ImageCarousel images={serviciosImages1} />
                            </div>
                            <div className="servicios-images-2">
                                <ImageCarousel images={serviciosImages2} />
                            </div>
                        </section>
                        <div className='servicios-list'>
                            <Accordeon />
                        </div>
                    </div>
                </section>

                <section className="portfolio-section">
                    <h2>Conoce a la Dra. María Celeste Guanziroli Stefani</h2>
                    <p className="portfolio-summary">
                        Aquí va un breve resumen del portafolio de la Dra. María Celeste Guanziroli Stefani. Completa esta sección con información relevante sobre su experiencia, educación y especialidades en el campo veterinario.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Landing;
