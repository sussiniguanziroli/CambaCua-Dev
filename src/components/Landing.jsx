import React, { useState, useEffect } from "react";
import Carrousel from "./Carrousel";
import { NavLink } from "react-router-dom";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBone,
  FaSyringe,
  FaSoap,
} from "react-icons/fa";

const processProduct = (doc) => {
    const data = doc.data();
    let displayStock = data.stock;
    let displayPrice = data.precio;
    let hasAnyVariationStock = false;

    if (data.hasVariations && Array.isArray(data.variationsList)) {
        let totalStock = 0;
        let minPrice = Infinity;

        data.variationsList.forEach(variation => {
            if (variation.activo && variation.stock > 0) {
                hasAnyVariationStock = true;
                totalStock += variation.stock;
            }
            if (variation.activo && variation.precio < minPrice) {
                minPrice = variation.precio;
            }
        });

        displayStock = hasAnyVariationStock ? totalStock : 0;
        displayPrice = hasAnyVariationStock && minPrice !== Infinity ? minPrice : null;
    }

    return {
        id: doc.id,
        ...data,
        _displayStock: displayStock,
        _displayPrice: displayPrice,
        _hasAnyVariationStock: hasAnyVariationStock
    };
};

const ProductCard = ({ product }) => {
    const isOutOfStock = product.hasVariations
        ? !product._hasAnyVariationStock
        : product._displayStock === 0;

    const displayPrice = product.hasVariations
        ? product._displayPrice !== null
            ? `Desde $${product._displayPrice?.toFixed(2)}`
            : 'Ver Opciones'
        : `$${product._displayPrice?.toFixed(2)}`;
    
    const cardImage = product.imagen ||
                      (product.hasVariations && product.variationsList?.[0]?.imagen) ||
                      "https://placehold.co/400x400/E0E0E0/808080?text=No+Image";

    return (
        <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            <NavLink to={`/producto/${product.id}`} className="image-container">
                <img
                    className="product-image"
                    src={cardImage}
                    alt={product.nombre}
                />
            </NavLink>
            <div className="product-info">
                <p className="product-category">{product.categoria}</p>
                <h3 className="product-name">{product.nombre}</h3>
                <strong className="product-price">{displayPrice}</strong>
                {isOutOfStock ? (
                    <div className="stock-status">Sin Stock</div>
                ) : (
                    <NavLink to={`/producto/${product.id}`} className="add-to-cart-button">
                        {product.hasVariations ? "Ver Opciones" : "Ver Producto"}
                    </NavLink>
                )}
            </div>
        </div>
    );
};

const ProductSlider = ({ products }) => {
  const [visibleSlides, setVisibleSlides] = useState(1.3);
  const [step, setStep] = useState(1);
  const [naturalSlideHeight, setNaturalSlideHeight] = useState(180);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setVisibleSlides(1.3);
        setStep(1);
        setNaturalSlideHeight(130);
      } else if (width < 768) {
        setVisibleSlides(2.3);
        setStep(2);
        setNaturalSlideHeight(170);
      } else if (width < 1024) {
        setVisibleSlides(3);
        setStep(2);
        setNaturalSlideHeight(160);
      } else {
        setVisibleSlides(4);
        setStep(3);
        setNaturalSlideHeight(160);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <CarouselProvider
      naturalSlideWidth={100}
      naturalSlideHeight={naturalSlideHeight}
      totalSlides={products.length}
      visibleSlides={visibleSlides}
      step={step}
      infinite={products.length > visibleSlides}
      className="product-carousel-provider"
      dragEnabled={true}
    >
      <Slider>
        {products.map((product, index) => (
          <Slide index={index} key={product.id}>
            <ProductCard product={product} />
          </Slide>
        ))}
      </Slider>
      <ButtonBack className="carousel-arrow-prod left">
        <FaChevronLeft />
      </ButtonBack>
      <ButtonNext className="carousel-arrow-prod right">
        <FaChevronRight />
      </ButtonNext>
    </CarouselProvider>
  );
};

const SliderLoader = () => (
  <div className="product-carousel-section slider-loader">
    <div className="title-placeholder shimmer-bg"></div>
    <div className="cards-placeholder">
      <div className="card-placeholder shimmer-bg"></div>
      <div className="card-placeholder shimmer-bg"></div>
      <div className="card-placeholder shimmer-bg"></div>
      <div className="card-placeholder shimmer-bg"></div>
    </div>
  </div>
);

const Landing = () => {
  const [sliders, setSliders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setIsLoading(true);
      try {
        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const productsRef = collection(db, "productos");
        const newSliders = [];

        const topSellersQuery = query(
          productsRef,
          where("destacado", "==", true),
          where("activo", "==", true),
          limit(10)
        );
        const topSellersSnapshot = await getDocs(topSellersQuery);
        let topSellersList = topSellersSnapshot.docs.map(processProduct);

        if (topSellersList.length === 0) {
          const fallbackQuery = query(
            productsRef,
            where("activo", "==", true),
            limit(10)
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          topSellersList = fallbackSnapshot.docs.map(processProduct);
        }

        if (topSellersList.length > 0) {
          newSliders.push({
            title: "Los Más Vendidos",
            link: "/productos",
            products: topSellersList,
          });
        }

        for (const category of categoriesList) {
          const productsQuery = query(
            productsRef,
            where("categoryAdress", "==", category.adress),
            where("activo", "==", true),
            limit(10)
          );
          const productsSnapshot = await getDocs(productsQuery);
          const productList = productsSnapshot.docs.map(processProduct);

          if (productList.length > 0) {
            newSliders.push({
              title: category.nombre,
              link: `/productos?categoria=${category.adress}`,
              products: productList,
            });
          }
        }

        setSliders(newSliders);
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  const promoImages = [
        { 
            src: "https://i.ibb.co/s9tZdQK5/Chat-GPT-Image-Apr-10-2025-11-09-12-AM.png", 
            alt: "Promo 1",
            title: "¡Ahora con envíos!",
            description: "Lanzamos la tienda online para brindar mejores servicios.",
            link: "/productos"
        },
        { 
            src: "https://i.ibb.co/4gNp5dt4/Chat-GPT-Image-Apr-10-2025-11-13-52-AM.png", 
            alt: "Promo 2",
            title: "¿Como comprar?",
            description: "Aprende a usar la Tienda Online.",
            link: "/como-comprar"
        },
        { 
            src: "https://i.ibb.co/fzGmLzVp/Chat-GPT-Image-Apr-10-2025-11-06-17-AM.png", 
            alt: "Promo 3",
            title: "Nuevos Productos",
            description: "Descubre nuestra línea de productos disponibles.",
            link: "/productos"
        }
    ];
  return (
    <div className="landing-dad">
      <Carrousel />

      <div className="landing-container">
        <section className="welcome-section">
          <h1>
            Bienvenidos a <span className="vet-name">Cambá Cuá</span>
          </h1>
          <p className="welcome-subtitle">
            Tu lugar de confianza para el cuidado de tus mascotas
          </p>
          <p className="welcome-text">
            Descubre nuestra tienda virtual, donde tu peludo encontrará todo lo
            que necesita �🐱
          </p>
        </section>

        <section className="shop-by-category-section">
          <h2>Categorías Principales</h2>
          <div className="category-options">
            <NavLink
              to="/productos?categoria=alimentos"
              className="category-button"
            >
              <FaBone className="category-icon" />
              Alimentos
            </NavLink>
            <NavLink
              to="/productos?categoria=medicamentos"
              className="category-button"
            >
              <FaSyringe className="category-icon" />
              Medicamentos
            </NavLink>
            <NavLink
              to="/productos?categoria=higiene"
              className="category-button"
            >
              <FaSoap className="category-icon" />
              Higiene
            </NavLink>
          </div>
        </section>

        {isLoading ? (
          <>
            <SliderLoader />
            <SliderLoader />
            <SliderLoader />
          </>
        ) : (
          sliders.map((slider) => (
            <section key={slider.title} className="product-carousel-section">
              <NavLink to={slider.link} className="product-carousel-title">
                <h2>{slider.title}</h2>
              </NavLink>
              <ProductSlider products={slider.products} />
            </section>
          ))
        )}
      </div>
      <section className="promo-section">
        <h2 className="promo-title">
          ¡Descubre lo que tenemos para vos y tu mascota!
        </h2>
        <div className="promo-carousel">
          {promoImages.map((promo, index) => (
            <NavLink to={promo.link} key={index} className="promo-card">
              <img src={promo.src} alt={promo.alt} />
              <div className="promo-content">
                <h3>{promo.title}</h3>
                <p>{promo.description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
