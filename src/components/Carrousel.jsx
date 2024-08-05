import React from 'react'
import Carousel from 'react-bootstrap/Carousel';


const Carrousel = () => {
  return (
    


    <Carousel>
      <Carousel.Item interval={2000}>
      <img src="https://i.ibb.co/KFzndD7/carro-1.jpg" alt="carro-1" />
        
      </Carousel.Item>
      <Carousel.Item interval={2000}>
      <img src="https://i.ibb.co/XFRxYkB/carro-2.jpg" alt="carro-2" />
        
      </Carousel.Item>
      <Carousel.Item >
      <img src="https://i.ibb.co/jhw4qmD/carro-3.jpg" alt="carro-3" />
        
      </Carousel.Item>
    </Carousel>
  );
}


 

export default Carrousel