import React from 'react'
import { NavLink } from 'react-router-dom'

const NavBar = () => {
    return (
        <nav>

            <div className='nav-div'>
                <NavLink className="nav-button" activeclassname="active" to="/" >Inicio</NavLink>
            </div>
            <div className='nav-div'>
                <NavLink className="nav-button" activeclassname="active" to="/productos" >Productos</NavLink>
            </div>
            <div className='nav-div'>
                <NavLink className="nav-button" activeclassname="active" to="/contacto" >Contacto</NavLink>
            </div>


        </nav>
    )
}

export default NavBar