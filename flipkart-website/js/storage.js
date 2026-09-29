// Storage Manager for Local Persistence
const STORAGE_KEYS = {
  PRODUCTS: 'flipkart_store_products',
  CART: 'flipkart_store_cart',
  WISHLIST: 'flipkart_store_wishlist',
  ORDERS: 'flipkart_store_orders',
  PAYMENT_SETTINGS: 'flipkart_store_payment_settings'
};

const DEFAULT_PAYMENT_SETTINGS = {
  enableQrPayment: true,
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dflipkartpay%40okhdfcbank%26pn%3DFlipkart%2520India%2520Pvt%2520Ltd%26cu%3DINR',
  upiId: 'flipkartpay@okhdfcbank',
  merchantName: 'Flipkart India Pvt Ltd',
  whatsappNumber: '+91 98765 43210',
  instructions: 'Scan this official QR code using Google Pay, PhonePe, Paytm, BHIM, or any UPI app to pay. Send the payment screenshot via WhatsApp to the seller after scanning.'
};

class StoreStorage {
  constructor() {
    this.initProducts();
  }

  // Initialize products: merge defaults with any user-added seller items
  initProducts() {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
  }

  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    } catch (e) {
      console.error("Failed to parse products", e);
      return DEFAULT_PRODUCTS;
    }
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  // Add a new product (Seller Studio)
  addProduct(newProduct) {
    const products = this.getProducts();
    const product = {
      ...newProduct,
      id: 'seller-' + Date.now(),
      rating: 4.8,
      ratingCount: 1,
      reviewCount: 1,
      isAssured: true,
      isSellerProduct: true,
      createdAt: new Date().toISOString()
    };
    products.unshift(product); // Add to beginning of catalog
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return product;
  }

  // Update an existing product (Admin Panel)
  updateProduct(productId, updatedFields) {
    let products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index > -1) {
      products[index] = {
        ...products[index],
        ...updatedFields,
        id: productId // preserve ID
      };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return products[index];
    }
    return null;
  }

  // Delete a product
  deleteProduct(productId) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    // Also remove from cart and wishlist if present
    this.removeFromCart(productId);
    this.removeFromWishlist(productId);
  }

  // Reset to default sample catalog
  resetToDefaultCatalog() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  }

  // CART OPERATIONS
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }

  addToCart(productId, quantity = 1) {
    const cart = this.getCart();
    const product = this.getProductById(productId);
    if (!product) return cart;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: productId,
        quantity: quantity,
        product: product
      });
    }
    this.saveCart(cart);
    return cart;
  }

  updateCartQuantity(productId, delta) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
      }
    }
    this.saveCart(cart);
    return cart;
  }

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(i => i.id !== productId);
    this.saveCart(cart);
    return cart;
  }

  clearCart() {
    this.saveCart([]);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotals() {
    const cart = this.getCart();
    let totalMRP = 0;
    let totalSellingPrice = 0;

    cart.forEach(item => {
      const orig = item.product.originalPrice || item.product.price;
      totalMRP += orig * item.quantity;
      totalSellingPrice += item.product.price * item.quantity;
    });

    const discount = totalMRP - totalSellingPrice;
    const deliveryCharge = totalSellingPrice > 500 ? 0 : 40;
    const packagingFee = cart.length > 0 ? 29 : 0;
    const finalAmount = totalSellingPrice + deliveryCharge + packagingFee;

    return {
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      totalMRP,
      totalSellingPrice,
      discount,
      deliveryCharge,
      packagingFee,
      finalAmount,
      savings: discount
    };
  }

  // WISHLIST OPERATIONS
  getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productId);
      isAdded = true;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    return { wishlist, isAdded };
  }

  isInWishlist(productId) {
    const wishlist = this.getWishlist();
    return wishlist.includes(productId);
  }

  removeFromWishlist(productId) {
    let wishlist = this.getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }

  // ORDER OPERATIONS
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  createOrder(orderDetails) {
    const orders = this.getOrders();
    const newOrder = {
      orderId: 'OD' + Math.floor(1000000000 + Math.random() * 9000000000),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      status: 'Confirmed',
      ...orderDetails
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.clearCart();
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    let orders = this.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      order.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
    return orders;
  }

  // PAYMENT & QR SETTINGS
  getPaymentSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
      return data ? { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(data) } : DEFAULT_PAYMENT_SETTINGS;
    } catch (e) {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  }

  savePaymentSettings(settings) {
    const current = this.getPaymentSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

const storage = new StoreStorage();
