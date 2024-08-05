import React from 'react'
import Accordion from 'react-bootstrap/Accordion';


const Accordeon = () => {
    return (
        <Accordion className='Accordion'>
            <Accordion.Item eventKey="0" className='ac-cirugia'>
                <Accordion.Header><p className='ac-header'>Cirugía</p></Accordion.Header>
                <Accordion.Body>
                    Nuestro equipo altamente capacitado realiza procedimientos quirúrgicos con los más altos estándares de cuidado y seguridad. Utilizamos tecnología avanzada para asegurar el mejor resultado para tus mascotas.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1" className='ac-ecografia'>
                <Accordion.Header><p className='ac-header'>Ecografía</p></Accordion.Header>
                <Accordion.Body>
                    Ofrecemos servicios de ecografía para diagnosticar con precisión una variedad de condiciones médicas en tus mascotas. Nuestro equipo de última generación proporciona imágenes detalladas para una evaluación completa.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2" className='ac-clinica'>
                <Accordion.Header><p className='ac-header'>Clínica</p></Accordion.Header>
                <Accordion.Body>
                    Proveemos atención médica integral para tus mascotas, desde chequeos regulares hasta el tratamiento de enfermedades comunes. Nuestro objetivo es mantener a tus amigos peludos sanos y felices.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3" className='ac-lab'>
                <Accordion.Header><p className='ac-header'>Laboratorio</p></Accordion.Header>
                <Accordion.Body>
                    Nuestro laboratorio está equipado para realizar una amplia gama de pruebas diagnósticas que nos ayudan a detectar problemas de salud de manera temprana y precisa, garantizando el cuidado óptimo para tu mascota.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4" className='ac-intern'>
                <Accordion.Header><p className='ac-header'>Internaciones</p></Accordion.Header>
                <Accordion.Body>
                    Ofrecemos instalaciones de internación para aquellos momentos en que tu mascota necesita cuidados más intensivos. Nuestro personal está dedicado a proporcionar un ambiente cómodo y seguro durante su recuperación.
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="5" className='ac-cardio'>
                <Accordion.Header><p className='ac-header'>Cardiología</p></Accordion.Header>
                <Accordion.Body>
                    Contamos con especialistas en cardiología para diagnosticar y tratar problemas cardíacos en tus mascotas. Utilizamos técnicas avanzadas para asegurar el mejor cuidado del corazón de tus amigos peludos.
                </Accordion.Body>
            </Accordion.Item>

        </Accordion>
    )
}

export default Accordeon