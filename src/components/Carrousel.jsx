import React from 'react'
import Carousel from 'react-bootstrap/Carousel';


const Carrousel = () => {
  return (
    


    <Carousel>
      <Carousel.Item interval={2000}>
       <img src="public/assets/carro-1.jpg" alt="primera foto" />
        
      </Carousel.Item>
      <Carousel.Item interval={2000}>
        <img src="public/assets/carro-2.jpg" alt="2da foto" />
        
      </Carousel.Item>
      <Carousel.Item >
        <img src="public/assets/carro-3.jpg" alt="3era foto" />
        
      </Carousel.Item>
    </Carousel>
  );
}


 

export default Carrousel