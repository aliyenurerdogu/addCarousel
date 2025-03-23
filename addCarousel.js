(() => {
    const STORAGE_KEY = 'product_list';
    const FAVORITES_KEY = 'favorite_products';
    const API_URL = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
    const FAVORITE_ICON = 'https://www.e-bebek.com/assets/svg/default-favorite.svg';
    const ADDED_FAVORITE_ICON = 'https://www.e-bebek.com/assets/svg/added-favorite.svg';
    const HOMEPAGE_PATH = '/';

    if (window.location.pathname !== HOMEPAGE_PATH) {
        console.log("Wrong Page");
        return;
    }

    document.addEventListener("DOMContentLoaded", async () => {
        await init();
    });

    const init = async () => {
        let products = getLocalStorage(STORAGE_KEY);
        if (!products || products.length === 0) {
            products = await fetchProducts();
        }

        const favorites = getLocalStorage(FAVORITES_KEY, []);

        const container = renderProductCarousel(products, favorites);
        addCarouselToDOM(container);
        buildCss();
        setupSlider();
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setLocalStorage(STORAGE_KEY, data);
            return data;
        } catch (error) {
            console.error("API'den veri çekilirken hata oluştu:", error);
            return [];
        }

    }

    const getLocalStorage = (key) => {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    const setLocalStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    }

    const renderProductCarousel = (products, favorites) => {
        const container = document.createElement('div');
        container.classList.add('products-container');

        const productsWrapper = document.createElement('div');
        productsWrapper.classList.add('products-wrapper');

        const carousel = document.createElement('div');
        carousel.classList.add('carousel');

        const header = createCarouselHeader();



        products.forEach(product => {
            const productElement = createProductElement(product, favorites);
            carousel.append(productElement);
        });

        productsWrapper.appendChild(carousel);
        container.append(header, productsWrapper);
        container.append(createNavigationButton("prev"), createNavigationButton("next"));

        return container;
    }

    const createCarouselHeader = () => {
        const header = document.createElement('div');
        header.classList.add('carousel-header');

        const title = document.createElement('h2');
        title.innerText = "Beğeneceğinizi Düşündüklerimiz";

        header.appendChild(title);
        return header;
    }

    const createNavigationButton = (direction) => {
        const button = document.createElement('button');
        button.classList.add(`${direction}-button`);
        return button;
    }

    const createProductElement = (product, favorites) => {
        const productElement = document.createElement('div');
        productElement.classList.add('product-element');

        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        const img = document.createElement('img');
        img.src = product.img;
        img.classList.add('product-img');

        productCard.appendChild(img);
        productCard.appendChild(createBadges());
        productCard.appendChild(createCardContent(product, favorites));
        productCard.appendChild(createAddToCartButton());

        productElement.appendChild(productCard);
        productCard.addEventListener('click', () => window.open(product.url, '_blank'));

        return productElement;
    }

    const createBadges = () => {
        const badgeContainer = document.createElement('div');
        badgeContainer.classList.add('multiple-badge');

        const badgeSpan = document.createElement('span');
        badgeSpan.classList.add('badge-span');

        const freeShippingBadge = createBadge('https://www.e-bebek.com/assets/images/kargo-bedava.png');
        const bestSellerBadge = createBadge('https://www.e-bebek.com/assets/images/cok-satan.png');

        badgeSpan.append(freeShippingBadge, bestSellerBadge);
        badgeContainer.appendChild(badgeSpan);

        return badgeContainer;
    }

    const createBadge = (src) => {
        const badge = document.createElement('img');
        badge.classList.add('badge');
        badge.src = src;
        return badge;
    }

    const createCardContent = (product, favorites) => {
        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const name = document.createElement('p');
        name.innerHTML = `
            <p>
                <b>${product.brand} - </b>
                ${product.name}
            </p>`;

        cardContent.appendChild(name);
        cardContent.appendChild(createStarIcons());
        cardContent.appendChild(createPriceContainer(product));
        cardContent.appendChild(createFavoriteIcon(product, favorites));

        return cardContent;
    }

    const createStarIcons = () => {
        const starContainer = document.createElement('div');
        starContainer.classList.add('star-icon-container');

        for (let i = 0; i < 5; i++) {
            const starIcon = document.createElement('img');
            starIcon.src = 'https://www.e-bebek.com/assets/svg/star.svg';
            starIcon.classList.add('star-icon');
            starContainer.appendChild(starIcon);
        }
        return starContainer;
    }

    createPriceContainer = (product) => {
        const priceContainer = document.createElement('div');
        priceContainer.classList.add('price-container');

        if (product.price !== product.original_price) {
            const discountRate = ((product.original_price - product.price) / product.original_price * 100).toFixed(1);

            priceContainer.innerHTML = `
                <div class="old-price">
                    <span class="original-price">${product.original_price} TL</span>
                    <span class="discount">%${discountRate}</span>
                </div>
                <span class="discount-price">${product.price} TL</span>
            `;
        } else {
            priceContainer.innerHTML = `<span>${product.price} TL</span>`;
            priceContainer.classList.add('no-discount');
        }
        return priceContainer;
    }

    const createAddToCartButton = () => {
        const button = document.createElement('button');
        button.classList.add('add-to-cart-button');
        button.innerText = "Sepete Ekle";
        return button;
    }

    const createFavoriteIcon = (product, favorites) => {
        const favIconContainer = document.createElement('div');
        favIconContainer.classList.add('fav-icon-container');

        const favIcon = document.createElement('img');

        if (favorites.includes(product.id)) {
            favIcon.src = ADDED_FAVORITE_ICON;
            favIcon.classList.add('added-favorite');
        } else {
            favIcon.src = FAVORITE_ICON;
            favIcon.classList.add('default-favorite');
        }

        favIconContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFavorite(product.id, favIcon);
        });

        favIconContainer.appendChild(favIcon);
        return favIconContainer;
    }

    const toggleFavorite = (productId, favIcon) => {
        let favorites = getLocalStorage(FAVORITES_KEY);
        const isFavorite = favorites.includes(productId);

        favorites = isFavorite ? favorites.filter(id => id !== productId) : [...favorites, productId];

        favIcon.src = isFavorite ? FAVORITE_ICON : ADDED_FAVORITE_ICON;
        favIcon.classList.toggle('default-favorite', isFavorite);
        favIcon.classList.toggle('added-favorite', !isFavorite);

        setLocalStorage(FAVORITES_KEY, favorites);
    }

    const addCarouselToDOM = (container) => {
        const heroBanner = document.querySelector("eb-hero-banner-carousel");
        if (heroBanner) {
            const mainContainer = document.createElement("custom-product-carousel");
            mainContainer.appendChild(container);
            heroBanner.after(mainContainer);
        }
    }

    const setupSlider = () => {
        const prevButton = document.querySelector('.prev-button');
        const nextButton = document.querySelector('.next-button');
        const carousel = document.querySelector('.carousel');
        let currentIndex = 0;
        const totalProducts = document.querySelectorAll('.product-card').length;
        const itemsPerSlide = 5;
        const maxIndex = totalProducts - itemsPerSlide;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let currentOffset = 0;

        const getProductElementWidth = () => {
            const width = window.innerWidth;
            if (width > 1920) return 237.2;
            if (width > 1480) return 237.2;
            if (width > 1280) return 282.06;
            if (width > 992) return 282.06;
            if (width > 768) return 332;
            if (width > 576) return 230.4;
            if (width < 480) return 172.5;
            return 237.2;
        };

        const updateSlider = (animate = true) => {
            const productElementWidth = getProductElementWidth();
            currentOffset = currentIndex * (productElementWidth + 20);

            if (animate) {
                carousel.style.transition = "transform 0.3s ease";
            } else {
                carousel.style.transition = "none";
            }

            carousel.style.transform = `translateX(-${currentOffset}px)`;
        };

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            carousel.style.transition = "none";
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            let deltaX = startX - currentX;

            carousel.style.transform = `translateX(-${currentOffset + deltaX}px)`;
        });

        carousel.addEventListener('touchend', () => {
            if (!isDragging) return;
            let diff = startX - currentX;

            if (diff > 50 && currentIndex < maxIndex) {
                currentIndex++;
            } else if (diff < -50 && currentIndex > 0) {
                currentIndex--;
            }

            updateSlider();
            isDragging = false;
        });

        window.addEventListener('resize', () => updateSlider(false));
    };



    const buildCss = () => {
        const css = `
            custom-product-carousel {
                display: flex;
                justify-content: center;
            }
            .products-container {
                max-width: 1320px;
                padding: 20px 15px;
                transform: translate3d(0px, 0px, 0px);
                transition: all;
                position: relative;
                box-sizing: border-box;                
            }
            .products-wrapper {
                box-shadow: 15px 15px 30px 0 #ebebeb80;
                background-color: #fff;
                border-bottom-left-radius: 35px;
                border-bottom-right-radius: 35px;
                overflow: hidden;
            }
            .carousel {
                display: flex;
                transition: transform 0.25s ease;
                width: 3930px;
            }
            .carousel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background-color: #fef6eb;
                padding: 25px 67px;
                border-top-left-radius: 35px;
                border-top-right-radius: 35px;
                font-family: Quicksand-Bold;
                font-weight: 700;
            }
            .carousel-header h2 {
                font-family: Quicksand-Bold;
                font-size: 3rem;
                font-weight: 700;
                line-height: 1.11;
                color: #f28e00;
                margin: 0;
            }
            .prev-button {
                background: url('https://cdn06.e-bebek.com/assets/svg/prev.svg') no-repeat ;
                background-color: #fef6eb;
                background-position: 18px;
                width: 50px;
                height: 50px;
                border: 1px solid #0000;
                border-radius: 50%;
                position: absolute;
                bottom: 50%;
                top: auto;
                left: -65px;
            }
            .prev-button:hover {
                border:1px solid  #f28e00;
                background-color: #fff;
            }
            .next-button {
                background: url('https://cdn06.e-bebek.com/assets/svg/next.svg') no-repeat ;
                background-color: #fef6eb;
                background-position: 18px;
                width: 50px;
                height: 50px;
                border: 1px solid #0000;
                border-radius: 50%;
                position: absolute;
                bottom: 50%;
                top: auto;
                right: -65px;
            }
            .next-button:hover {
                border: 1px solid #f28e00;
                background-color: #fff;
            }           
            .product-element {
                display: flex;     
                width: 257px;
                margin-right: 20px;             
                transition: transform 0.5s ease-in-out; 
            }           
            .product-card {
                z-index: 1;
                display: flex;
                flex-direction: column;
                width: 242px;
                height: 560px;
                font-family: Poppins, "cursive";
                font-size: 12px;
                padding: 5px;
                color: #7d7d7d;
                margin: 20px 0 20px 3px;
                border: 1px solid #ededed;
                border-radius: 10px;
                position: relative;
                text-decoration: none;
                background-color: #fff;
                cursor: pointer;
                align-items: center;
            }
            .product-card:hover {
                box-shadow: 0 0 0 0 #00000030, inset 0 0 0 3px #f28e00;
            }
            .product-img {
                display: block;
                width: 100%;
                margin-bottom:65px;
            }
            .multiple-badge {
                height: 100%;
                display: flex;
                justify-content: space-between;
                flex-direction: column;
                position: absolute;
                left: 13px;
                top: 10px;               
            }
            .badge-span {
                flex-direction: column !important;
            }
            .badge {
                display: block;
                width: 100%;
            }
            .card-content {
                padding-bottom: 13px;
                padding: 0 17px 17px;
            }
            .card-content p {
                font-size: 1.2rem;
                height: 42px;
                margin-bottom: 10px;
            }           
            .star-icon-container {
                width: 191.6px;
                height: 39.2px;
                margin: 0 0 5px;           
                padding: 5px 0 15px;
            }
            .star-icon {
                width: 20px;
                height: 20px;
            }      
            .price-container {
                position: relative;
                display: flex;
                justify-content: flex-end;
                flex-direction: column;
                height: 43px;
            }
            .old-price {
                display: flex;
                align-items: center !important;
            }
            .original-price {
                font-size: 1.4rem;
                font-weight: 500;
                text-decoration: line-through;
            }
            .discount {
                color: #00a365;
                font-size: 18px;
                font-weight: 700;
                display: inline-flex;
                justify-content: center;
                margin-left: 10px;
            }
            .discount-price {              
                color: #00a365;
                display: block;
                width: 100%;
                font-size: 2.2rem;
                font-weight: 600;
            }
            .no-discount{
                display: block;
                width: 100%;
                font-size: 2.2rem;
                font-weight: 600;
            }            
            .fav-icon-container {
                right: 15px;
                top: 10px;
                width: 50px;
                height: 50px;
                position: absolute;
                cursor: pointer;
                background-color: #fff;
                border-radius: 50%;
                box-shadow: 0 2px 4px 0 #00000024;  
            }
            .fav-icon-container:hover {
                background: url('https://www.e-bebek.com/assets/svg/default-hover-favorite.svg') !important;
            }
            .fav-icon-container:hover .default-favorite {
                display:none;
            }                       
            .default-favorite {
                width: 25px;
                height: 25px;
                position: absolute;
                top: 13px;
                right: 12px;             
            }
            .added-favorite {
                width: 50px;
                height: 50px;
            }         
            .add-to-cart-button {
                position: relative;
                z-index: 2;
                margin: auto 0 10px;
                width: 194px;
                padding: 15px 20px;
                border-radius: 37.5px;
                background-color: #fff7ec;
                color: #f28e00;
                font-family: Poppins, "cursive";
                font-size: 1.4rem;
                font-weight: 700;
            }
            .add-to-cart-button:hover {
                background-color: #f28e00;
                color: #fff;
            }
            @media (max-width: 480px){
                .carousel-header {
                    padding: 0 22px 0 10px;
                    background-color: #fff;
                }
                .carousel-header h2 {
                    font-size: 2.2rem;
                    line-height: 1.5;
                }
                .products-container {
                    max-width: 390px;
                }
                .product-element {
                    width: 172.5px;
                }
                .product-card {
                    width: 100% !important;
                }
                .prev-button, .next-button {
                    display: none;
                }
                .card-content {
                    width: 172.5px;
                }
                .add-to-cart-button {
                    width: 152.4px;
                }
                .fav-icon-container {
                    width: 42px;
                    height: 42px;
                }
                .default-favorite {
                    top: 11px;
                    right: 8px;
                }
                .added-favorite {
                    width: 42px;
                    height: 42px;
                }
                .fav-icon-container:hover {
                    display: none;
                }
            }
            @media (min-width: 576px) {
                .products-container {
                    max-width: 495.8px;
                }
                .product-element {
                    width: 230.4px;
                }
                .product-card {
                    width: 100% !important;
                }
            }
            @media (min-width: 768px) {
               .products-container {
                    max-width: 699px;
                }
                .product-element {
                    width: 332px;                
                }
                .product-card {
                    width: 100% !important;
                }
            }
            @media (min-width: 992px) {
               .products-container {
                    max-width: 901.18px;
                }
                .product-element {
                    width: 282.06px;
                }
                .product-card {
                    width: 100% !important;
                }
                    
            }
            @media (min-width: 1280px) {
                .products-container {
                    max-width: 1203.24px;
                }
                .product-element {
                    width: 282.06px;               
                }
                .product-card {
                    width: 100% !important;
                }
               
            }
            @media (min-width: 1480px) {
                .products-container {
                    max-width : 1285px;
                }
                .product-element {
                    width : 237.2px;
                }
                .product-card {
                    width: 100% !important;
                }
            }          
        </style>

        `;
        const styleTag = document.createElement('style');
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);
    };
    init();
})();
