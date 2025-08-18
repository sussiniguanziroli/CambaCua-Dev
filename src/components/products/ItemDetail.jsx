import React, { useEffect, useRef, useState, useCallback } from 'react';
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import { FiShoppingCart } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useCarrito } from '../../context/CarritoContext';

const ItemDetail = ({ product }) => {
    const { agregarAlCarrito, carrito } = useCarrito();
    const flickityRef = useRef(null);
    const flktyInstance = useRef(null);

    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [currentVariation, setCurrentVariation] = useState(null);

    useEffect(() => {
        if (product && product.hasVariations && product.variationsList && product.variationsList.length > 0) {
            const initialVariation = product.variationsList.find(v => v.activo) || product.variationsList[0];
            const initialAttrs = {};
            if (initialVariation && initialVariation.attributes) {
                Object.keys(initialVariation.attributes).forEach(attrName => {
                    initialAttrs[attrName] = initialVariation.attributes[attrName];
                });
            }
            setSelectedAttributes(initialAttrs);
            setCurrentVariation(initialVariation);
        } else if (product && !product.hasVariations) {
            setSelectedAttributes({});
            setCurrentVariation(null);
        }
    }, [product]);

    useEffect(() => {
        if (product && product.hasVariations && product.variationsList) {
            const matchingVariation = product.variationsList.find(variation => {
                if (!variation.attributes) return false;
                return Object.keys(selectedAttributes).every(attrName =>
                    selectedAttributes[attrName] === '' ||
                    variation.attributes[attrName] === selectedAttributes[attrName]
                );
            });
            setCurrentVariation(matchingVariation);
        }
    }, [selectedAttributes, product]);

    useEffect(() => {
        let timerId = null;
        if (flickityRef.current) {
            timerId = setTimeout(() => {
                if (flktyInstance.current) {
                    flktyInstance.current.destroy();
                    flktyInstance.current = null;
                }
                if (flickityRef.current) {
                    flktyInstance.current = new Flickity(flickityRef.current, {
                        cellAlign: 'center',
                        contain: true,
                        pageDots: true,
                        prevNextButtons: true,
                        wrapAround: true,
                        imagesLoaded: true
                    });
                    flktyInstance.current.resize();
                }
            }, 50);
        }
        return () => {
            clearTimeout(timerId);
            setTimeout(() => {
                if (flktyInstance.current) {
                    try {
                        flktyInstance.current.destroy();
                    } catch (error) {
                        console.error("Error destroying Flickity instance:", error);
                    } finally {
                        flktyInstance.current = null;
                    }
                }
            }, 0);
        };
    }, [product, currentVariation]);

    const getCarouselImages = () => {
        let images = [];
        if (product.hasVariations && currentVariation) {
            images = [currentVariation.imagen, currentVariation.imagenB, currentVariation.imagenC];
        } else if (!product.hasVariations) {
            images = [product.imagen, product.imagenB, product.imagenC];
        }
        return images.filter(Boolean);
    };

    const imagenesCarousel = getCarouselImages();
    const fallbackImage = "https://placehold.co/400x400/E0E0E0/808080?text=Imagen+no+disponible";

    const existsInCart = product.hasVariations && currentVariation
        ? carrito.some(item => item.id === product.id && item.variationId === currentVariation.id)
        : carrito.some(item => item.id === product.id);

    const handleAttributeChange = useCallback((attrName, value) => {
        setSelectedAttributes(prev => {
            const newAttributes = { ...prev, [attrName]: value };
            const orderedAttributeNames = Object.keys(availableAttributes);
            const changedAttrIndex = orderedAttributeNames.indexOf(attrName);
            const attributesToReset = {};
            for (let i = changedAttrIndex + 1; i < orderedAttributeNames.length; i++) {
                const subsequentAttrName = orderedAttributeNames[i];
                const currentlySelectedSubsequentValue = newAttributes[subsequentAttrName];
                const tempSelectionsForValidation = {};
                for (let j = 0; j <= i; j++) {
                    if (newAttributes[orderedAttributeNames[j]] !== undefined && newAttributes[orderedAttributeNames[j]] !== '') {
                        tempSelectionsForValidation[orderedAttributeNames[j]] = newAttributes[orderedAttributeNames[j]];
                    }
                }
                const validOptionsForSubsequent = getAvailableAttributeValues(subsequentAttrName, tempSelectionsForValidation);
                if (currentlySelectedSubsequentValue && !validOptionsForSubsequent.includes(currentlySelectedSubsequentValue)) {
                    attributesToReset[subsequentAttrName] = '';
                }
            }
            return { ...newAttributes, ...attributesToReset };
        });
    }, [product]);

    const handleAddToCart = () => {
        let itemToAdd = {};
        let stockAvailable = 0;
        let itemNameForSwal = product.nombre;

        if (product.hasVariations) {
            if (!currentVariation) {
                Swal.fire('Selección Incompleta', 'Por favor, selecciona todas las opciones de la variación antes de añadir al carrito.', 'warning');
                return;
            }
            if (currentVariation.stock === 0) {
                Swal.fire('Sin Stock', 'La variación seleccionada está agotada.', 'info');
                return;
            }
            itemToAdd = {
                id: product.id,
                name: product.nombre,
                variationId: currentVariation.id,
                attributes: currentVariation.attributes,
                price: currentVariation.precio,
                stock: currentVariation.stock,
                imageUrl: currentVariation.imagen || product.imagen,
                quantity: 1,
                hasVariations: true,
                promocion: product.promocion || null
            };
            stockAvailable = currentVariation.stock;
            itemNameForSwal = `${product.nombre} (${Object.values(currentVariation.attributes).join(', ')})`;
        } else {
            if (product.stock === 0) {
                Swal.fire('Sin Stock', 'Este producto está agotado.', 'info');
                return;
            }
            itemToAdd = {
                id: product.id,
                name: product.nombre,
                price: product.precio,
                stock: product.stock,
                imageUrl: product.imagen,
                quantity: 1,
                hasVariations: false,
                promocion: product.promocion || null
            };
            stockAvailable = product.stock;
        }

        if (existsInCart) {
            Swal.fire({
                title: "Producto ya en carrito",
                text: "Puedes ajustar la cantidad desde el carrito.",
                icon: "info",
                confirmButtonColor: '#0b369c',
                customClass: { popup: 'swal2-popup' }
            });
        } else {
            if (stockAvailable > 0) {
                agregarAlCarrito(itemToAdd);
                Swal.fire({
                    title: "¡Agregado!",
                    text: `${itemNameForSwal} se ha añadido al carrito.`,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'swal2-popup' }
                });
            } else {
                Swal.fire('Sin Stock', 'Este producto (o la variación seleccionada) está agotado.', 'info');
            }
        }
    };

    const availableAttributes = {};
    if (product.hasVariations && product.variationsList) {
        product.variationsList.forEach(variation => {
            if (variation.attributes) {
                Object.keys(variation.attributes).forEach(attrName => {
                    if (!availableAttributes[attrName]) {
                        availableAttributes[attrName] = new Set();
                    }
                    availableAttributes[attrName].add(variation.attributes[attrName]);
                });
            }
        });
    }

    const getAvailableAttributeValues = (attrName, currentSelections) => {
        if (!product || !product.hasVariations || !product.variationsList) return [];
        const validValues = new Set();
        const orderedAttributeNames = Object.keys(availableAttributes);
        const attrIndex = orderedAttributeNames.indexOf(attrName);
        product.variationsList.forEach(variation => {
            if (!variation.activo) return;
            let matchesPreviousSelections = true;
            for (let i = 0; i < attrIndex; i++) {
                const prevAttrName = orderedAttributeNames[i];
                if (currentSelections[prevAttrName] !== '' && variation.attributes[prevAttrName] !== currentSelections[prevAttrName]) {
                    matchesPreviousSelections = false;
                    break;
                }
            }
            if (matchesPreviousSelections && variation.attributes && variation.attributes[attrName]) {
                validValues.add(variation.attributes[attrName]);
            }
        });
        return Array.from(validValues).sort();
    };

    const getPromoBadgeText = (promo) => {
        if (!promo) return null;
        switch (promo.type) {
            case 'percentage_discount':
                return `OFERTA: ${promo.value}% OFF`;
            case 'second_unit_discount':
                return `PROMO: ${promo.value}% EN LA 2DA UNIDAD`;
            case '2x1':
                return 'PROMO: 2x1';
            default:
                return null;
        }
    };

    const calculateDiscountedPrice = (price, promo) => {
        if (promo && promo.type === 'percentage_discount' && price) {
            return price * (1 - promo.value / 100);
        }
        return null;
    };

    const promoBadgeText = getPromoBadgeText(product.promocion);

    const renderPrice = (price, promo) => {
        const discountedPrice = calculateDiscountedPrice(price, promo);
        if (discountedPrice !== null) {
            return (
                <div className="price-container-detail">
                    <span className="product-price-detail final-price">${discountedPrice.toFixed(2)}</span>
                    <span className="product-price-detail original-price">${price.toFixed(2)}</span>
                </div>
            );
        }
        return <p className="product-price-detail">${price?.toFixed(2) || 'N/A'}</p>;
    };

    return (
        <div className="item-detail-page-content">
            <div className="detail-main-area">
                <div className="detail-carousel-column">
                    <div key={product.id + (currentVariation ? currentVariation.id : '')} className="carousel" ref={flickityRef}>
                        {imagenesCarousel.length > 0 ? (
                            imagenesCarousel.map((img, index) => (
                                <div key={index} className="carousel-cell">
                                    <img src={img} alt={`${product.nombre} - Imagen ${index + 1}`} />
                                </div>
                            ))
                        ) : (
                            <div className="carousel-cell">
                                <img src={fallbackImage} alt="Imagen no disponible" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-body-column">
                    <h1 className="product-title">{product.nombre}</h1>
                    {promoBadgeText && <div className="promo-badge-detail">{promoBadgeText}</div>}
                    <p className="product-category">
                        Categoría: {product.categoria} {product.subcategoria && ` / ${product.subcategoria}`}
                    </p>

                    {product.hasVariations ? (
                        <div className="variations-selection-area">
                            {Object.keys(availableAttributes).map(attrName => {
                                const currentSelectionsForValidation = { ...selectedAttributes };
                                const availableValues = getAvailableAttributeValues(attrName, currentSelectionsForValidation);
                                return (
                                    <div key={attrName} className="form-group variation-selector">
                                        <label className="variation-label">{attrName}:</label>
                                        <div className="variation-options">
                                            {Array.from(availableAttributes[attrName]).sort().map(value => {
                                                const isSelected = selectedAttributes[attrName] === value;
                                                const isDisabled = !availableValues.includes(value);
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => handleAttributeChange(attrName, value)}
                                                        disabled={isDisabled}
                                                        className={`variation-button ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {currentVariation ? (
                                <div className="variation-info">
                                    {renderPrice(currentVariation.precio, product.promocion)}
                                    <p className={`stock-available ${currentVariation.stock === 0 ? 'text-red' : 'text-green'}`}>
                                        Disponibles: {currentVariation.stock}
                                    </p>
                                </div>
                            ) : (
                                <p className="info-message info-warning">
                                    Por favor, selecciona todas las opciones para ver el precio y stock.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="simple-product-info">
                            {renderPrice(product.precio, product.promocion)}
                            <p className={`stock-available ${product.stock === 0 ? 'text-red' : 'text-green'}`}>
                                Disponibles: {product.stock}
                            </p>
                        </div>
                    )}

                    <div className="detail-actions">
                        <button
                            onClick={handleAddToCart}
                            className={`add-to-cart-button-detail
                                ${ (product.hasVariations && (!currentVariation || currentVariation.stock === 0)) ||
                                   (!product.hasVariations && product.stock === 0) || existsInCart
                                    ? 'disabled'
                                    : ''
                                }
                            `}
                            disabled={
                                (product.hasVariations && (!currentVariation || currentVariation.stock === 0)) ||
                                (!product.hasVariations && product.stock === 0) ||
                                existsInCart
                            }
                        >
                            <FiShoppingCart size={18} className="icon-left" />
                            {existsInCart ? "En carrito" : (
                                (product.hasVariations && (!currentVariation || currentVariation.stock === 0)) ||
                                (!product.hasVariations && product.stock === 0)
                                    ? "Agotado"
                                    : "Agregar al carrito"
                            )}
                        </button>
                    </div>

                    <div className="product-description">
                        <h3>Descripción</h3>
                        <p>{product.descripcion || "Descripción no disponible."}</p>
                    </div>

                    <div className="product-details">
                        <h3>Detalles</h3>
                        {product.categoria && (
                            <p className="detail-item"><strong>Categoría:</strong> {product.categoria}</p>
                        )}
                        {product.subcategoria && (
                            <p className="detail-item"><strong>Subcategoría:</strong> {product.subcategoria}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;
