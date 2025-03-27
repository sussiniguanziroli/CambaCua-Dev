import React from 'react';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';


const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h4>Cambá Cuá Vet Shop</h4>
                    <p>Tu lugar de confianza para el cuidado de tus mascotas.</p>
                    <p>Tienda Online de CambaCuaVet.</p>
                    <p>Entre Rios 1581</p>
                    <p>Corrientes Capital</p>
                </div>
                <div className="footer-section">
                    <h4>Contacto</h4>
                    <ul>
                        <li><a href="https://wa.me/543795049384?text=Hola%20tengo%20una%20consulta!"><FaWhatsapp /> +54 9 3795 048310</a></li>
                        <li><a href="mailto: vetshopandspa@gmail.com">vetshopandspa@gmail.com</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Síguenos</h4>
                    <ul className="social-media-links">
                        <li><a href="https://www.instagram.com/cambacuavet/" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a></li>

                        <li><a href="https://www.facebook.com/cambacuavet" target="_blank" rel="noopener noreferrer">
                            <FaFacebook />
                        </a></li>

                        <li><a href="https://wa.me/+543795048310?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20los%20servicios%20que%20ofrecen.%20¿Podrían%20darme%20más%20información?" target="_blank" rel="noopener noreferrer">
                            <FaWhatsapp />
                        </a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Cambá Cuá Vet Shop - Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
