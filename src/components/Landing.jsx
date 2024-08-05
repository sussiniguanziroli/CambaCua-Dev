import React from 'react';
import Carrousel from './Carrousel';
import Accordeon from './Accordeon';
import Carousel from 'react-bootstrap/Carousel';
import { NavLink } from 'react-router-dom';

const Landing = () => {
    return (
        <>
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
                                <Carousel>
                                    <Carousel.Item interval={2000}>
                                        <img src="public/assets/consul-3.jpg" alt="primera foto" />
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <img src="public/assets/consul-1.jpg" alt="3era foto" />
                                    </Carousel.Item>
                                </Carousel>
                            </div>
                            <div className="servicios-images-2">
                                <Carousel>
                                    <Carousel.Item interval={2000}>
                                        <img src="public/assets/salon-1.jpg" alt="primera foto" />
                                    </Carousel.Item>
                                    <Carousel.Item interval={2000}>
                                        <img src="public/assets/salon-2.jpg" alt="2da foto" />
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <img src="public/assets/consul-0.jpg" alt="3era foto" />
                                    </Carousel.Item>
                                </Carousel>
                            </div>
                        </section>
                        <div className='servicios-list'>
                            <Accordeon />
                        </div>
                    </div>
                </section>

                {/* Nueva sección para el portafolio de la Dra. María Celeste Guanziroli Stefani */}
                <section className="portfolio-section">
                    <h2>Conoce a la Dra. María Celeste Guanziroli Stefani</h2>
                    <p className="portfolio-summary">
                        Aquí va un breve resumen del portafolio de la Dra. María Celeste Guanziroli Stefani. Completa esta sección con información relevante sobre su experiencia, educación y especialidades en el campo veterinario.
                    </p>
                </section>
            </div>
        </>
    );
};

export default Landing;

