import React from 'react';
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  DotGroup
} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css'; // Importa los estilos base
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
  { src: "https://i.ibb.co/KFzndD7/carro-1.jpg", alt: "Cuidado veterinario profesional" },
  { src: "https://i.ibb.co/XFRxYkB/carro-2.jpg", alt: "Productos de calidad para mascotas" },
  { src: "https://i.ibb.co/jhw4qmD/carro-3.jpg", alt: "Tu mascota en las mejores manos" }
];

const Carrousel = () => {
  return (
    <div className="main-carousel-wrapper">
      <CarouselProvider
        naturalSlideWidth={100}
        naturalSlideHeight={38} // Ajusta esta altura para que se vea bien
        totalSlides={slides.length}
        isPlaying={true}
        interval={5000}
        infinite={true}
      >
        <Slider className="main-carousel-slider">
          {slides.map((slide, index) => (
            <Slide index={index} key={index}>
              <div
                className="carousel-image"
                style={{ backgroundImage: `url(${slide.src})` }}
                aria-label={slide.alt}
              ></div>
            </Slide>
          ))}
        </Slider>
        
        <ButtonBack className="carousel-arrow-main left">
          <FaChevronLeft />
        </ButtonBack>
        <ButtonNext className="carousel-arrow-main right">
          <FaChevronRight />
        </ButtonNext>
        <DotGroup className="carousel-dots-main" />
      </CarouselProvider>
    </div>
  );
};

export default Carrousel;
