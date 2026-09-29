// Flipkart Seller Hub - Admin Dashboard Controller
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const productsTableBody = document.getElementById('adminProductsTableBody');
  const ordersTableBody = document.getElementById('adminOrdersTableBody');
  const searchInput = document.getElementById('adminSearchInput');
  const categoryFilter = document.getElementById('adminCategoryFilter');
  const stockFilter = document.getElementById('adminStockFilter');
  const sourceFilter = document.getElementById('adminSourceFilter');

  // KPI elements
  const kpiTotalProducts = document.getElementById('kpiTotalProducts');
  const kpiTotalValue = document.getElementById('kpiTotalValue');
  const kpiTotalOrders = document.getElementById('kpiTotalOrders');
  const kpiLowStock = document.getElementById('kpiLowStock');
  const ordersCountBadge = document.getElementById('ordersCountBadge');

  const adminPaymentSettingsForm = document.getElementById('adminPaymentSettingsForm');
  const adminQrFileInput = document.getElementById('adminQrFileInput');
  const adminQrCodeUrl = document.getElementById('adminQrCodeUrl');
  const adminQrPreview = document.getElementById('adminQrPreview');
  const adminEnableQrPayment = document.getElementById('adminEnableQrPayment');
  const adminUpiId = document.getElementById('adminUpiId');
  const adminMerchantName = document.getElementById('adminMerchantName');
  const adminWhatsAppNumber = document.getElementById('adminWhatsAppNumber');
  const adminPaymentInstructions = document.getElementById('adminPaymentInstructions');

  // Modal elements
  const productEditModal = document.getElementById('productEditModal');
  const btnEditModalClose = document.getElementById('btnEditModalClose');
  const adminProductForm = document.getElementById('adminProductForm');
  const modalTitle = document.getElementById('modalTitle');
  const btnSubmitProduct = document.getElementById('btnSubmitProduct');

  // Form Fields
  const editProductId = document.getElementById('editProductId');
  const editTitle = document.getElementById('editTitle');
  const editCategory = document.getElementById('editCategory');
  const editBrand = document.getElementById('editBrand');
  const editPrice = document.getElementById('editPrice');
  const editOriginalPrice = document.getElementById('editOriginalPrice');
  const editStock = document.getElementById('editStock');
  const editImageUrl = document.getElementById('editImageUrl');
  const editHighlights = document.getElementById('editHighlights');
  const editDescription = document.getElementById('editDescription');
  const editIsAssured = document.getElementById('editIsAssured');
  const editDealOfDay = document.getElementById('editDealOfDay');

  // Photo Upload elements
  const adminFileInput = document.getElementById('adminFileInput');
  const adminPreviewImg = document.getElementById('adminPreviewImg');
  const adminPreviewFilename = document.getElementById('adminPreviewFilename');

  let activeImageDataUrl = null;
  let activeQrDataUrl = null;

  // Init
  function init() {
    renderKPIs();
    renderProductsTable();
    renderOrdersTable();
    loadPaymentSettings();
    setupEventListeners();
  }

  function loadPaymentSettings() {
    const settings = storage.getPaymentSettings();
    adminQrCodeUrl.value = settings.qrCodeUrl || '';
    adminQrPreview.src = settings.qrCodeUrl || '';
    adminEnableQrPayment.checked = settings.enableQrPayment !== false;
    adminUpiId.value = settings.upiId || '';
    adminMerchantName.value = settings.merchantName || '';
    adminWhatsAppNumber.value = settings.whatsappNumber || '';
    adminPaymentInstructions.value = settings.instructions || '';
  }

  function handlePaymentSettingsSubmit(e) {
    e.preventDefault();
    const qrCodeUrl = activeQrDataUrl || adminQrCodeUrl.value.trim();
    if (!qrCodeUrl) {
      alert('Please upload a QR code or provide an image link.');
      return;
    }

    storage.savePaymentSettings({
      enableQrPayment: adminEnableQrPayment.checked,
      qrCodeUrl,
      upiId: adminUpiId.value.trim(),
      merchantName: adminMerchantName.value.trim(),
      whatsappNumber: adminWhatsAppNumber.value.trim(),
      instructions: adminPaymentInstructions.value.trim()
    });
    activeQrDataUrl = null;
    showAdminToast('Payment settings saved. Customers will see the updated QR at checkout.');
  }

  // ==========================================
  // KPI STATS CALCULATION
  // ==========================================
  function renderKPIs() {
    const products = storage.getProducts();
    const orders = storage.getOrders();

    const totalItems = products.length;
    let totalVal = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      const stock = typeof p.stock === 'number' ? p.stock : 10;
      totalVal += (p.price || 0) * stock;
      if (stock <= 5) lowStockCount++;
    });

    if (kpiTotalProducts) kpiTotalProducts.textContent = totalItems;
    if (kpiTotalValue) kpiTotalValue.textContent = `₹${totalVal.toLocaleString('en-IN')}`;
    if (kpiTotalOrders) kpiTotalOrders.textContent = orders.length;
    if (ordersCountBadge) ordersCountBadge.textContent = orders.length;
    if (kpiLowStock) kpiLowStock.textContent = lowStockCount;
  }

  // ==========================================
  // PRODUCTS TABLE RENDERING & FILTERING
  // ==========================================
  function getFilteredProducts() {
    let list = storage.getProducts();
    const query = (searchInput.value || '').toLowerCase().trim();
    const cat = categoryFilter.value;
    const stockStatus = stockFilter.value;
    const source = sourceFilter.value;

    if (query) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        (p.id || '').toLowerCase().includes(query)
      );
    }

    if (cat !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }

    if (stockStatus === 'instock') {
      list = list.filter(p => (p.stock || 10) > 5);
    } else if (stockStatus === 'lowstock') {
      list = list.filter(p => (p.stock || 10) <= 5 && (p.stock || 10) > 0);
    } else if (stockStatus === 'outstock') {
      list = list.filter(p => (p.stock || 10) === 0);
    }

    if (source === 'seller') {
      list = list.filter(p => p.isSellerProduct);
    }

    return list;
  }

  function renderProductsTable() {
    if (!productsTableBody) return;
    const products = getFilteredProducts();

    if (products.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: #888;">
            No matching products found. Try adjusting your search or filters.
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = products.map((p, index) => {
      const stock = typeof p.stock === 'number' ? p.stock : 10;
      let stockBadgeClass = 'green';
      let stockText = `${stock} in stock`;
      if (stock === 0) {
        stockBadgeClass = 'red';
        stockText = 'Out of Stock';
      } else if (stock <= 5) {
        stockBadgeClass = 'orange';
        stockText = `${stock} left (Low)`;
      }

      const discount = p.originalPrice && p.originalPrice > p.price
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 0;

      return `
        <tr data-id="${p.id}">
          <td style="color: #888; font-weight: 600;">${index + 1}</td>
          <td>
            <div class="product-row-info">
              <img src="${p.image}" alt="${p.title}" class="table-product-thumb">
              <div>
                <span class="table-product-brand">${p.brand || 'Brand'}</span>
                <div class="table-product-title" title="${p.title}">${p.title}</div>
                <div style="font-size: 11px; color: #888;">ID: ${p.id}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge-pill blue">${p.category}</span>
          </td>
          <td>
            <strong style="font-size: 14px; color: #212121;">₹${p.price.toLocaleString('en-IN')}</strong>
          </td>
          <td>
            ${p.originalPrice ? `
              <span style="color: #888; text-decoration: line-through;">₹${p.originalPrice.toLocaleString('en-IN')}</span>
              <span style="color: #388e3c; font-size: 11px; font-weight: 700; margin-left: 4px;">(${discount}% off)</span>
            ` : '—'}
          </td>
          <td>
            <span class="badge-pill ${stockBadgeClass}">${stockText}</span>
          </td>
          <td>
            ${p.isSellerProduct ? `
              <span class="badge-pill purple">Seller: You</span>
            ` : `
              <span class="badge-pill" style="background:#e0e0e0; color:#555;">Default</span>
            `}
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn-action-edit" data-edit-id="${p.id}">
                ✏️ Edit
              </button>
              <button class="btn-action-delete" data-delete-id="${p.id}">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row action listeners
    productsTableBody.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.editId;
        openEditProductModal(id);
      });
    });

    productsTableBody.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.deleteId;
        const p = storage.getProductById(id);
        if (confirm(`Are you sure you want to delete "${p ? p.title : 'this item'}" from the store catalog?`)) {
          storage.deleteProduct(id);
          renderKPIs();
          renderProductsTable();
          showAdminToast('Product deleted successfully.');
        }
      });
    });
  }

  // ==========================================
  // ORDERS TABLE RENDERING
  // ==========================================
  function renderOrdersTable() {
    if (!ordersTableBody) return;
    const orders = storage.getOrders();

    if (orders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: #888;">
            No customer orders placed yet. Place an order in the live store to view tracking here!
          </td>
        </tr>
      `;
      return;
    }

    ordersTableBody.innerHTML = orders.map(order => {
      const cust = order.customer || {};
      const itemsCount = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);

      return `
        <tr>
          <td><strong style="color: #2874f0;">${order.orderId}</strong></td>
          <td style="color: #666; font-size: 12px;">${order.date}</td>
          <td>
            <strong>${cust.name || 'Customer'}</strong>
            <div style="font-size: 11px; color: #777;">📱 ${cust.phone || '—'}</div>
          </td>
          <td style="font-size: 12px; color: #555;">
            ${cust.address || ''}, ${cust.city || ''} (${cust.pincode || ''})
          </td>
          <td>
            <span class="badge-pill blue">${itemsCount} items</span>
          </td>
          <td>
            <strong style="color: #212121; font-size: 14px;">₹${(order.totals ? order.totals.finalAmount : 0).toLocaleString('en-IN')}</strong>
          </td>
          <td style="font-size: 12px;">${order.paymentMethod || 'UPI'}</td>
          <td>
            <select class="filter-select" data-order-status-id="${order.orderId}" style="padding: 4px 8px; font-size: 12px;">
              <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Packed" ${order.status === 'Packed' ? 'selected' : ''}>Packed</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    ordersTableBody.querySelectorAll('[data-order-status-id]').forEach(select => {
      select.addEventListener('change', (e) => {
        const orderId = select.dataset.orderStatusId;
        const newStatus = e.target.value;
        storage.updateOrderStatus(orderId, newStatus);
        showAdminToast(`Order #${orderId} marked as "${newStatus}"!`);
      });
    });
  }

  // ==========================================
  // EDIT & ADD PRODUCT MODAL
  // ==========================================
  function openEditProductModal(productId = null) {
    activeImageDataUrl = null;
    adminFileInput.value = '';

    if (productId) {
      // EDIT MODE
      const product = storage.getProductById(productId);
      if (!product) return;

      modalTitle.textContent = `✏️ Edit Product Details`;
      btnSubmitProduct.textContent = `💾 Save Changes`;
      editProductId.value = product.id;
      editTitle.value = product.title || '';
      editCategory.value = product.category || 'electronics';
      editBrand.value = product.brand || '';
      editPrice.value = product.price || '';
      editOriginalPrice.value = product.originalPrice || '';
      editStock.value = typeof product.stock === 'number' ? product.stock : 10;
      editImageUrl.value = product.image || '';
      editHighlights.value = (product.highlights || []).join('\n');
      editDescription.value = product.description || '';
      editIsAssured.checked = product.isAssured !== false;
      editDealOfDay.checked = !!product.dealOfDay;

      adminPreviewImg.src = product.image;
      adminPreviewFilename.textContent = product.title;
    } else {
      // ADD NEW MODE
      modalTitle.textContent = `➕ Add New Product`;
      btnSubmitProduct.textContent = `🚀 Publish Product`;
      adminProductForm.reset();
      editProductId.value = '';
      editStock.value = '15';
      editIsAssured.checked = true;
      adminPreviewImg.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
      editImageUrl.value = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
      adminPreviewFilename.textContent = 'Default Demo Photo';
    }

    productEditModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeEditModal() {
    productEditModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const id = editProductId.value;
    const title = editTitle.value.trim();
    const category = editCategory.value;
    const brand = editBrand.value.trim() || 'Brand';
    const price = parseFloat(editPrice.value);
    const originalPrice = parseFloat(editOriginalPrice.value) || Math.round(price * 1.25);
    const stock = parseInt(editStock.value, 10) || 0;
    const image = activeImageDataUrl || editImageUrl.value.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    const highlights = editHighlights.value.split('\n').map(h => h.trim()).filter(Boolean);
    const description = editDescription.value.trim();
    const isAssured = editIsAssured.checked;
    const dealOfDay = editDealOfDay.checked;

    if (!title || isNaN(price) || price <= 0) {
      alert('Please provide a valid product title and price!');
      return;
    }

    if (id) {
      // UPDATE EXISTING
      storage.updateProduct(id, {
        title,
        category,
        brand,
        price,
        originalPrice,
        stock,
        image,
        images: [image],
        highlights,
        description,
        isAssured,
        dealOfDay
      });
      showAdminToast(`Updated "${title.substring(0, 25)}..."!`);
    } else {
      // ADD NEW
      storage.addProduct({
        title,
        category,
        brand,
        price,
        originalPrice,
        stock,
        image,
        images: [image],
        highlights,
        description,
        isAssured,
        dealOfDay
      });
      showAdminToast(`New product "${title.substring(0, 25)}..." published!`);
    }

    closeEditModal();
    renderKPIs();
    renderProductsTable();
  }

  // ==========================================
  // PHOTO FILE UPLOAD
  // ==========================================
  adminFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file too large! Maximum allowed is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      activeImageDataUrl = event.target.result;
      editImageUrl.value = activeImageDataUrl;
      adminPreviewImg.src = activeImageDataUrl;
      adminPreviewFilename.textContent = `${file.name} (Uploaded from PC)`;
      showAdminToast('Photo ready to save!');
    };
    reader.readAsDataURL(file);
  });

  adminQrFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('QR image too large! Maximum allowed is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      activeQrDataUrl = event.target.result;
      adminQrCodeUrl.value = activeQrDataUrl;
      adminQrPreview.src = activeQrDataUrl;
      showAdminToast('QR code ready to save!');
    };
    reader.readAsDataURL(file);
  });

  adminQrCodeUrl.addEventListener('input', () => {
    activeQrDataUrl = null;
    adminQrPreview.src = adminQrCodeUrl.value.trim();
  });

  editImageUrl.addEventListener('input', () => {
    const val = editImageUrl.value.trim();
    if (val && !val.startsWith('data:')) {
      activeImageDataUrl = null;
      adminPreviewImg.src = val;
      adminPreviewFilename.textContent = val;
    }
  });

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    // Search & Filters
    searchInput.addEventListener('input', renderProductsTable);
    categoryFilter.addEventListener('change', renderProductsTable);
    stockFilter.addEventListener('change', renderProductsTable);
    sourceFilter.addEventListener('change', renderProductsTable);

    // Add New Product buttons
    document.getElementById('btnAdminAddNewProduct').addEventListener('click', () => openEditProductModal(null));

    // Modal Close
    btnEditModalClose.addEventListener('click', closeEditModal);
    productEditModal.addEventListener('click', (e) => {
      if (e.target === productEditModal) closeEditModal();
    });

    // Form Submit
    adminProductForm.addEventListener('submit', handleFormSubmit);
    adminPaymentSettingsForm.addEventListener('submit', handlePaymentSettingsSubmit);

    // Tab Switching
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById('tabProducts').style.display = tabId === 'tabProducts' ? 'block' : 'none';
        document.getElementById('tabOrders').style.display = tabId === 'tabOrders' ? 'block' : 'none';
      });
    });

    // Reset Catalog
    document.getElementById('btnAdminResetCatalog').addEventListener('click', () => {
      if (confirm('Warning: This will reset all products back to the original default catalog. Proceed?')) {
        storage.resetToDefaultCatalog();
        renderKPIs();
        renderProductsTable();
        showAdminToast('Catalog reset to default sample products.');
      }
    });
  }

  // Toast Helper
  function showAdminToast(msg) {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  init();
});
