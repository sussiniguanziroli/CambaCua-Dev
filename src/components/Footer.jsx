import React from 'react';


const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h4>Cambá Cuá Vet Shop</h4>
                    <p>Tu tienda de confianza para el cuidado de tus mascotas.</p>
                </div>
                <div className="footer-section">
                    <h4>Contacto</h4>
                    <ul>
                        <li><a href="tel:+5493704000000">+54 9 3704 000000</a></li>
                        <li><a href="mailto:info@cambacuavetshop.com">info@cambacuavetshop.com</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Síguenos</h4>
                    <ul className="social-media-links">
                        <li><a href="#"><i className="fab fa-facebook"></i></a></li>
                        <li><a href="#"><i className="fab fa-instagram"></i></a></li>
                        <li><a href="#"><i className="fab fa-twitter"></i></a></li>
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
