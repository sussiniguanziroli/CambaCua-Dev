import React from 'react';
import Carrousel from './Carrousel';
import { NavLink } from 'react-router-dom';

const Landing = () => {
    // Imágenes para el nuevo carrusel de promociones (reemplázalas con las tuyas)
    const promoImages = [
        { 
            src: "https://i.ibb.co/s9tZdQK5/Chat-GPT-Image-Apr-10-2025-11-09-12-AM.png", 
            alt: "Promo 1",
            title: "¡Ahora con envíos!",
            description: "Lanzamos la tienda online para brindar mejores servicios."
        },
        { 
            src: "https://i.ibb.co/4gNp5dt4/Chat-GPT-Image-Apr-10-2025-11-13-52-AM.png", 
            alt: "Promo 2",
            title: "¿Como comprar?",
            description: "Aprende a usar la Tienda Online."
        },
        { 
            src: "https://i.ibb.co/fzGmLzVp/Chat-GPT-Image-Apr-10-2025-11-06-17-AM.png", 
            alt: "Promo 3",
            title: "Nuevos Productos",
            description: "Descubre nuestra línea de productos disponibles."
        }
    ];

    return (
        <div className='landing-dad'>
            <Carrousel />
            <div className="landing-container">
                {/* Sección de Bienvenida (existente) */}
                <section className="welcome-section">
                    <h1>Bienvenidos a <span className="vet-name">Cambá Cuá</span></h1>
                    <p className="welcome-subtitle">Tu lugar de confianza para el cuidado de tus mascotas</p>
                    <p className="welcome-text">Descubre nuestra tienda virtual, donde tu peludo encontrará todo lo que necesita 🐶🐱</p>
                    <NavLink className="explore-button" to="/productos">
                        Ver productos 🛒
                    </NavLink>
                </section>

                {/* Nueva Sección de Promociones */}
                <section className="promo-section">
                    <h2 className="promo-title">¡Descubre lo que tenemos para vos y tu mascota!</h2>
                    <div className="promo-carousel">
                        {promoImages.map((promo, index) => (
                            <div key={index} className="promo-card">
                                <img src={promo.src} alt={promo.alt} />
                                <div className="promo-content">
                                    <h3>{promo.title}</h3>
                                    <p>{promo.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Landing;