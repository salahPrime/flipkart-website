// Flipkart Clone E-Commerce Application Controller
document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'relevance';
  let maxPrice = 150000;
  let filterAssuredOnly = false;
  let filterMinRating = 0;
  let filterMinDiscount = 0;
  let filterSellerOnly = false;
  let activeSlideIndex = 0;
  let carouselTimer = null;
  let activeProductDetail = null;
  let activeLoginMethod = 'email';

  // DOM Elements Cache
  const productsGrid = document.getElementById('productsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const searchBtn = document.getElementById('searchBtn');
  const cartBadge = document.getElementById('cartBadge');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartItemsList = document.getElementById('cartItemsList');
  const priceSlider = document.getElementById('priceSlider');
  const maxPriceDisplay = document.getElementById('maxPriceDisplay');
  const dealTimerDisplay = document.getElementById('dealTimerDisplay');
  const dealSlider = document.getElementById('dealSlider');

  // Modals
  const productDetailModal = document.getElementById('productDetailModal');
  const sellerModal = document.getElementById('sellerModal');
  const checkoutModal = document.getElementById('checkoutModal');
  const wishlistModal = document.getElementById('wishlistModal');
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    setupCarousel();
    setupDealTimer();
    renderDealSlider();
    renderProducts();
    updateCartUI();
    updateLoginButtonState();
    initializeGoogleSignIn();
    setupEventListeners();
  }

  // ==========================================
  // HERO CAROUSEL LOGIC
  // ==========================================
  function setupCarousel() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    if (!track) return;

    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    BANNER_SLIDES.forEach((slide, index) => {
      // Create slide
      const slideDiv = document.createElement('div');
      slideDiv.className = 'carousel-slide';
      slideDiv.style.backgroundImage = `url('${slide.image}')`;
      slideDiv.innerHTML = `
        <div class="carousel-content">
          <span class="carousel-badge">${slide.badge}</span>
          <h2 class="carousel-title">${slide.title}</h2>
          <p class="carousel-tagline">${slide.tagline}</p>
          <button class="carousel-btn" data-cat="${slide.categoryFilter}">
            ${slide.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      slideDiv.querySelector('.carousel-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        setCategoryFilter(slide.categoryFilter);
        document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
      });

      track.appendChild(slideDiv);

      // Create dot
      const dot = document.createElement('div');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    document.getElementById('prevSlideBtn').addEventListener('click', () => {
      goToSlide((activeSlideIndex - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
    });

    document.getElementById('nextSlideBtn').addEventListener('click', () => {
      goToSlide((activeSlideIndex + 1) % BANNER_SLIDES.length);
    });

    // Auto rotate
    startCarouselAutoPlay();

    const container = document.getElementById('carouselContainer');
    container.addEventListener('mouseenter', () => clearInterval(carouselTimer));
    container.addEventListener('mouseleave', () => startCarouselAutoPlay());
  }

  function goToSlide(index) {
    activeSlideIndex = index;
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    if (track) {
      track.style.transform = `translateX(-${index * 100}%)`;
    }
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  function startCarouselAutoPlay() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
      goToSlide((activeSlideIndex + 1) % BANNER_SLIDES.length);
    }, 4500);
  }

  // ==========================================
  // DEAL OF THE DAY TICKER & SLIDER
  // ==========================================
  function setupDealTimer() {
    // Target 16 hours from now or end of day
    let remainingSeconds = 14 * 3600 + 42 * 60 + 15;

    function updateTicker() {
      remainingSeconds--;
      if (remainingSeconds < 0) remainingSeconds = 24 * 3600;

      const hrs = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      const secs = remainingSeconds % 60;

      if (dealTimerDisplay) {
        dealTimerDisplay.textContent = `${String(hrs).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s Left`;
      }
    }

    updateTicker();
    setInterval(updateTicker, 1000);
  }

  function renderDealSlider() {
    if (!dealSlider) return;
    const products = storage.getProducts();
    const deals = products.filter(p => p.dealOfDay || (p.originalPrice && p.price < p.originalPrice * 0.8));

    dealSlider.innerHTML = deals.map(p => {
      const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
      return `
        <div class="deal-item" data-id="${p.id}">
          <img src="${p.image}" alt="${p.title}" class="deal-item-img" loading="lazy">
          <h4 class="deal-item-title">${p.title}</h4>
          <span class="deal-item-offer">Min. ${discount}% Off</span>
          <span class="deal-item-tag">Grab Now</span>
        </div>
      `;
    }).join('');

    dealSlider.querySelectorAll('.deal-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        openProductDetail(id);
      });
    });
  }

  // ==========================================
  // PRODUCT CATALOG RENDERING & FILTERING
  // ==========================================
  function getFilteredProducts() {
    let list = storage.getProducts();

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.highlights && p.highlights.some(h => h.toLowerCase().includes(q)))
      );
    }

    // 2. Category
    if (currentCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // 3. Price Filter
    list = list.filter(p => p.price <= maxPrice);

    // 4. Assured Filter
    if (filterAssuredOnly) {
      list = list.filter(p => p.isAssured);
    }

    // 5. Min Rating
    if (filterMinRating > 0) {
      list = list.filter(p => p.rating >= filterMinRating);
    }

    // 6. Min Discount
    if (filterMinDiscount > 0) {
      list = list.filter(p => {
        if (!p.originalPrice || p.originalPrice <= p.price) return false;
        const disc = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        return disc >= filterMinDiscount;
      });
    }

    // 7. Seller Only
    if (filterSellerOnly) {
      list = list.filter(p => p.isSellerProduct);
    }

    // 8. Sorting
    switch (currentSort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        list.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      case 'newest':
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
      default:
        // Relevance
        break;
    }

    return list;
  }

  function renderProducts() {
    if (!productsGrid) return;
    const products = getFilteredProducts();

    if (resultsCount) {
      resultsCount.textContent = `(Showing 1 – ${products.length} of ${products.length} products)`;
    }

    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-catalog-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h4>No products found</h4>
          <p>Try adjusting your search query, clearing filters, or adding your own product!</p>
          <button class="btn-seller" id="btnEmptyAddProduct" style="margin: 0 auto; display: inline-flex;">
            + List Your Product Now
          </button>
        </div>
      `;

      const emptyAddBtn = document.getElementById('btnEmptyAddProduct');
      if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', openSellerModal);
      }
      return;
    }

    productsGrid.innerHTML = products.map(product => {
      const isWishlisted = storage.isInWishlist(product.id);
      const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

      return `
        <div class="product-card" data-id="${product.id}">
          ${product.isSellerProduct ? `<span class="seller-badge">Seller: You</span>` : ''}
          <div class="product-card-top">
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" title="Add to Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <div class="product-img-wrapper" data-click-detail="${product.id}">
              <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
          </div>

          <div class="product-info" data-click-detail="${product.id}">
            <div class="product-brand">${product.brand}</div>
            <h3 class="product-title" title="${product.title}">${product.title}</h3>

            <div class="rating-row">
              <span class="rating-badge">
                ${product.rating.toFixed(1)}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </span>
              <span class="rating-count">(${Number(product.ratingCount || 10).toLocaleString('en-IN')})</span>
              ${product.isAssured ? `
                <span class="assured-badge" title="Flipkart Assured">
                  <svg width="60" height="16" viewBox="0 0 75 20">
                    <rect width="75" height="20" rx="3" fill="#0071dc" />
                    <text x="6" y="14" fill="#ffffff" font-size="10" font-weight="bold" font-style="italic">FAssured</text>
                  </svg>
                </span>
              ` : ''}
            </div>

            <div class="price-row">
              <span class="current-price">₹${product.price.toLocaleString('en-IN')}</span>
              ${product.originalPrice && product.originalPrice > product.price ? `
                <span class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
                <span class="discount-tag">${discount}% off</span>
              ` : ''}
            </div>

            <div class="delivery-tag">
              <strong>Free delivery</strong> by Tomorrow
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-card-cart" data-cart-add="${product.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Cart
            </button>
            <button class="btn-card-buy" data-buy-now="${product.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              Buy
            </button>
          </div>

          ${product.isSellerProduct ? `
            <div class="seller-actions-row">
              <span style="font-size:11px; color:#666;">Stock: ${product.stock || 10}</span>
              <button class="btn-seller-delete" data-delete-id="${product.id}">Remove Product</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach card event listeners
    productsGrid.querySelectorAll('[data-click-detail]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.dataset.clickDetail;
        openProductDetail(id);
      });
    });

    productsGrid.querySelectorAll('[data-cart-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.cartAdd;
        addToCartAction(id);
      });
    });

    productsGrid.querySelectorAll('[data-buy-now]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.buyNow;
        storage.addToCart(id, 1);
        updateCartUI();
        openCheckoutModal();
      });
    });

    productsGrid.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.wishlistId;
        const res = storage.toggleWishlist(id);
        renderProducts();
        showToast(res.isAdded ? 'Added to your Wishlist!' : 'Removed from your Wishlist');
      });
    });

    productsGrid.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.deleteId;
        if (confirm('Are you sure you want to remove this product from your store?')) {
          storage.deleteProduct(id);
          renderProducts();
          renderDealSlider();
          updateCartUI();
          showToast('Product removed from store.');
        }
      });
    });
  }

  // ==========================================
  // CART ACTIONS & UI
  // ==========================================
  function addToCartAction(productId, qty = 1) {
    storage.addToCart(productId, qty);
    updateCartUI();
    const p = storage.getProductById(productId);
    showToast(`Added "${p ? p.title.substring(0, 24) + '...' : 'Item'}" to Cart!`);
  }

  function updateCartUI() {
    const count = storage.getCartCount();
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }

    renderCartDrawerContent();
  }

  function renderCartDrawerContent() {
    if (!cartItemsList) return;
    const cart = storage.getCart();
    const totals = storage.getCartTotals();

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5" style="margin-bottom: 12px;">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h4 style="font-size: 16px; margin-bottom: 6px;">Your Cart is Empty!</h4>
          <p style="font-size: 13px; color: #878787; margin-bottom: 16px;">Explore our catalog and add products you love.</p>
          <button class="btn-seller" id="btnShopNowCart" style="margin: 0 auto; display: inline-flex;">Shop Now</button>
        </div>
      `;
      const btn = document.getElementById('btnShopNowCart');
      if (btn) btn.addEventListener('click', closeCartDrawer);

      // Hide price summary
      document.getElementById('cartDrawerFooter').style.display = 'none';
      return;
    }

    document.getElementById('cartDrawerFooter').style.display = 'block';

    cartItemsList.innerHTML = cart.map(item => {
      const p = item.product;
      const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
      return `
        <div class="cart-item-card" data-id="${p.id}">
          <img src="${p.image}" alt="${p.title}" class="cart-item-img">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${p.title}</h4>
            <div class="cart-item-price-row">
              <span class="cart-item-price">₹${(p.price * item.quantity).toLocaleString('en-IN')}</span>
              ${p.originalPrice ? `<span class="cart-item-orig">₹${(p.originalPrice * item.quantity).toLocaleString('en-IN')}</span>` : ''}
              ${discount > 0 ? `<span class="cart-item-discount">${discount}% off</span>` : ''}
            </div>
            <div class="cart-qty-row">
              <div class="qty-control">
                <button class="qty-btn" data-qty-delta="-1" data-id="${p.id}">-</button>
                <span class="qty-num">${item.quantity}</span>
                <button class="qty-btn" data-qty-delta="1" data-id="${p.id}">+</button>
              </div>
              <button class="btn-remove-item" data-remove-id="${p.id}">REMOVE</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Update Price Summary
    document.getElementById('summaryItemCount').textContent = totals.itemCount;
    document.getElementById('summaryTotalMRP').textContent = `₹${totals.totalMRP.toLocaleString('en-IN')}`;
    document.getElementById('summaryDiscount').textContent = `- ₹${totals.discount.toLocaleString('en-IN')}`;
    document.getElementById('summaryDelivery').textContent = totals.deliveryCharge === 0 ? 'FREE' : `₹${totals.deliveryCharge}`;
    document.getElementById('summaryTotalAmount').textContent = `₹${totals.finalAmount.toLocaleString('en-IN')}`;
    document.getElementById('summarySavingsText').textContent = `You will save ₹${totals.savings.toLocaleString('en-IN')} on this order`;

    // Attach listeners
    cartItemsList.querySelectorAll('[data-qty-delta]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const delta = parseInt(btn.dataset.qtyDelta, 10);
        storage.updateCartQuantity(id, delta);
        updateCartUI();
      });
    });

    cartItemsList.querySelectorAll('[data-remove-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.removeId;
        storage.removeFromCart(id);
        updateCartUI();
        showToast('Item removed from cart.');
      });
    });
  }

  function openCartDrawer() {
    renderCartDrawerContent();
    cartDrawer.classList.add('active');
    cartDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove('active');
    cartDrawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ==========================================
  // PRODUCT DETAIL MODAL
  // ==========================================
  function openProductDetail(productId) {
    const product = storage.getProductById(productId);
    if (!product) return;
    activeProductDetail = product;

    const discount = product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const modalBody = document.getElementById('productDetailBody');
    const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

    modalBody.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-detail-gallery">
          <div class="detail-main-img-box">
            <img src="${imagesList[0]}" id="detailMainImg" alt="${product.title}">
          </div>
          <div class="detail-thumbs-row">
            ${imagesList.map((img, i) => `
              <div class="detail-thumb ${i === 0 ? 'active' : ''}" data-thumb-src="${img}">
                <img src="${img}" alt="Thumbnail ${i + 1}">
              </div>
            `).join('')}
          </div>
          <div class="detail-cta-row">
            <button class="btn-detail-cart" id="btnModalAddToCart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              ADD TO CART
            </button>
            <button class="btn-detail-buy" id="btnModalBuyNow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              BUY NOW
            </button>
          </div>
        </div>

        <div class="product-detail-info">
          <div style="font-size:12px; color:#878787; font-weight:700; text-transform:uppercase;">${product.brand}</div>
          <h2 class="detail-title">${product.title}</h2>

          <div class="rating-row">
            <span class="rating-badge">
              ${product.rating.toFixed(1)} ★
            </span>
            <span class="rating-count">${Number(product.ratingCount || 10).toLocaleString('en-IN')} Ratings & ${Number(product.reviewCount || 5).toLocaleString('en-IN')} Reviews</span>
            ${product.isAssured ? `
              <span class="assured-badge" title="Flipkart Assured">
                <svg width="60" height="16" viewBox="0 0 75 20"><rect width="75" height="20" rx="3" fill="#0071dc" /><text x="6" y="14" fill="#ffffff" font-size="10" font-weight="bold" font-style="italic">FAssured</text></svg>
              </span>
            ` : ''}
          </div>

          <div class="detail-price-box">
            <span style="font-size: 13px; color: #388e3c; font-weight: 700;">Special Price</span>
            <div class="detail-price-row">
              <span class="detail-current-price">₹${product.price.toLocaleString('en-IN')}</span>
              ${product.originalPrice ? `
                <span class="detail-orig-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
                <span class="detail-discount">${discount}% off</span>
              ` : ''}
            </div>
            <p style="font-size: 12px; color: #878787;">Inclusive of all taxes</p>
          </div>

          <div class="offers-section">
            <h4>Available Offers</h4>
            <ul class="offers-list">
              ${(product.offers && product.offers.length > 0 ? product.offers : [
                "Bank Offer: 10% Instant Discount on HDFC Bank Credit Cards",
                "Special Price: Extra ₹2,000 Off on Exchange",
                "Partner Offer: Sign up for Flipkart Pay Later & get free ₹250 Flipkart Gift Card"
              ]).map(o => `
                <li>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span>${o}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div style="border-top: 1px solid #f0f0f0; padding-top: 14px;">
            <label style="font-size: 13px; font-weight: 700; color: #212121;">Check Delivery</label>
            <div class="pincode-check-box">
              <input type="text" class="pincode-input" id="pincodeInput" placeholder="Enter Pincode" maxlength="6" value="560001">
              <button class="btn-pincode-check" id="btnCheckPincode">Check</button>
            </div>
            <div class="pincode-result" id="pincodeResult">
              ✓ Delivery by Tomorrow | Free ₹40
            </div>
          </div>

          <div class="specs-section">
            <h4>Highlights</h4>
            <ul class="specs-list">
              ${(product.highlights || ["100% Genuine Brand Product", "Fast Delivery by Flipkart Logistics", "7 Days Replacement Guarantee"]).map(h => `
                <li>${h}</li>
              `).join('')}
            </ul>
          </div>

          <div class="desc-section" style="border-top: 1px solid #f0f0f0; padding-top: 14px;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 6px;">Description</h4>
            <p style="font-size: 13px; color: #565656; line-height: 1.5;">${product.description || "Top rated product directly sourced from verified sellers and verified by Flipkart Assured standards."}</p>
          </div>
        </div>
      </div>
    `;

    // Thumbnail switching
    modalBody.querySelectorAll('.detail-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        modalBody.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        document.getElementById('detailMainImg').src = thumb.dataset.thumbSrc;
      });
    });

    // Pincode checker
    const btnPincode = document.getElementById('btnCheckPincode');
    const pinInput = document.getElementById('pincodeInput');
    const pinResult = document.getElementById('pincodeResult');
    btnPincode.addEventListener('click', () => {
      const pin = pinInput.value.trim();
      if (pin.length === 6 && /^\d+$/.test(pin)) {
        pinResult.textContent = `✓ Available for Pincode ${pin}! Delivery by Tomorrow, 5 PM (Free)`;
        pinResult.style.color = '#388e3c';
      } else {
        pinResult.textContent = 'Please enter a valid 6-digit Pincode';
        pinResult.style.color = '#d32f2f';
      }
    });

    // Modal Cart/Buy
    document.getElementById('btnModalAddToCart').addEventListener('click', () => {
      addToCartAction(product.id, 1);
      closeProductDetailModal();
    });

    document.getElementById('btnModalBuyNow').addEventListener('click', () => {
      closeProductDetailModal();
      storage.addToCart(product.id, 1);
      updateCartUI();
      openCheckoutModal();
    });

    productDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductDetailModal() {
    productDetailModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ==========================================
  // SELLER STUDIO ("BECOME A SELLER / ADD PRODUCT")
  // ==========================================
  function openSellerModal() {
    renderPresetImagePills();
    setupImageUploadHandlers();
    sellerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSellerModal() {
    sellerModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  let uploadedImageDataUrl = null;

  function setupImageUploadHandlers() {
    const fileInput = document.getElementById('sellerProductFileInput');
    const previewBox = document.getElementById('sellerImagePreviewBox');
    const previewImg = document.getElementById('sellerPreviewImg');
    const fileNameSpan = document.getElementById('sellerPreviewFileName');
    const btnRemove = document.getElementById('btnRemoveUploadedImage');
    const urlInput = document.getElementById('sellerProductImage');

    if (!fileInput || fileInput.dataset.listenerAttached) return;
    fileInput.dataset.listenerAttached = 'true';

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large! Please choose a file under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImageDataUrl = event.target.result;
        urlInput.value = uploadedImageDataUrl;
        previewImg.src = uploadedImageDataUrl;
        fileNameSpan.textContent = file.name;
        previewBox.style.display = 'flex';
        showToast('Photo uploaded from your computer!');
      };
      reader.readAsDataURL(file);
    });

    if (btnRemove) {
      btnRemove.addEventListener('click', () => {
        uploadedImageDataUrl = null;
        fileInput.value = '';
        urlInput.value = '';
        previewBox.style.display = 'none';
        showToast('Uploaded photo removed.');
      });
    }

    urlInput.addEventListener('input', () => {
      if (urlInput.value.trim() && !urlInput.value.startsWith('data:')) {
        previewBox.style.display = 'none';
        uploadedImageDataUrl = null;
      }
    });
  }

  function renderPresetImagePills() {
    const container = document.getElementById('presetImageContainer');
    if (!container) return;
    container.innerHTML = PRESET_PRODUCT_IMAGES.map(item => `
      <span class="preset-img-pill" data-img-url="${item.url}">${item.label}</span>
    `).join('');

    container.querySelectorAll('.preset-img-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.getElementById('sellerProductImage').value = pill.dataset.imgUrl;
        const previewBox = document.getElementById('sellerImagePreviewBox');
        if (previewBox) previewBox.style.display = 'none';
        uploadedImageDataUrl = null;
        showToast(`Selected "${pill.textContent}" image!`);
      });
    });
  }

  function handleSellerProductSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('sellerProductTitle').value.trim();
    const category = document.getElementById('sellerProductCategory').value;
    const brand = document.getElementById('sellerProductBrand').value.trim() || 'Custom Brand';
    const price = parseFloat(document.getElementById('sellerProductPrice').value);
    const originalPrice = parseFloat(document.getElementById('sellerProductOriginalPrice').value) || price;
    const stock = parseInt(document.getElementById('sellerProductStock').value, 10) || 10;
    const image = document.getElementById('sellerProductImage').value.trim() ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    const highlightsText = document.getElementById('sellerProductHighlights').value.trim();
    const description = document.getElementById('sellerProductDesc').value.trim() ||
      'High quality product offered directly from our verified seller store on Flipkart.';

    if (!title || isNaN(price) || price <= 0) {
      alert('Please provide a valid product title and price!');
      return;
    }

    const highlights = highlightsText ? highlightsText.split('\n').map(s => s.trim()).filter(Boolean) : [
      "Brand New & 100% Original",
      "Instant Dispatch & Quality Checked",
      "7 Days Replacement Available"
    ];

    const newProd = storage.addProduct({
      title,
      category,
      brand,
      price,
      originalPrice: originalPrice > price ? originalPrice : Math.round(price * 1.25),
      stock,
      image,
      images: [image],
      highlights,
      description,
      dealOfDay: true
    });

    closeSellerModal();
    // Reset form
    document.getElementById('sellerProductForm').reset();
    const previewBox = document.getElementById('sellerImagePreviewBox');
    if (previewBox) previewBox.style.display = 'none';
    uploadedImageDataUrl = null;

    // Render with new product at top
    renderProducts();
    renderDealSlider();

    // Scroll to products
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
    showToast(`🎉 "${title}" published to your Flipkart store!`);
  }

  // ==========================================
  // MULTI-STEP CHECKOUT & ORDER CONFIRMATION
  // ==========================================
  function openCheckoutModal() {
    closeCartDrawer();
    const cart = storage.getCart();
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }

    const successContainer = document.getElementById('checkoutOrderSuccess');
    if (successContainer) successContainer.style.display = 'none';
    const stepsBar = document.querySelector('.checkout-steps-bar');
    if (stepsBar) stepsBar.style.display = 'flex';

    renderCheckoutSummary();
    renderCheckoutPaymentSettings();
    syncPaymentMethodPanels();
    setCheckoutStep(1);
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function setCheckoutStep(stepNumber) {
    document.querySelectorAll('.checkout-step-content').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.checkout-step').forEach((s, idx) => {
      s.classList.toggle('active', idx + 1 === stepNumber);
    });

    const activeContent = document.getElementById(`checkoutStep${stepNumber}`);
    if (activeContent) activeContent.style.display = 'block';
  }

  function renderCheckoutSummary() {
    const totals = storage.getCartTotals();
    const summaryContainer = document.getElementById('checkoutOrderReview');
    if (!summaryContainer) return;

    const cart = storage.getCart();
    summaryContainer.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 14px; font-weight:700; margin-bottom: 8px;">Order Items (${totals.itemCount})</h4>
        <div style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          ${cart.map(i => `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; border-bottom:1px solid #f0f0f0; padding-bottom:6px;">
              <span>${i.product.title.substring(0, 32)}... (x${i.quantity})</span>
              <strong>₹${(i.product.price * i.quantity).toLocaleString('en-IN')}</strong>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="background:#f8f9fa; padding:12px; border-radius:4px; font-size:13px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Total MRP:</span>
          <span>₹${totals.totalMRP.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#388e3c; font-weight:bold;">
          <span>Discount:</span>
          <span>- ₹${totals.discount.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Delivery Charges:</span>
          <span style="color:#388e3c;">${totals.deliveryCharge === 0 ? 'FREE' : '₹' + totals.deliveryCharge}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:800; border-top:1px dashed #ccc; padding-top:6px; margin-top:6px;">
          <span>Total Amount to Pay:</span>
          <span style="color:#2874f0;">₹${totals.finalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
  }

  function syncPaymentMethodPanels() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const qrSection = document.getElementById('checkoutQrSection');
    const cardSection = document.getElementById('checkoutCardSection');
    const netBankingSection = document.getElementById('checkoutNetBankingSection');
    const qrNotice = document.getElementById('checkoutQrWhatsAppNotice');
    const codSection = document.getElementById('checkoutCodSection');

    if (qrSection) qrSection.style.display = selectedMethod === 'UPI / QR Code' ? 'block' : 'none';
    if (qrNotice) qrNotice.style.display = selectedMethod === 'UPI / QR Code' ? 'block' : 'none';
    if (cardSection) cardSection.style.display = selectedMethod === 'Credit / Debit / ATM Card' ? 'block' : 'none';
    if (netBankingSection) netBankingSection.style.display = selectedMethod === 'Net Banking' ? 'block' : 'none';
    if (codSection) codSection.style.display = selectedMethod === 'Cash on Delivery' ? 'block' : 'none';
  }

  function renderCheckoutPaymentSettings() {
    const settings = storage.getPaymentSettings();
    const qrOption = document.getElementById('labelPayUPI');
    const qrSection = document.getElementById('checkoutQrSection');
    const qrImage = document.getElementById('checkoutQrImg');
    const qrUpiId = document.getElementById('checkoutUpiId');
    const qrMerchantName = document.getElementById('checkoutMerchantName');
    const qrMerchantNameInline = document.getElementById('checkoutMerchantNameInline');
    const qrWhatsAppNumber = document.getElementById('checkoutWhatsAppNumber');
    const qrInstructions = document.getElementById('checkoutQrInstructions');
    const qrAmount = document.getElementById('checkoutQrAmount');
    const qrNotice = document.getElementById('checkoutQrWhatsAppNotice');
    const qrInput = qrOption?.querySelector('input[name="paymentMethod"]');
    const qrEnabled = settings.enableQrPayment !== false && !!settings.qrCodeUrl;
    const whatsappNumber = settings.whatsappNumber || '+91 98765 43210';

    if (qrOption) qrOption.style.display = qrEnabled ? '' : 'none';
    if (qrSection) qrSection.style.display = qrEnabled ? 'block' : 'none';
    if (qrNotice) qrNotice.style.display = qrEnabled ? 'block' : 'none';
    if (qrImage && qrEnabled) qrImage.src = settings.qrCodeUrl;
    if (qrUpiId) qrUpiId.textContent = settings.upiId || 'Payment QR';
    if (qrMerchantName) qrMerchantName.textContent = settings.merchantName || 'Store payment';
    if (qrMerchantNameInline) qrMerchantNameInline.textContent = settings.merchantName || 'Store payment';
    if (qrWhatsAppNumber) qrWhatsAppNumber.textContent = whatsappNumber;
    if (qrInstructions) qrInstructions.textContent = settings.instructions || 'Scan this QR code using your UPI app to complete payment.';
    if (qrAmount) qrAmount.textContent = `₹${storage.getCartTotals().finalAmount.toLocaleString('en-IN')}`;

    if (!qrEnabled && qrInput?.checked) {
      const fallback = document.querySelector('input[name="paymentMethod"]:not([value="UPI / QR Code"])');
      if (fallback) fallback.checked = true;
    }
  }

  function handleOrderConfirmation() {
    const name = document.getElementById('addrName').value.trim() || 'Customer';
    const phone = document.getElementById('addrPhone').value.trim() || '9876543210';
    const address = document.getElementById('addrStreet').value.trim() || '123 Tech Park';
    const city = document.getElementById('addrCity').value.trim() || 'Bangalore';
    const pincode = document.getElementById('addrPincode').value.trim() || '560001';
    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'UPI';
    const settings = storage.getPaymentSettings();

    if (paymentMethod === 'Credit / Debit / ATM Card') {
      const cardNumber = document.getElementById('cardNumberInput')?.value.trim();
      const expiry = document.getElementById('cardExpiryInput')?.value.trim();
      const cvv = document.getElementById('cardCvvInput')?.value.trim();
      const nameOnCard = document.getElementById('cardNameInput')?.value.trim();
      if (!cardNumber || !expiry || !cvv || !nameOnCard) {
        alert('Please complete the credit card details before placing the order.');
        return;
      }
    }

    if (paymentMethod === 'Net Banking') {
      const bank = document.getElementById('netBankingSelect')?.value.trim();
      const accountHolder = document.getElementById('netBankingUserInput')?.value.trim();
      if (!bank || !accountHolder) {
        alert('Please select your bank and enter the account holder name.');
        return;
      }
    }

    const cart = storage.getCart();
    const totals = storage.getCartTotals();

    const needsQrConfirmation = paymentMethod === 'UPI / QR Code';

    const order = storage.createOrder({
      customer: { name, phone, address, city, pincode },
      items: cart,
      totals,
      paymentMethod,
      status: needsQrConfirmation ? 'Awaiting Payment Confirmation' : 'Confirmed'
    });

    // Show Confirmation View inside Modal
    document.querySelectorAll('.checkout-step-content').forEach(s => s.style.display = 'none');
    document.querySelector('.checkout-steps-bar').style.display = 'none';

    const successContainer = document.getElementById('checkoutOrderSuccess');
    successContainer.style.display = 'block';
    if (needsQrConfirmation) {
      successContainer.innerHTML = `
        <div class="order-success-screen">
          <div class="success-icon-box" style="background:#fff3cd; color:#b7791f;">⏳</div>
          <h3>Payment Processing</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 12px;">Please complete the QR payment and send the proof to WhatsApp for order confirmation.</p>
          <span class="order-id-badge">Order ID: ${order.orderId}</span>

          <div style="background: #fff7e6; border: 1px solid #f3bb63; border-radius: 8px; padding: 16px; max-width: 420px; margin: 0 auto 20px; text-align: left; font-size: 13px;">
            <div style="margin-bottom: 8px;"><strong>WhatsApp Confirmation:</strong> ${settings.whatsappNumber || '+91 98765 43210'}</div>
            <div style="margin-bottom: 8px;"><strong>Order Amount:</strong> ₹${totals.finalAmount.toLocaleString('en-IN')}</div>
            <div style="margin-bottom: 8px;"><strong>Message:</strong> Send the payment screenshot via WhatsApp to the number above. The order will be placed only after confirmation.</div>
          </div>

          <div style="display:flex; justify-content:center; gap:12px;">
            <button class="btn-publish-product" id="btnContinueShopping" style="width:auto; margin-top:0;">Continue Shopping</button>
          </div>
        </div>
      `;
    } else {
      successContainer.innerHTML = `
        <div class="order-success-screen">
          <div class="success-icon-box">✓</div>
          <h3>Order Placed Successfully!</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 12px;">Thank you for shopping with us.</p>
          <span class="order-id-badge">Order ID: ${order.orderId}</span>

          <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; max-width: 420px; margin: 0 auto 20px; text-align: left; font-size: 13px;">
            <div style="margin-bottom: 6px;"><strong>Delivery To:</strong> ${name}, ${phone}</div>
            <div style="margin-bottom: 6px;"><strong>Address:</strong> ${address}, ${city} - ${pincode}</div>
            <div style="margin-bottom: 6px;"><strong>Estimated Delivery:</strong> <span style="color:#388e3c; font-weight:bold;">${order.estimatedDelivery}</span></div>
            <div style="margin-bottom: 6px;"><strong>Payment Method:</strong> ${paymentMethod}</div>
            <div style="margin-bottom: 6px;"><strong>Total Paid:</strong> ₹${totals.finalAmount.toLocaleString('en-IN')}</div>
          </div>

          <div style="display:flex; justify-content:center; gap:12px;">
            <button class="btn-publish-product" id="btnContinueShopping" style="width:auto; margin-top:0;">Continue Shopping</button>
          </div>
        </div>
      `;
    }

    document.getElementById('btnContinueShopping').addEventListener('click', () => {
      closeCheckoutModal();
      document.querySelector('.checkout-steps-bar').style.display = 'flex';
      setCheckoutStep(1);
      renderProducts();
    });

    updateCartUI();
    showToast(`Order #${order.orderId} Placed! 🎉`);
  }

  // ==========================================
  // WISHLIST MODAL
  // ==========================================
  function openWishlistModal() {
    const list = storage.getWishlist();
    const container = document.getElementById('wishlistItemsContainer');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5" style="margin-bottom: 10px;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <h4 style="font-size: 16px; margin-bottom: 6px;">Empty Wishlist</h4>
          <p style="font-size: 13px; color: #878787;">You have not saved any items yet. Tap the heart icon on any product.</p>
        </div>
      `;
    } else {
      const products = list.map(id => storage.getProductById(id)).filter(Boolean);
      container.innerHTML = products.map(p => `
        <div style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; align-items: center;">
          <img src="${p.image}" alt="${p.title}" style="width: 60px; height: 60px; object-fit: contain;">
          <div style="flex: 1;">
            <h4 style="font-size: 13px; font-weight: 600;">${p.title}</h4>
            <div style="font-weight: 700; color: #212121; font-size: 14px; margin-top: 4px;">₹${p.price.toLocaleString('en-IN')}</div>
          </div>
          <button class="btn-seller" data-wish-to-cart="${p.id}" style="padding: 6px 12px; font-size: 12px;">Move to Cart</button>
          <button data-wish-del="${p.id}" style="color: #d32f2f; font-size: 18px; padding: 4px;">✕</button>
        </div>
      `).join('');

      container.querySelectorAll('[data-wish-to-cart]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.wishToCart;
          storage.addToCart(id, 1);
          storage.removeFromWishlist(id);
          updateCartUI();
          openWishlistModal();
          renderProducts();
          showToast('Moved to Cart!');
        });
      });

      container.querySelectorAll('[data-wish-del]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.wishDel;
          storage.removeFromWishlist(id);
          openWishlistModal();
          renderProducts();
          showToast('Removed from Wishlist');
        });
      });
    }

    wishlistModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ==========================================
  // FILTERS & SEARCH
  // ==========================================
  function setCategoryFilter(category) {
    currentCategory = category;
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.category === category);
    });

    const catCheckbox = document.querySelector(`input[name="catFilter"][value="${category}"]`);
    if (catCheckbox) {
      document.querySelectorAll('input[name="catFilter"]').forEach(c => c.checked = false);
      catCheckbox.checked = true;
    }

    renderProducts();
  }

  function handleLiveSearch(query) {
    searchQuery = query;
    if (!searchSuggestions) return;

    if (!query.trim()) {
      searchSuggestions.classList.remove('active');
      searchSuggestions.innerHTML = '';
      return;
    }

    const q = query.toLowerCase().trim();
    const all = storage.getProducts();
    const matches = all.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 5);

    if (matches.length === 0) {
      searchSuggestions.classList.remove('active');
      return;
    }

    searchSuggestions.innerHTML = matches.map(m => `
      <div class="suggestion-item" data-id="${m.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>${m.title}</span>
        <span style="margin-left:auto; font-size:11px; color:#878787;">in ${m.category}</span>
      </div>
    `).join('');

    searchSuggestions.classList.add('active');

    searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        searchSuggestions.classList.remove('active');
        openProductDetail(id);
      });
    });
  }

  // ==========================================
  // EVENT LISTENERS BINDING
  // ==========================================
  function getSavedCustomer() {
    try {
      const raw = localStorage.getItem('flipkartCustomer');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveCustomerSession(customer) {
    localStorage.setItem('flipkartCustomer', JSON.stringify(customer));
  }

  function initializeGoogleSignIn() {
    const clientId = window.STORE_CONFIG?.googleClientId?.trim();
    const fallbackButton = document.getElementById('googleLoginFallback');
    const googleButton = document.getElementById('googleSignInButton');
    if (!clientId || !fallbackButton || !googleButton || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
      auto_select: false,
      context: 'signin'
    });
    window.google.accounts.id.renderButton(googleButton, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(googleButton.parentElement.clientWidth, 400)
    });
    fallbackButton.hidden = true;
    googleButton.hidden = false;
  }

  async function handleGoogleCredentialResponse(googleResponse) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: googleResponse.credential })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Google sign-in failed.');

      const customer = {
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || '',
        method: 'google',
        lastLogin: new Date().toISOString()
      };
      saveCustomerSession(customer);
      updateLoginButtonState();
      closeLoginModal();
      showToast(`Welcome, ${customer.name}!`);
    } catch (error) {
      showToast(error.message || 'Google sign-in could not connect to the server.');
    }
  }

  function updateLoginButtonState() {
    const loginBtn = document.getElementById('btnLoginBtn');
    if (!loginBtn) return;

    const customer = getSavedCustomer();
    if (customer && customer.name) {
      loginBtn.textContent = customer.name;
      loginBtn.title = `Logged in as ${customer.name}`;
      loginBtn.setAttribute('data-logged-in', 'true');
      return;
    }

    loginBtn.textContent = 'Login';
    loginBtn.removeAttribute('data-logged-in');
    loginBtn.title = 'Login';
  }

  function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) return;
    setAuthMode('login');
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) return;
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
    setAuthMode('login');
  }

  function setAuthMode(mode) {
    const loginPanel = document.getElementById('loginFormPanel');
    const signupPanel = document.getElementById('signupFormPanel');
    const loginFooter = document.getElementById('loginFooterText');
    const signupFooter = document.getElementById('signupFooterText');
    const title = document.querySelector('.login-panel h4');
    const isSignup = mode === 'signup';

    if (loginPanel) loginPanel.hidden = isSignup;
    if (signupPanel) signupPanel.hidden = !isSignup;
    if (loginFooter) loginFooter.hidden = isSignup;
    if (signupFooter) signupFooter.hidden = !isSignup;

    if (title) {
      title.textContent = isSignup ? 'Create your account' : 'Choose a login option';
    }

    if (isSignup) {
      const signupName = document.getElementById('signupName');
      if (signupName) signupName.focus();
    } else {
      const loginIdentifier = document.getElementById('loginIdentifier');
      if (loginIdentifier) loginIdentifier.focus();
    }
  }

  function handleLoginOptionSelection(method) {
    if (method === 'google') {
      const clientId = window.STORE_CONFIG?.googleClientId?.trim();
      showToast(clientId
        ? 'Google sign-in is unavailable. Check your connection and reload the page.'
        : 'Google sign-in needs a Google OAuth Client ID. See README.md for setup.');
      return;
    }

    activeLoginMethod = method;
    const identifierField = document.getElementById('loginIdentifier');
    if (!identifierField) return;

    const defaultValues = {
      phone: '9876543210',
      email: 'customer@example.com',
      apple: 'customer@icloud.com'
    };

    identifierField.value = defaultValues[method] || 'customer@example.com';
    const passwordField = document.getElementById('loginPassword');
    if (passwordField) {
      passwordField.value = 'password123';
      passwordField.placeholder = `${method.charAt(0).toUpperCase() + method.slice(1)} account password`;
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!identifier || !password) {
      showToast('Please enter your mobile number/email and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to log in.');
      }

      const customer = {
        name: result.user.name,
        email: result.user.email || '',
        phone: result.user.phone || '',
        method: activeLoginMethod,
        lastLogin: new Date().toISOString()
      };

      saveCustomerSession(customer);
      updateLoginButtonState();
      closeLoginModal();
      showToast(`Welcome back, ${result.user.name}!`);
    } catch (error) {
      const lastCustomer = getSavedCustomer();
      if (lastCustomer && lastCustomer.name) {
        saveCustomerSession(lastCustomer);
        updateLoginButtonState();
        closeLoginModal();
        showToast(`Welcome back, ${lastCustomer.name}!`);
        return;
      }

      showToast(error.message || 'Server connection failed. Please start the Flask API.');
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!name || !phone || !email || !password) {
      showToast('Please fill in all account details before continuing.');
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          phone: digitsOnly,
          email,
          password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to create account.');
      }

      const customer = {
        name: result.user.name,
        email: result.user.email || '',
        phone: result.user.phone || '',
        method: 'email',
        lastLogin: new Date().toISOString()
      };

      saveCustomerSession(customer);
      updateLoginButtonState();
      closeLoginModal();
      showToast(`Welcome, ${customer.name}! Your account is ready.`);
    } catch (error) {
      showToast(error.message || 'Could not create the account. Please try again.');
    }
  }

  function setupEventListeners() {
    const addClickHandler = (id, callback) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('click', callback);
      }
    };

    // Header Login Modal
    const loginBtn = document.getElementById('btnLoginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', openLoginModal);
    }

    const loginModal = document.getElementById('loginModal');
    const loginModalClose = document.getElementById('loginModalClose');
    if (loginModalClose) {
      loginModalClose.addEventListener('click', closeLoginModal);
    }
    if (loginModal) {
      loginModal.addEventListener('click', (event) => {
        if (event.target === loginModal) closeLoginModal();
      });
    }

    document.querySelectorAll('.login-option-btn').forEach((button) => {
      button.addEventListener('click', () => handleLoginOptionSelection(button.dataset.loginType));
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLoginSubmit);
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSignupSubmit);
    }

    document.querySelectorAll('[data-auth-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.authAction;
        if (action === 'signup') {
          setAuthMode('signup');
          return;
        }
        if (action === 'login') {
          setAuthMode('login');
        }
      });
    });

    // Header Search
    if (searchInput) {
      searchInput.addEventListener('input', (e) => handleLiveSearch(e.target.value));
    }
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchSuggestions.classList.remove('active');
        renderProducts();
        document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
      }
    });

    searchBtn.addEventListener('click', () => {
      searchSuggestions.classList.remove('active');
      renderProducts();
      document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        searchSuggestions.classList.remove('active');
      }
    });

    // Category Bar Pills
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        setCategoryFilter(pill.dataset.category);
      });
    });

    // Price Slider
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        maxPrice = parseInt(e.target.value, 10);
        if (maxPriceDisplay) {
          maxPriceDisplay.textContent = `₹${maxPrice.toLocaleString('en-IN')}`;
        }
        renderProducts();
      });
    }

    // Sidebar Category Radio/Checkboxes
    document.querySelectorAll('input[name="catFilter"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          setCategoryFilter(e.target.value);
        }
      });
    });

    // Assured Filter Checkbox
    const assuredFilter = document.getElementById('filterAssured');
    if (assuredFilter) {
      assuredFilter.addEventListener('change', (e) => {
        filterAssuredOnly = e.target.checked;
        renderProducts();
      });
    }

    // My Products Filter
    const sellerFilter = document.getElementById('filterSellerOnly');
    if (sellerFilter) {
      sellerFilter.addEventListener('change', (e) => {
        filterSellerOnly = e.target.checked;
        renderProducts();
      });
    }

    // Rating Filter Radios
    document.querySelectorAll('input[name="ratingFilter"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          filterMinRating = parseFloat(e.target.value);
          renderProducts();
        }
      });
    });

    // Discount Filter Radios
    document.querySelectorAll('input[name="discountFilter"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          filterMinDiscount = parseInt(e.target.value, 10);
          renderProducts();
        }
      });
    });

    // Clear Filters Button
    document.getElementById('btnClearFilters').addEventListener('click', () => {
      currentCategory = 'all';
      searchQuery = '';
      searchInput.value = '';
      maxPrice = 150000;
      if (priceSlider) priceSlider.value = 150000;
      if (maxPriceDisplay) maxPriceDisplay.textContent = '₹1,50,000';
      filterAssuredOnly = false;
      if (assuredFilter) assuredFilter.checked = false;
      filterSellerOnly = false;
      if (sellerFilter) sellerFilter.checked = false;
      filterMinRating = 0;
      filterMinDiscount = 0;

      document.querySelectorAll('input[name="catFilter"]').forEach(c => c.checked = c.value === 'all');
      document.querySelectorAll('input[name="ratingFilter"]').forEach(r => r.checked = r.value === '0');
      document.querySelectorAll('input[name="discountFilter"]').forEach(d => d.checked = d.value === '0');
      document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.category === 'all');
      });

      renderProducts();
      showToast('Filters reset.');
    });

    // Sort Tabs
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = btn.dataset.sort;
        renderProducts();
      });
    });

    // Header Buttons
    addClickHandler('btnOpenCart', openCartDrawer);
    addClickHandler('cartDrawerClose', closeCartDrawer);
    if (cartDrawerOverlay) {
      cartDrawerOverlay.addEventListener('click', closeCartDrawer);
    }

    // Become a Seller Modal triggers
    const btnBecomeSeller = document.getElementById('btnBecomeSeller');
    const btnBannerAddProduct = document.getElementById('btnBannerAddProduct');
    const sellerModalClose = document.getElementById('sellerModalClose');
    if (btnBecomeSeller) btnBecomeSeller.addEventListener('click', openSellerModal);
    if (btnBannerAddProduct) btnBannerAddProduct.addEventListener('click', openSellerModal);
    if (sellerModalClose) sellerModalClose.addEventListener('click', closeSellerModal);
    if (sellerModal) {
      sellerModal.addEventListener('click', (e) => {
        if (e.target === sellerModal) closeSellerModal();
      });
    }

    // Seller Form Submit
    const sellerProductForm = document.getElementById('sellerProductForm');
    if (sellerProductForm) {
      sellerProductForm.addEventListener('submit', handleSellerProductSubmit);
    }

    // Product Detail Modal Close
    addClickHandler('productDetailClose', closeProductDetailModal);
    if (productDetailModal) {
      productDetailModal.addEventListener('click', (e) => {
        if (e.target === productDetailModal) closeProductDetailModal();
      });
    }

    // Wishlist Modal
    addClickHandler('btnOpenWishlist', openWishlistModal);
    addClickHandler('wishlistModalClose', () => {
      if (wishlistModal) {
        wishlistModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    if (wishlistModal) {
      wishlistModal.addEventListener('click', (e) => {
        if (e.target === wishlistModal) {
          wishlistModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Cart Drawer Place Order Button
    addClickHandler('btnCartPlaceOrder', openCheckoutModal);

    // Checkout Modal Navigation
    addClickHandler('checkoutModalClose', closeCheckoutModal);
    if (checkoutModal) {
      checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckoutModal();
      });
    }

    addClickHandler('btnStep1Next', () => {
      const name = document.getElementById('addrName')?.value.trim();
      const phone = document.getElementById('addrPhone')?.value.trim();
      const street = document.getElementById('addrStreet')?.value.trim();
      if (!name || !phone || !street) {
        alert('Please complete the mandatory address fields (Name, Phone, Address)!');
        return;
      }
      setCheckoutStep(2);
    });

    addClickHandler('btnStep2Back', () => setCheckoutStep(1));
    addClickHandler('btnStep2Next', () => setCheckoutStep(3));

    document.querySelectorAll('input[name="paymentMethod"]').forEach((paymentInput) => {
      paymentInput.addEventListener('change', syncPaymentMethodPanels);
    });

    addClickHandler('btnStep3Back', () => setCheckoutStep(2));
    addClickHandler('btnConfirmOrder', handleOrderConfirmation);

    // Auto calculate discount percentage in seller modal
    const sellPriceInp = document.getElementById('sellerProductPrice');
    const origPriceInp = document.getElementById('sellerProductOriginalPrice');
    const discHint = document.getElementById('sellerDiscountHint');

    function updateSellerDiscountPreview() {
      if (!sellPriceInp || !origPriceInp || !discHint) return;
      const sp = parseFloat(sellPriceInp.value);
      const mrp = parseFloat(origPriceInp.value);
      if (sp && mrp && mrp > sp) {
        const disc = Math.round(((mrp - sp) / mrp) * 100);
        discHint.textContent = `Discount: ${disc}% Off (Customers love deals > 20%!)`;
        discHint.style.color = '#388e3c';
      } else {
        discHint.textContent = '';
      }
    }
    if (sellPriceInp) sellPriceInp.addEventListener('input', updateSellerDiscountPreview);
    if (origPriceInp) origPriceInp.addEventListener('input', updateSellerDiscountPreview);

    // Reset Catalog Button in Footer
    const btnResetData = document.getElementById('btnResetCatalogData');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Reset store catalog to initial Flipkart sample products?')) {
          storage.resetToDefaultCatalog();
          renderProducts();
          renderDealSlider();
          showToast('Catalog restored to default.');
        }
      });
    }
  }

  // Run!
  init();
});
