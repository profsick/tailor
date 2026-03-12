// =====================================================
// API CONFIGURATION - How we connect to the backend
// =====================================================

// Set the base URL for all API requests
// If window.TAILOR_API_BASE exists, use it, otherwise use current domain + "/api"
// Example: http://localhost:3000/api
const API_BASE = window.TAILOR_API_BASE || `${window.location.origin}/api`;

/**
 * apiRequest - Helper function to make HTTP requests to our backend
 * @param {string} path - The API endpoint (e.g., "/orders", "/orders/123")
 * @param {object} options - Additional fetch options (method, body, headers, etc.)
 * @returns {Promise} - The parsed JSON response from the server
 */
async function apiRequest(path, options = {}) {
  // Construct the full URL by combining API_BASE with the endpoint path
  const response = await fetch(`${API_BASE}${path}`, {
    // Set default headers for our request
    headers: {
      // Tell the server we're sending JSON data
      "Content-Type": "application/json",
      // Spread any additional headers from the options object
      ...(options.headers || {}),
    },
    // Spread all other options like method: "POST", body: data, etc.
    ...options,
  });

  // Initialize payload as null to handle non-JSON responses
  let payload = null;
  try {
    // Try to parse the response as JSON
    payload = await response.json();
  } catch (error) {
    // If the response isn't valid JSON, leave payload as null
    payload = null;
  }

  // Check if the HTTP request was successful (status 200-299)
  if (!response.ok) {
    // Create an error message - use the server's message if available, otherwise use status code
    const message =
      payload?.message || `Request failed with status ${response.status}`;
    // Throw an error so the caller can catch it
    throw new Error(message);
  }

  // Return the successfully parsed JSON data
  return payload;
}

// =====================================================
// PRICING CONFIGURATION - Cost of each clothing item
// =====================================================

// This object stores the price for each piece of clothing (in rupees, likely)
const PRICING = {
  shirt: 1000,      // A shirt costs ₹1000
  trousers: 800,    // Trousers cost ₹800
  pant: 800,        // Pant is another word for trousers, also ₹800
  suit: 6000,       // A full suit costs ₹6000
  tuxedo: 8000,     // A tuxedo costs ₹8000 (fancier)
  sherwani: 10000,  // Traditional sherwani costs ₹10000
  thobe: 5000,      // A thobe costs ₹5000
};

  // =====================================================
  // LOAD ITEMS FROM STORAGE - Clothing and Fabric items
  // =====================================================

  /**
   * getClothingItems - Retrieve clothing items from localStorage
   * @returns {Array} - Array of clothing items with name and image
   */
  function getClothingItems() {
    const defaultClothing = [
      { name: 'Tuxedo', image: 'assets/tuxedo2.jpg' },
      { name: 'Trousers', image: 'assets/trousers.jpg' },
      { name: 'Suit', image: 'assets/suit.jpg' },
      { name: 'Shirt', image: 'assets/shirt.jpg' },
      { name: 'Sherwani', image: 'assets/sherwani.jpg' },
      { name: 'Thobe', image: 'assets/thobe.jpg' }
    ];
  
    try {
      const stored = localStorage.getItem('tailorClothing');
      return stored ? JSON.parse(stored) : defaultClothing;
    } catch (error) {
      console.error('Error loading clothing items:', error);
      return defaultClothing;
    }
  }

  /**
   * getFabricItems - Retrieve fabric items from localStorage
   * @returns {Array} - Array of fabric items with name and image
   */
  function getFabricItems() {
    const defaultFabrics = [
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' }
    ];
  
    try {
      const stored = localStorage.getItem('tailorFabrics');
      return stored ? JSON.parse(stored) : defaultFabrics;
    } catch (error) {
      console.error('Error loading fabric items:', error);
      return defaultFabrics;
    }
  }

// =====================================================
// CART MANAGEMENT - Stores items customer wants to buy
// =====================================================

/**
 * Cart Class - Manages all shopping cart operations
 * Stores items in browser's localStorage so they persist even after page refresh
 */
class Cart {
  /**
   * constructor - Initialize cart when the page loads
   */
  constructor() {
    // Load previously saved items from browser storage
    this.items = this.loadFromLocalStorage();
    // Load previously saved measurements from browser storage
    this.measurements = this.loadMeasurementsFromLocalStorage();
  }

  /**
   * loadFromLocalStorage - Retrieve cart items from browser's localStorage
   * @returns {Array} - Array of items in cart, or empty array if none exist
   */
  loadFromLocalStorage() {
    // Get the saved cart data from localStorage
    const saved = localStorage.getItem("tailorCart");
    // If data exists, parse it from JSON string to object; otherwise return empty array
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * loadMeasurementsFromLocalStorage - Retrieve saved measurements from storage
   * @returns {Object} - The measurements object, or null if none saved
   */
  loadMeasurementsFromLocalStorage() {
    // Get the saved measurements data
    const saved = localStorage.getItem("tailorMeasurements");
    // If data exists, parse it; otherwise return null
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * saveMeasurements - Save customer's body measurements
   * @param {Object} measurementData - Object containing all measurement values
   */
  saveMeasurements(measurementData) {
    // Store measurements in memory
    this.measurements = measurementData;
    // Save measurements to localStorage so they persist
    localStorage.setItem("tailorMeasurements", JSON.stringify(measurementData));
    // Update the cart display to reflect changes
    this.saveToLocalStorage();
  }

  /**
   * saveToLocalStorage - Save current cart items to localStorage
   */
  saveToLocalStorage() {
    // Convert cart items array to JSON string and save it
    localStorage.setItem("tailorCart", JSON.stringify(this.items));
  }

  /**
   * notifyCartChanged - Broadcast cart changes so all cart views can sync
   */
  notifyCartChanged() {
    window.dispatchEvent(new CustomEvent("tailor:cart-updated"));
  }

  /**
   * addItem - Add a new clothing item to the cart
   * @param {Object} clothing - The clothing object with name and other info
   * @param {Object} fabric - The fabric object with name and other info
   * @returns {Object} - The newly created item object
   */
  addItem(clothing, fabric) {
    // Get the clothing type name and convert to lowercase for PRICING lookup
    const clothingKey = clothing.name.toLowerCase();
    // Look up the price for this clothing type, default to 0 if not found
    const price = PRICING[clothingKey] || 0;

    // Create a new item object with all details
    const item = {
      id: Date.now(),           // Use current timestamp as unique ID
      clothing: clothing,       // Store the full clothing object
      fabric: fabric,           // Store the full fabric object
      quantity: 1,              // Start with quantity of 1
      price: price,             // Store the price
    };
    // Add this item to the cart's items array
    this.items.push(item);
    // Save the updated cart to localStorage
    this.saveToLocalStorage();
    // Update the cart icon and display
    this.updateCartUI();
    this.notifyCartChanged();
    // Open cart panel and scroll to clothing section on every add
    const openPanel = window.__openCartPanel;
    if (typeof openPanel === "function") openPanel();
    const clothingSection = document.getElementById("clothing-section");
    if (clothingSection) {
      clothingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Return the new item so caller can use it
    return item;
  }

  /**
   * removeItem - Delete an item from the cart
   * @param {number} itemId - The ID of the item to remove
   */
  removeItem(itemId) {
    // Filter items array to remove the item with matching ID
    this.items = this.items.filter((item) => item.id !== itemId);
    // Save the updated cart
    this.saveToLocalStorage();
    // Update the display
    this.updateCartUI();
    this.notifyCartChanged();
  }

  /**
   * updateQuantity - Change how many of an item the customer wants
   * @param {number} itemId - The ID of the item to update
   * @param {number} quantity - The new quantity
   */
  updateQuantity(itemId, quantity) {
    // Find the item in the cart by ID
    const item = this.items.find((i) => i.id === itemId);
    // If item found
    if (item) {
      // Update quantity to the new value, but make sure it's at least 1
      item.quantity = Math.max(1, quantity);
      // Save the change
      this.saveToLocalStorage();
      // Update the display
      this.updateCartUI();
      this.notifyCartChanged();
    }
  }

  /**
   * getItemCount - Calculate total number of items in cart
   * @returns {number} - Total quantity of all items (sum of all quantities)
   */
  getItemCount() {
    // Loop through all items and add up their quantities
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * updateCartUI - Update the cart icon and badge on the page
   */
  updateCartUI() {
    // Get the cart count badge element (the number shown on the cart icon)
    const cartCount = document.getElementById("cartCount");
    // Get the cart icon element
    const cartIcon = document.getElementById("cartIcon");
    // Calculate how many items are in the cart
    const itemCount = this.getItemCount();

    // Update the badge number
    if (cartCount) {
      cartCount.textContent = itemCount;
    }

    // Show or hide the cart icon based on whether there are items
    if (cartIcon) {
      if (itemCount > 0) {
        // Items in cart - show the icon
        cartIcon.classList.add("show");
        // Determine if cart is "floating" (follows scrolling) or "docked"
        const scrollY = window.scrollY;  // How far down the page user has scrolled
        const nav = document.querySelector("nav");
        const navHeight = nav ? nav.offsetHeight : 100;

        // If user has scrolled past the nav, make icon float with them
        if (scrollY > navHeight) {
          cartIcon.classList.add("floating");
          cartIcon.classList.remove("docked");
        } else {
          // Otherwise keep it docked at the top
          cartIcon.classList.add("docked");
          cartIcon.classList.remove("floating");
        }
      } else {
        // No items in cart - hide the icon completely
        cartIcon.classList.remove("show", "floating", "docked");
      }
    }
  }

  /**
   * getItems - Get all items currently in the cart
   * @returns {Array} - Array of cart items
   */
  getItems() {
    return this.items;
  }

  /**
   * clearCart - Remove all items from the cart
   */
  clearCart() {
    // Empty the items array
    this.items = [];
    // Save the empty state
    this.saveToLocalStorage();
    // Update the display
    this.updateCartUI();
    this.notifyCartChanged();
  }
}

// Initialize cart
const cart = new Cart();

// =====================================================
// ORDER SUBMISSION
// =====================================================

// Safely reads cart items from storage, with fallback to the in-memory cart object.
function getCartItems() {
  try {
    const raw = localStorage.getItem("tailorCart");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore parse errors */
  }
  if (window.cart && typeof window.cart.getItems === "function") {
    try {
      return window.cart.getItems() || [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

// Builds a normalized order object from form values and current cart state.
function gatherOrderData(formValues) {
  const items = getCartItems();
  const total = items.reduce(
    (s, it) => s + (it.price || 0) * (it.quantity || 1),
    0,
  );
  return {
    orderId: "local_" + Date.now(),
    name: formValues.name,
    phone: formValues.phone,
    email: formValues.email || "",
    specialRequest: formValues.specialRequest || "",
    items,
    measurements: cart.measurements || {},
    total,
  };
}

// Sends the finalized order to the backend API and updates local order history on success.
async function submitOrderToSheet(orderData) {
  const submitBtn = document.querySelector(".submit-btn");

  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitBtn.textContent = "Processing order...";
  }

  try {
    console.log("📤 Submitting order to API:", orderData);

    // Get items for proper data structure
    const items = getCartItems();

    const data = await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        items: items,
        measurements: orderData.measurements || {},
        instructions: orderData.instructions || "",
        total: orderData.total || 0,
      }),
    });

    const persistedOrder = {
      ...orderData,
      remoteOrderId: data?.id || null,
      status: data?.status || orderData.status || "Pending",
      timestamp: orderData.timestamp || Date.now(),
    };

    console.log("✅ Order saved to API:", data);
    localStorage.setItem("lastOrder", JSON.stringify(persistedOrder));
    saveOrderToHistory(persistedOrder);
    updateOrdersNavLinks();
    showNotification("✅ Order submitted successfully!");

    // Reset form
    setTimeout(() => {
      const orderForm = document.getElementById("orderForm");
      if (orderForm) {
        orderForm.reset();
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        submitBtn.textContent = "Place Order";
      }

      const confirmation = document.getElementById("orderConfirmation");
      if (confirmation) {
        confirmation.classList.remove("is-hidden");
      }

      const summaryDiv = document.getElementById("summaryItems");
      if (summaryDiv) {
        summaryDiv.innerHTML = "";
      }

      // Clear the cart after successful order
      cart.clearCart();
    }, 1500);

    return { success: true, order: persistedOrder };
  } catch (error) {
    console.error("❌ Order submission error:", error);
    showNotification("❌ Failed to submit order: " + error.message);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
      submitBtn.textContent = "Place Order";
    }

    return { success: false, error: error.message };
  }
}

// Small DOM helper for toggling the shared `is-hidden` utility class.
function setHidden(element, hidden) {
  if (!element) return;
  element.classList.toggle("is-hidden", hidden);
}

// Loads the customer's locally saved order history array.
function loadOrderHistory() {
  try {
    const stored = localStorage.getItem("orders");
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// Cleans older/local order records into a consistent shape before rendering.
function getValidOrderHistory() {
  const orders = loadOrderHistory();
  const normalized = orders
    .map((order) => {
      const rawItems = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.cartItems)
          ? order.cartItems
          : [];

      const items = rawItems
        .map((item) => ({
          clothing: item.clothing?.name || item.clothing || "Item",
          fabric: item.fabric?.name || item.fabric || "Fabric",
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
        }))
        .filter((item) => item.quantity > 0 && item.price > 0);

      const computedTotal = items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0,
      );
      const total = Number(order.total || 0) || computedTotal;

      if (items.length === 0 && total <= 0) {
        return null;
      }

      return {
        ...order,
        items,
        total,
      };
    })
    .filter(Boolean);

  localStorage.setItem("orders", JSON.stringify(normalized));
  return normalized;
}

// Stores one successful order in local history so the customer can revisit it later.
function saveOrderToHistory(orderData) {
  const items = orderData.cartItems || orderData.items || [];
  const total = Number(orderData.total || 0);
  if (!items || items.length === 0 || total <= 0) {
    return null;
  }

  const orders = loadOrderHistory();
  const record = {
    id: "local_" + Date.now(),
    timestamp: Date.now(),
    name: orderData.name || orderData.fullName || "",
    phone: orderData.phone || "",
    email: orderData.email || "",
    instructions: orderData.instructions || orderData.specialRequest || "",
    total: total,
    status: orderData.status || "Pending",
    remoteOrderId: orderData.remoteOrderId || null,
    items: items.map((item) => ({
      clothing: item.clothing?.name || "Item",
      fabric: item.fabric?.name || "Fabric",
      quantity: item.quantity || 1,
      price: item.price || 0,
    })),
  };

  orders.unshift(record);
  localStorage.setItem("orders", JSON.stringify(orders));
  return record;
}

// Shows or hides the "Your Orders" nav link based on whether local history exists.
function updateOrdersNavLinks() {
  const links = document.querySelectorAll(".orders-link");
  if (!links || links.length === 0) return;
  const hasOrders = getValidOrderHistory().length > 0;
  links.forEach((link) => {
    link.classList.toggle("is-hidden", !hasOrders);
  });
}

// Clears the customer's locally stored order history after confirmation.
function clearOrderHistory() {
  if (
    !confirm(
      "⚠️ Are you sure you want to clear all order history? This cannot be undone.",
    )
  ) {
    return;
  }

  localStorage.removeItem("orders");
  updateOrdersNavLinks();
  initOrdersPage();
  showNotification("✅ Order history cleared!");
}

// Refreshes statuses for known backend orders without re-fetching full order details.
async function syncOrderStatusesFromApi(orders) {
  const remoteOrderIds = orders
    .map((order) => order.remoteOrderId)
    .filter((id) => typeof id === "string" && id.length > 0);

  if (remoteOrderIds.length === 0) return orders;

  try {
    const data = await apiRequest(
      `/orders/statuses?ids=${encodeURIComponent(remoteOrderIds.join(","))}`,
    );

    if (!Array.isArray(data)) return orders;

    const statusMap = new Map(
      data.map((row) => [row.id, row.status || "Pending"]),
    );

    const updated = orders.map((order) => {
      const remoteOrderId = order.remoteOrderId;
      if (!remoteOrderId) return order;
      const status = statusMap.get(remoteOrderId);
      if (!status) return order;
      return { ...order, status };
    });

    localStorage.setItem("orders", JSON.stringify(updated));
    return updated;
  } catch (error) {
    return orders;
  }
}

// Initializes the customer orders page and renders the current local/remote order state.
async function initOrdersPage() {
  const ordersList = document.getElementById("ordersList");
  const emptyMessage = document.getElementById("ordersEmpty");
  const clearBtn = document.getElementById("clearOrderHistoryBtn");
  if (!ordersList) return;

  let orders = getValidOrderHistory();
  orders = await syncOrderStatusesFromApi(orders);
  if (!orders || orders.length === 0) {
    setHidden(ordersList, true);
    setHidden(emptyMessage, false);
    if (clearBtn) setHidden(clearBtn, true);
    return;
  }

  setHidden(emptyMessage, true);
  setHidden(ordersList, false);
  if (clearBtn) {
    setHidden(clearBtn, false);
    clearBtn.removeEventListener("click", clearOrderHistory);
    clearBtn.addEventListener("click", clearOrderHistory);
  }
  ordersList.innerHTML = "";

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";

    const dateLabel = order.timestamp
      ? new Date(order.timestamp).toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    const itemsHtml = (order.items || [])
      .map((item) => {
        const lineTotal = (item.price || 0) * (item.quantity || 1);
        return `
          <li>
            <span>${item.clothing} - ${item.fabric}</span>
            <span>Rs. ${item.price} × ${item.quantity} = Rs. ${lineTotal}</span>
          </li>
        `;
      })
      .join("");

    const statusLabel = order.status || "Pending";
    const isCompleted = statusLabel.toLowerCase() === "completed";
    const completionNote = isCompleted
      ? '<p class="order-complete-note">Your order is completed. Please pick it up at our store.</p>'
      : "";

    orderCard.innerHTML = `
      <div class="order-card-header">
        <div>
          <h3>Order</h3>
          <p class="order-meta">${dateLabel}</p>
        </div>
        <span class="order-status ${isCompleted ? "completed" : "pending"}">${statusLabel}</span>
      </div>
      <div class="order-card-body">
        <ul class="order-items">
          ${itemsHtml || "<li>No items recorded</li>"}
        </ul>
        ${completionNote}
        <div class="order-total">Total: Rs. ${order.total || 0}</div>
      </div>
    `;

    ordersList.appendChild(orderCard);
  });
}

// Initializes the checkout page with customer details, cart summary, and measurements.
function initOrderPage() {
  const orderForm = document.getElementById("orderForm");
  const summaryDiv = document.getElementById("summaryItems");
  if (!orderForm || !summaryDiv) return;

  const customerDetails = loadCustomerDetails();
  if (customerDetails) {
    if (orderForm.fullName) orderForm.fullName.value = customerDetails.name;
    if (orderForm.email) orderForm.email.value = customerDetails.email;
    if (orderForm.phone) orderForm.phone.value = customerDetails.phone;
  }

  const cartItems = cart.getItems();
  summaryDiv.innerHTML = "";

  if (!cartItems || cartItems.length === 0) {
    summaryDiv.innerHTML = '<p class="empty-cart-text">No items in cart</p>';
  } else {
    let total = 0;
    cartItems.forEach((item) => {
      const itemSubtotal = (item.price || 0) * item.quantity;
      total += itemSubtotal;
      const summaryItem = document.createElement("div");
      summaryItem.className = "summary-item";
      summaryItem.innerHTML = `
        <span><strong>${item.clothing.name}</strong> - ${item.fabric.name}</span>
        <span>Rs. ${item.price} × ${item.quantity} = Rs. ${itemSubtotal}</span>
      `;
      summaryDiv.appendChild(summaryItem);
    });

    // Add total row
    const totalItem = document.createElement("div");
    totalItem.className = "summary-total";
    totalItem.innerHTML = `<strong>Total:</strong> <strong>Rs. ${total}</strong>`;
    summaryDiv.appendChild(totalItem);
  }

  // Display measurements for review
  const measurementsReview = document.getElementById("measurementsReview");
  const reviewMeasurements = document.getElementById("reviewMeasurements");
  if (
    measurementsReview &&
    reviewMeasurements &&
    cart.measurements &&
    Object.keys(cart.measurements).length > 0
  ) {
    measurementsReview.style.display = "block";
    reviewMeasurements.innerHTML = "";

    const measurementLabels = {
      fullShoulder: "Full Shoulder",
      fullSleeve: "Full Sleeve",
      fullChest: "Full Chest",
      waist: "Waist",
      hips: "Hips",
      frontChest: "Front Chest",
      backChest: "Back Chest",
      jacket: "Jacket Length",
      pantsWaist: "Pants Waist",
      lowHip: "Low Hip",
      thigh: "Thigh",
      crotch: "Crotch",
      pantLength: "Pants Length",
      bicep: "Bicep",
      neck: "Neck",
      cuffs: "Cuffs",
    };

    Object.keys(cart.measurements).forEach((key) => {
      if (cart.measurements[key]) {
        const div = document.createElement("div");
        div.className = "measurement-item";
        div.innerHTML = `
          <span class="measurement-label">${measurementLabels[key] || key}</span>
          <span class="measurement-value">${cart.measurements[key]} inches</span>
        `;
        reviewMeasurements.appendChild(div);
      }
    });
  }

  orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate measurements exist
    if (!cart.measurements || Object.keys(cart.measurements).length === 0) {
      showNotification(
        "⚠️ Please fill in your measurements before placing the order!",
      );
      return;
    }

    const submitBtn = this.querySelector(".submit-btn");

    // Calculate total
    const cartItems = cart.getItems();
    let total = 0;
    cartItems.forEach((item) => {
      total += (item.price || 0) * (item.quantity || 1);
    });

    const orderData = {
      fullName: this.fullName.value,
      name: this.fullName.value,
      email: this.email.value,
      phone: this.phone.value,
      instructions: this.instructions.value,
      cartItems: cart.getItems(),
      measurements: cart.measurements || {},
      total: total,
      orderDate: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      status: "Pending",
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending Order...";

    saveCustomerDetails({
      name: this.fullName.value,
      email: this.email.value,
      phone: this.phone.value,
    });
    const result = await submitOrderToSheet(orderData);

    if (!result?.success) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
      return;
    }

    if (window.cart && typeof cart.clearCart === "function") {
      cart.clearCart();
    }
    localStorage.removeItem("tailorCart");
    if (window.cart && typeof cart.updateCartUI === "function") {
      cart.updateCartUI();
    }
    if (summaryDiv) {
      summaryDiv.innerHTML = '<p class="empty-cart-text">No items in cart</p>';
    }
    const confirmation = document.getElementById("orderConfirmation");
    if (confirmation) {
      setHidden(confirmation, false);
    }
    setHidden(orderForm, true);
    submitBtn.disabled = false;
    submitBtn.textContent = "Place Order";
  });
}

// Reads previously saved customer contact details for autofill on checkout.
function loadCustomerDetails() {
  try {
    const stored = localStorage.getItem("customerDetails");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

// Saves customer contact details so repeat visits can prefill the form.
function saveCustomerDetails(details) {
  if (!details) return;
  const payload = {
    name: details.name || "",
    email: details.email || "",
    phone: details.phone || "",
  };
  localStorage.setItem("customerDetails", JSON.stringify(payload));
}

// Initializes the cart page, including quantity controls and measurement editing.
function initCartPage() {
  const cartItemsContainer = document.getElementById("cartItems");
  if (!cartItemsContainer) return;

  const emptyMessage = document.getElementById("emptyCartMessage");
  const cartSummary = document.getElementById("cartSummary");
  const totalItemsSpan = document.getElementById("totalItems");
  const totalPriceSpan = document.getElementById("totalPrice");
  const measurementSection = document.getElementById("measurementSection");
  const measurementsDisplay = document.getElementById("measurementsDisplay");
  const editBtn = document.getElementById("editMeasurementsBtn");

  function displayCart() {
    const items = cart.getItems();
    if (items.length === 0) {
      setHidden(cartItemsContainer, true);
      setHidden(emptyMessage, false);
      setHidden(cartSummary, true);
      return;
    }

    setHidden(cartItemsContainer, false);
    setHidden(emptyMessage, true);
    setHidden(cartSummary, false);

    let totalPrice = 0;
    const cartItemsHTML = items
      .map((item) => {
        const itemTotal = (item.price || 0) * item.quantity;
        totalPrice += itemTotal;
        return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-content">
          <div class="item-details">
            <h3 class="item-title">${item.clothing.name}</h3>
            <p class="item-fabric">Fabric: ${item.fabric.name}</p>
            <p class="item-price">Rs. ${item.price} × ${item.quantity} = <strong>Rs. ${itemTotal}</strong></p>
            ${
              item.fabric.image
                ? `<img src="${item.fabric.image}" alt="Fabric preview" class="fabric-preview">`
                : ""
            }
          </div>

          <div class="item-quantity-control">
            <button class="qty-btn minus" data-id="${item.id}">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" data-id="${item.id}" min="1">
            <button class="qty-btn plus" data-id="${item.id}">+</button>
          </div>

          <button class="remove-item-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
      })
      .join("");

    cartItemsContainer.innerHTML = cartItemsHTML;

    // Add total price row
    const totalRow = document.createElement("div");
    totalRow.className = "cart-total-row";
    totalRow.innerHTML = `<h3>Total: <span class="total-amount">Rs. ${totalPrice}</span></h3>`;
    cartItemsContainer.appendChild(totalRow);

    totalItemsSpan.textContent = cart.getItemCount();
    if (totalPriceSpan) {
      totalPriceSpan.textContent = `Rs. ${totalPrice}`;
    }
    attachEventListeners();
  }

  function attachEventListeners() {
    // Use event delegation for better reliability with dynamic elements
    cartItemsContainer.removeEventListener("click", handleCartClick);
    cartItemsContainer.addEventListener("click", handleCartClick);
    cartItemsContainer.removeEventListener("change", handleCartChange);
    cartItemsContainer.addEventListener("change", handleCartChange);

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
      clearBtn.removeEventListener("click", handleClearCart);
      clearBtn.addEventListener("click", handleClearCart);
    }
  }

  function handleCartChange(e) {
    if (e.target.classList.contains("qty-input")) {
      const input = e.target;
      const itemId = parseInt(input.dataset.id, 10);
      const newQuantity = parseInt(input.value, 10) || 1;
      cart.updateQuantity(itemId, newQuantity);
      displayCart();
    }
  }

  function handleCartClick(e) {
    if (e.target.classList.contains("qty-btn")) {
      const btn = e.target;
      const itemId = parseInt(btn.dataset.id, 10);
      const items = cart.getItems();
      const item = items.find((i) => i.id === itemId);

      if (!item) return;

      if (btn.classList.contains("plus")) {
        cart.updateQuantity(itemId, item.quantity + 1);
        displayCart();
      } else if (btn.classList.contains("minus") && item.quantity > 1) {
        cart.updateQuantity(itemId, item.quantity - 1);
        displayCart();
      }
    } else if (e.target.classList.contains("remove-item-btn")) {
      const btn = e.target;
      const itemId = parseInt(btn.dataset.id, 10);
      cart.removeItem(itemId);
      displayCart();
    }
  }

  function handleClearCart(e) {
    if (confirm("Are you sure you want to clear your cart?")) {
      cart.clearCart();
      displayCart();
      displayMeasurements();
    }
  }

  function displayMeasurements() {
    const measurements = cart.measurements;
    if (!measurements || Object.keys(measurements).length === 0) {
      setHidden(measurementSection, true);
      return;
    }

    setHidden(measurementSection, false);
    measurementsDisplay.innerHTML = "";
    const measurementLabels = {
      fullShoulder: "Full Shoulder",
      fullSleeve: "Full Sleeve",
      fullChest: "Full Chest",
      waist: "Waist",
      hips: "Hips",
      frontChest: "Front Chest",
      backChest: "Back Chest",
      jacket: "Jacket Length",
      pantsWaist: "Pants Waist",
      lowHip: "Low Hip",
      thigh: "Thigh",
      crotch: "Crotch",
      pantLength: "Pants Length",
      bicep: "Bicep",
      neck: "Neck",
      cuffs: "Cuffs",
    };

    Object.keys(measurements).forEach((key) => {
      if (measurements[key]) {
        const div = document.createElement("div");
        div.className = "measurement-item";
        div.innerHTML = `
          <span class="measurement-label">${measurementLabels[key] || key}</span>
          <span class="measurement-value">${measurements[key]} inches</span>
        `;
        measurementsDisplay.appendChild(div);
      }
    });

    if (editBtn) {
      editBtn.onclick = function (e) {
        e.preventDefault();
        showMeasurementEditForm(measurements);
      };
    }
  }

  function showMeasurementEditForm(measurements) {
    setHidden(measurementsDisplay, true);
    if (editBtn) setHidden(editBtn, true);

    const form = document.createElement("form");
    form.className = "measurement-edit-form";
    form.id = "measurementEditForm";

    const measurementLabels = {
      fullShoulder: "Full Shoulder",
      fullSleeve: "Full Sleeve",
      fullChest: "Full Chest",
      waist: "Waist",
      hips: "Hips",
      frontChest: "Front Chest",
      backChest: "Back Chest",
      jacket: "Jacket Length",
      pantsWaist: "Pants Waist",
      lowHip: "Low Hip",
      thigh: "Thigh",
      crotch: "Crotch",
      pantLength: "Pants Length",
      bicep: "Bicep",
      neck: "Neck",
      cuffs: "Cuffs",
    };

    Object.keys(measurements).forEach((key) => {
      const div = document.createElement("div");
      div.className = "form-group";
      div.innerHTML = `
        <label for="${key}">${measurementLabels[key] || key}</label>
        <input type="number" step="0.1" id="${key}" name="${key}" value="${measurements[key] || ""}" required>
      `;
      form.appendChild(div);
    });

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "measurement-form-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "save-edit-btn";
    saveBtn.textContent = "Save Changes";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "cancel-edit-btn";
    cancelBtn.textContent = "Cancel";

    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(cancelBtn);
    form.appendChild(actionsDiv);

    measurementsDisplay.parentNode.insertBefore(
      form,
      measurementsDisplay.nextSibling,
    );

    cancelBtn.onclick = function (e) {
      e.preventDefault();
      form.remove();
      setHidden(measurementsDisplay, false);
      if (editBtn) setHidden(editBtn, false);
    };

    form.onsubmit = function (e) {
      e.preventDefault();

      const updatedMeasurements = {};
      Object.keys(measurements).forEach((key) => {
        const input = document.getElementById(key);
        if (input && input.value) {
          updatedMeasurements[key] = parseFloat(input.value);
        }
      });

      cart.saveMeasurements(updatedMeasurements);
      form.remove();
      setHidden(measurementsDisplay, false);
      if (editBtn) setHidden(editBtn, false);
      displayMeasurements();
      showNotification("✅ Measurements updated successfully!");
    };
  }

  function setupCheckoutHandler() {
    const proceedBtn = document.getElementById("proceedBtn");
    if (proceedBtn) {
      proceedBtn.addEventListener("click", function (e) {
        e.preventDefault();
        handleCheckoutIntent();
      });
    }
  }

  function syncCartPageFromSharedState() {
    displayCart();
    displayMeasurements();
  }

  window.addEventListener("tailor:cart-updated", syncCartPageFromSharedState);
  window.addEventListener("storage", function (event) {
    if (event.key === "tailorCart" || event.key === "tailorMeasurements") {
      cart.items = cart.loadFromLocalStorage();
      cart.measurements = cart.loadMeasurementsFromLocalStorage();
      syncCartPageFromSharedState();
    }
  });

  displayCart();
  displayMeasurements();
  setupCheckoutHandler();
}

// Shared checkout guard that redirects users when cart or measurements are missing.
function handleCheckoutIntent(options = {}) {
  const emptyCartRedirect =
    options.emptyCartRedirect || "index.html#clothing-section";
  const missingMeasurementsRedirect =
    options.missingMeasurementsRedirect || "index.html#measurementsSection";
  const checkoutRedirect = options.checkoutRedirect || "order.html";
  const delayMs = Number.isFinite(options.delayMs) ? options.delayMs : 1500;
  const beforeRedirect = options.beforeRedirect;

  if (cart.getItems().length === 0) {
    if (typeof beforeRedirect === "function") {
      beforeRedirect("empty-cart");
    }
    window.location.href = emptyCartRedirect;
    return;
  }

  if (!cart.measurements || Object.keys(cart.measurements).length === 0) {
    showNotification("⚠️ Please fill in your measurements before checkout!");
    setTimeout(() => {
      if (typeof beforeRedirect === "function") {
        beforeRedirect("missing-measurements");
      }
      window.location.href = missingMeasurementsRedirect;
    }, delayMs);
    return;
  }

  if (typeof beforeRedirect === "function") {
    beforeRedirect("ok");
  }
  window.location.href = checkoutRedirect;
}

// Finds the first matching form field from a list of possible field names.
function findField(form, names) {
  for (const n of names) {
    const el = form.querySelector(`[name="${n}"]`);
    if (el) return el;
  }
  return null;
}

// Legacy/local-only save helper kept as a fallback for offline-style order storage.
async function submitOrderToFirebase(orderData) {
  try {
    const stored = localStorage.getItem("orders") || "[]";
    const orders = JSON.parse(stored);
    const orderId = "local_" + Date.now();
    const orderRecord = Object.assign(
      { orderId: orderId, timestamp: Date.now() },
      orderData,
    );
    orders.push(orderRecord);
    localStorage.setItem("orders", JSON.stringify(orders));
    console.log("Order saved locally with ID:", orderId);
    return { success: true, orderId: orderId };
  } catch (error) {
    console.error("Local save error:", error);
    return { success: false, error: error.message || String(error) };
  }
}

// =====================================================
// CLOTHING SELECTION & AUTO-SCROLL TO FABRIC
// =====================================================

// Main page bootstrap: wires shared UI, dynamic catalog rendering, and page-specific logic.
document.addEventListener("DOMContentLoaded", function () {
  // Update cart count on page load
  cart.updateCartUI();
  updateOrdersNavLinks();

  // =====================================================
  // MEASUREMENT GUIDE MODAL
  // =====================================================

  const measurementModal = document.getElementById("measurementModal");
  const measurementLink = document.querySelector(".measurement-link");
  const modalClose = document.querySelector(".modal-close");

  if (measurementLink) {
    measurementLink.addEventListener("click", function (e) {
      e.preventDefault();
      measurementModal.classList.add("active");
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", function () {
      measurementModal.classList.remove("active");
    });
  }

  if (measurementModal) {
    measurementModal.addEventListener("click", function (e) {
      if (e.target === measurementModal) {
        measurementModal.classList.remove("active");
      }
    });
  }

  // =====================================================
  // FLOATING CART ICON - PARKS IN NAV WHEN AT TOP
  // =====================================================

  const cartIcon = document.getElementById("cartIcon");
  const nav = document.querySelector("nav");

  // Keeps the cart icon docked in the nav at the top, then floating after scrolling.
  function handleCartPosition() {
    if (!cartIcon || !nav) return;

    // Only apply floating behavior if cart has items
    if (!cartIcon.classList.contains("show")) return;

    const scrollY = window.scrollY;
    const navHeight = nav.offsetHeight;

    if (scrollY > navHeight) {
      // User has scrolled past nav - float the cart
      cartIcon.classList.add("floating");
      cartIcon.classList.remove("docked");
    } else {
      // At top of page - park cart in nav
      cartIcon.classList.add("docked");
      cartIcon.classList.remove("floating");
    }
  }

  // Listen for scroll events
  window.addEventListener("scroll", handleCartPosition);

  // Initial check on page load
  handleCartPosition();

    // =====================================================
    // DYNAMIC CLOTHING & FABRIC ITEMS LOADING
    // =====================================================
  
    // Rebuilds the clothing catalog from localStorage-backed data.
    function renderClothingItems() {
      const typesContainer = document.querySelector(".types");
      if (!typesContainer) return;
    
      const clothing = getClothingItems().filter(
        (item) => item && typeof item.name === "string" && typeof item.image === "string" && item.image.length > 0,
      );
      let html = '';
    
      clothing.forEach((item) => {
        const safeName = item.name.trim() || "Garment";
        const safeClass = safeName.toLowerCase().replace(/\s+/g, "-");
        html += `
          <label class="clothing-label">
            <input
              type="checkbox"
              name="options"
              value="1"
              class="img-checkbox clothing-checkbox"
            />
            <img
              src="${item.image}"
              class="${safeClass} type clothing-img"
              alt="${safeName}"
            />
            <span class="clothing-name">${safeName}</span>
          </label>
        `;
      });
    
      typesContainer.innerHTML = html;

      // Dynamic re-renders happen after observers are attached; force reveal.
      typesContainer
        .querySelectorAll(".type")
        .forEach((el) => el.classList.add("animate-on-scroll"));
    
      // Reattach clothing checkbox listeners
      attachClothingCheckboxListeners();
    }
  
    // Rebuilds the fabric catalog from localStorage-backed data.
    function renderFabricItems() {
      const fabricGrid = document.querySelector(".fabric-grid");
      if (!fabricGrid) return;
    
      const fabrics = getFabricItems().filter(
        (item) => item && typeof item.image === "string" && item.image.length > 0,
      );
      let html = '';
    
      fabrics.forEach((item, index) => {
        const safeName = (item.name || `Fabric ${index + 1}`).trim() || `Fabric ${index + 1}`;
        html += `
          <label class="fabric-label">
            <input
              type="checkbox"
              name="options"
              value="1"
              class="img-checkbox fabric-checkbox"
            />
            <img
              src="${item.image}"
              class="fabric-img"
              alt="${safeName}"
            />
            <span class="fabric-name">${safeName}</span>
          </label>
        `;
      });
    
      fabricGrid.innerHTML = html;

      // Dynamic re-renders happen after observers are attached; force reveal.
      fabricGrid
        .querySelectorAll(".fabric-img")
        .forEach((el) => el.classList.add("animate-on-scroll"));
    
      // Reattach fabric checkbox listeners
      attachFabricCheckboxListeners();
    }
  
    // Reattaches clothing-selection behavior after dynamic re-rendering.
    function attachClothingCheckboxListeners() {
      const clothingCheckboxes = document.querySelectorAll(".second .img-checkbox");
      const fabricSection = document.querySelector(".fabric");
    
      clothingCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            const label = this.closest("label");
            const clothingImg = label.querySelector(".clothing-img");
            const clothingName = label.querySelector(".clothing-name").textContent;
            const clothingSrc = clothingImg.src;

            sessionStorage.setItem("selectedClothing", clothingName);
            if (fabricSection) {
              fabricSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          } else {
            sessionStorage.removeItem("selectedClothing");
          }
        });
      });
    }
  
    // Reattaches fabric-selection behavior after dynamic re-rendering.
    function attachFabricCheckboxListeners() {
      const fabricCheckboxes = document.querySelectorAll(".fabric .img-checkbox");
    
      fabricCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            const selectedClothing = sessionStorage.getItem("selectedClothing");

            if (!selectedClothing) {
              showNotification("⚠️ Please select a clothing item first!");
              this.checked = false;
              return;
            }

            const label = this.closest("label");
            const fabricImg = label.querySelector(".fabric-img");
            const fabricSrc = fabricImg.src;

            // Add to cart
            cart.addItem(
              { name: selectedClothing, image: null },
              { name: "Fabric", image: fabricSrc },
            );

            // Show feedback
            showNotification(`${selectedClothing} with fabric added to cart!`);

            // Clear session storage
            sessionStorage.removeItem("selectedClothing");

            // Reset all checkboxes
            document.querySelectorAll(".img-checkbox").forEach((cb) => {
              cb.checked = false;
            });
            this.checked = false;
          }
        });
      });
    }
  
    // Render dynamic items on page load
    renderClothingItems();
    renderFabricItems();
  
    // Centralized refresh so catalog updates from admin tabs are applied safely.
    function refreshDynamicItems() {
      try {
        renderClothingItems();
        renderFabricItems();
      } catch (error) {
        // If rendering ever fails from malformed data, hard refresh to recover UI.
        window.location.reload();
      }
    }

    // Listen for storage changes from other tabs/windows (admin page).
    window.addEventListener("storage", (e) => {
      if (e.key === "tailorClothing" || e.key === "tailorFabrics" || e.key === "tailorItemsVersion") {
        refreshDynamicItems();
      }
    });

    // Also refresh when tab gains focus in case storage event was skipped.
    window.addEventListener("focus", refreshDynamicItems);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshDynamicItems();
      }
    });
  // =====================================================
  // SAVE MEASUREMENTS HANDLER
  // =====================================================

  const homeMeasurementInputs = document.querySelectorAll(
    ".measurements input[type='number']",
  );
  const measurementsSection = document.getElementById("measurementsSection");
  const measurementFormSection = document.querySelector(
    ".measurements .form-section",
  );
  const saveMeasurementContainer = document.querySelector(
    ".measurements .save-measurement-container",
  );
  const measurementsSummary = document.getElementById("measurementsSummary");
  const measurementsSummaryDisplay = document.getElementById(
    "measurementsSummaryDisplay",
  );
  const editMeasurementsSummaryBtn = document.getElementById(
    "editMeasurementsSummaryBtn",
  );
  const saveMeasurementBtn = document.querySelector(".save-measurement-btn");

  const measurementLabels = {
    fullShoulder: "Full Shoulder",
    fullSleeve: "Full Sleeve",
    fullChest: "Full Chest",
    waist: "Waist",
    hips: "Hips",
    frontChest: "Front Chest",
    backChest: "Back Chest",
    jacket: "Jacket Length",
    pantsWaist: "Pants Waist",
    lowHip: "Low Hip",
    thigh: "Thigh",
    crotch: "Crotch",
    pantLength: "Pants Length",
    bicep: "Bicep",
    neck: "Neck",
    cuffs: "Cuffs",
  };

  function populateHomeMeasurementInputs(measurements) {
    if (!homeMeasurementInputs || homeMeasurementInputs.length === 0) return;
    if (!measurements) return;

    homeMeasurementInputs.forEach((input) => {
      if (measurements[input.name] != null) {
        input.value = measurements[input.name];
      }
    });
  }

  function setHomeMeasurementView(view) {
    if (!measurementFormSection || !saveMeasurementContainer) return;
    if (!measurementsSummary) return;

    const showForm = view === "form" || view === "form-edit";
    setHidden(measurementFormSection, !showForm);
    setHidden(saveMeasurementContainer, !showForm);
    setHidden(measurementsSummary, showForm);

    if (showForm && measurementsSection && view === "form-edit") {
      measurementsSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  function setSaveButtonLabel(hasSavedMeasurements) {
    if (!saveMeasurementBtn) return;
    saveMeasurementBtn.textContent = hasSavedMeasurements
      ? "Save Changes"
      : "Save Measurement";
  }

  function renderHomeMeasurementSummary() {
    if (!measurementsSummary || !measurementsSummaryDisplay) return;
    const measurements = cart.measurements;

    if (!measurements || Object.keys(measurements).length === 0) {
      setHidden(measurementsSummary, true);
      setHomeMeasurementView("form");
      setSaveButtonLabel(false);
      return;
    }

    setHidden(measurementsSummary, false);
    measurementsSummaryDisplay.innerHTML = "";

    Object.keys(measurements).forEach((key) => {
      if (measurements[key]) {
        const div = document.createElement("div");
        div.className = "measurement-item";
        div.innerHTML = `
          <span class="measurement-label">${measurementLabels[key] || key}</span>
          <span class="measurement-value">${measurements[key]} inches</span>
        `;
        measurementsSummaryDisplay.appendChild(div);
      }
    });

    if (editMeasurementsSummaryBtn) {
      editMeasurementsSummaryBtn.onclick = function (e) {
        e.preventDefault();
        populateHomeMeasurementInputs(measurements);
        setHomeMeasurementView("form-edit");
      };
    }

    setHomeMeasurementView("summary");
    setSaveButtonLabel(true);
  }
  if (saveMeasurementBtn) {
    saveMeasurementBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const measurementInputs = document.querySelectorAll(
        ".measurements input[type='number']",
      );
      const measurements = {};

      let allFilled = true;
      measurementInputs.forEach((input) => {
        if (!input.value.trim()) {
          allFilled = false;
        }
        measurements[input.name] = input.value;
      });

      if (!allFilled) {
        showNotification("❌ Please fill all measurement fields!");
        return;
      }

      // Save to cart
      cart.saveMeasurements(measurements);
      showNotification("✅ Measurements saved successfully!");
      renderHomeMeasurementSummary();
    });
  }

  populateHomeMeasurementInputs(cart.measurements);
  renderHomeMeasurementSummary();

  // Handle clothing selection (checkboxes in section 3)
  const clothingCheckboxes = document.querySelectorAll(".second .img-checkbox");
  const fabricSection = document.querySelector(".fabric");

  clothingCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        // Get the clothing image info
        const label = this.closest("label");
        const img = label.querySelector(".type");
        // Get the actual clothing type (tuxedo, trousers, suit, shirt, sherwani, thobe)
        const classes = img.className.split(" ");
        let clothingName = "Garment";
        for (let cls of classes) {
          if (
            [
              "tuxedo",
              "trousers",
              "suit",
              "shirt",
              "sherwani",
              "thobe",
            ].includes(cls)
          ) {
            clothingName = cls.charAt(0).toUpperCase() + cls.slice(1);
            break;
          }
        }

        // Store selected clothing temporarily
        sessionStorage.setItem("selectedClothing", clothingName);

        // Auto-scroll to fabric section
        fabricSection.scrollIntoView({ behavior: "smooth" });

        // Uncheck this checkbox after storing
        setTimeout(() => {
          this.checked = false;
        }, 300);
      }
    });
  });

  // =====================================================
  // FABRIC SELECTION & ADD TO CART
  // =====================================================

  const fabricCheckboxes = document.querySelectorAll(".fabric .img-checkbox");

  fabricCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        const selectedClothing = sessionStorage.getItem("selectedClothing");

        if (selectedClothing) {
          // Get fabric image
          const label = this.closest("label");
          const fabricImg = label.querySelector(".fabric-img");
          const fabricSrc = fabricImg.src;

          // Add to cart
          cart.addItem(
            { name: selectedClothing, image: null },
            { name: "Fabric", image: fabricSrc },
          );

          // Show feedback
          showNotification(`${selectedClothing} with fabric added to cart!`);

          // Clear session storage
          sessionStorage.removeItem("selectedClothing");

          // Uncheck this checkbox
          setTimeout(() => {
            this.checked = false;
          }, 300);
        } else {
          showNotification("Please select a clothing item first!");

          // Keep state consistent: fabric cannot stay selected without clothing.
          this.checked = false;
        }
      }
    });
  });

  // Floating cart icon click handler — open slide-over cart panel
  function buildCartPanel() {
    if (document.querySelector(".cart-panel")) return;

    const backdrop = document.createElement("div");
    backdrop.className = "cart-backdrop";
    document.body.appendChild(backdrop);

    const panel = document.createElement("aside");
    panel.className = "cart-panel";

    panel.innerHTML = `
      <div class="panel-header">
        <strong>Your Cart</strong>
        <button class="close-btn" aria-label="Close">×</button>
      </div>
      <div class="panel-body">
        <div class="cart-items-placeholder">Loading cart...</div>
      </div>
      <div class="panel-footer">
        <div class="cart-panel-total" aria-live="polite">Total: Rs. 0</div>
        <button class="view-cart-btn" >View full cart</button>
        <button class="checkout-btn">Checkout</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Events
    backdrop.addEventListener("click", closeCartPanel);
    panel.querySelector(".close-btn").addEventListener("click", closeCartPanel);
    panel.querySelector(".panel-body").addEventListener("click", function (e) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.classList.contains("panel-qty-btn")) {
        const itemId = parseInt(target.dataset.id, 10);
        const item = cart.getItems().find((i) => i.id === itemId);
        if (!item) return;

        if (target.classList.contains("plus")) {
          cart.updateQuantity(itemId, item.quantity + 1);
        } else if (target.classList.contains("minus")) {
          if (item.quantity > 1) {
            cart.updateQuantity(itemId, item.quantity - 1);
          } else {
            cart.removeItem(itemId);
          }
        }
        refreshCartPanel();
        return;
      }
    });

    panel.querySelector(".panel-body").addEventListener("change", function (e) {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.classList.contains("panel-qty-input")) return;

      const itemId = parseInt(target.dataset.id, 10);
      const newQuantity = parseInt(target.value, 10) || 1;
      cart.updateQuantity(itemId, newQuantity);
      refreshCartPanel();
    });

    panel
      .querySelector(".view-cart-btn")
      .addEventListener("click", function () {
        window.location.href = "cart.html";
      });
    panel.querySelector(".checkout-btn").addEventListener("click", function () {
      handleCheckoutIntent({
        beforeRedirect: function () {
          closeCartPanel();
        },
      });
    });
  }

  function refreshCartPanel() {
    const panel = document.querySelector(".cart-panel");
    if (!panel) return;
    const body = panel.querySelector(".panel-body");
    const totalEl = panel.querySelector(".cart-panel-total");
    const items = cart.getItems();
    if (!items || items.length === 0) {
      body.innerHTML =
        '<p class="cart-panel-empty">Your cart is empty. Add items to get started!</p>';
      if (totalEl) {
        totalEl.textContent = "Total: Rs. 0";
      }
      return;
    }

    let totalPrice = 0;
    const list = document.createElement("div");
    list.className = "cart-items-list-panel";
    items.forEach((it) => {
      const itemSubtotal = (it.price || 0) * it.quantity;
      totalPrice += itemSubtotal;
      const item = document.createElement("div");
      item.className = "cart-panel-item";
      item.innerHTML = `<div class="cart-panel-item-head">
                          <div class="cart-panel-item-info">
                            <div class="cart-panel-item-title">${it.clothing.name}</div>
                            <div class="cart-panel-item-meta">${it.fabric.name} — Qty: ${it.quantity}</div>
                          </div>
                          <div class="cart-panel-item-price">Rs. ${itemSubtotal}</div>
                        </div>
                        <div class="cart-panel-actions">
                          <button class="panel-qty-btn minus" data-id="${it.id}" type="button">-</button>
                          <input class="panel-qty-input" data-id="${it.id}" type="number" min="1" value="${it.quantity}">
                          <button class="panel-qty-btn plus" data-id="${it.id}" type="button">+</button>
                        </div>`;
      list.appendChild(item);
    });

    body.innerHTML = "";
    body.appendChild(list);
    if (totalEl) {
      totalEl.innerHTML = `<strong>Total: Rs. ${totalPrice}</strong>`;
    }
  }

  function openCartPanel() {
    buildCartPanel();
    const panel = document.querySelector(".cart-panel");
    const backdrop = document.querySelector(".cart-backdrop");
    if (panel && backdrop) {
      panel.classList.add("open");
      backdrop.classList.add("visible");
      refreshCartPanel();
    }
  }
  window.__openCartPanel = openCartPanel;

  function closeCartPanel() {
    const panel = document.querySelector(".cart-panel");
    const backdrop = document.querySelector(".cart-backdrop");
    if (panel && backdrop) {
      panel.classList.remove("open");
      backdrop.classList.remove("visible");
    }
  }

  window.addEventListener("tailor:cart-updated", refreshCartPanel);
  window.addEventListener("storage", function (event) {
    if (event.key === "tailorCart") {
      cart.items = cart.loadFromLocalStorage();
      refreshCartPanel();
    }
  });

  if (cartIcon) {
    cartIcon.addEventListener("click", function (e) {
      e.preventDefault();
      // open panel instead of navigating away
      openCartPanel();
    });
  }

  // Order Online button - scroll to clothing section
  const orderOnlineBtn = document.getElementById("orderOnlineBtn");
  if (orderOnlineBtn) {
    orderOnlineBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const clothingSection = document.getElementById("clothing-section");
      if (clothingSection) {
        clothingSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Visit Us button - scroll to about section
  const visitUsBtn = document.getElementById("visitUsBtn");
  if (visitUsBtn) {
    visitUsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const aboutSection = document.getElementById("about-section");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // =====================================================
  // SCROLL-BASED ANIMATIONS WITH INTERSECTION OBSERVER
  // =====================================================

  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-on-scroll");
          // Optional: stop observing after animation triggers
          // animationObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: "0px 0px -50px 0px", // Start animation slightly before fully visible
    },
  );

  // Observe all elements with scroll animation class
  const elementsToAnimate = document.querySelectorAll(
    ".front, .brand-story, .instructions-section, .second, .fabric, .about-brand, " +
      ".type, .fabric-img, .instruction-step, [data-scroll-animate]",
  );

  elementsToAnimate.forEach((element) => {
    animationObserver.observe(element);
  });

  initOrderPage();
  initCartPage();
  initOrdersPage();
});

// =====================================================
// NOTIFICATION SYSTEM
// =====================================================

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `<div class="notification-content">${message}</div>`;
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Auto-dismiss
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// =====================================================
// SCROLL ARROW FUNCTIONALITY
// =====================================================

// Arrow buttons removed or simplified per user request
