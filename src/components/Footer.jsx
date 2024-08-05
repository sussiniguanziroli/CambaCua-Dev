import React from 'react'
import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="landing-footer">
        <div className="footer-links">
          <a href="#">2024 Todos los derechos reservados</a>
          <a href="#">CambaCuaVet</a>
        </div>
        <div className="footer-contact">
        <NavLink className="nav-button" activeclassname="active" to="/contacto" >Contacto</NavLink>  
          <div className="social-icons">
            
          </div>
        </div>
      </footer>
  )
}

export default Footer