import React from 'react';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';

const Contacto = () => {
    return (
        <div className="contacto-container">
            <h2>Contacto</h2>
            <div className="contacto-content">
                <div className="contact-form">
                    <h3>Envíanos un mensaje</h3>
                    <form>
                        <input type="text" placeholder="Tu nombre" required />
                        <input type="email" placeholder="Tu correo electrónico" required />
                        <textarea placeholder="Tu mensaje" required></textarea>
                        <button type="submit">Enviar</button>
                    </form>
                </div>
                <div className="contact-info">
                    <h3>Síguenos</h3>
                    <div className="social-links">
                        <a href="https://www.instagram.com/cambacuavet/" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a>
                        <a href="https://www.facebook.com/cambacuavet" target="_blank" rel="noopener noreferrer">
                            <FaFacebook />
                        </a>
                        <a href="https://wa.me/+543795048310?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20los%20servicios%20que%20ofrecen.%20¿Podrían%20darme%20más%20información?" target="_blank" rel="noopener noreferrer">
                            <FaWhatsapp />
                        </a>

                    </div>
                    <h3>Encuéntranos</h3>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8419.00568045146!2d-58.84575047980962!3d-27.47685940791351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94456cbda164301d%3A0xb6df02fd517c65ca!2zQ2FtYsOhIEN1w6EgVmV0IFNob3AgJiBTcGE!5e0!3m2!1sen!2sar!4v1722877762007!5m2!1sen!2sar"
                            width="600"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
