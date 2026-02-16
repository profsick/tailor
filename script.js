// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

const SUPABASE_URL = "https://ptukwjetdzqamcadzizt.supabase.co";
const SUPABASE_KEY = "sb_publishable__I-AYgmaXTBvliWFnVGQ3A_000bNXie";
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// PRICING CONFIGURATION
// =====================================================

const PRICING = {
  shirt: 1000,
  trousers: 800,
  pant: 800,
  suit: 6000,
  tuxedo: 8000,
  sherwani: 10000,
  thobe: 5000,
};

// =====================================================
// CART MANAGEMENT - LocalStorage
// =====================================================

class Cart {
  constructor() {
    this.items = this.loadFromLocalStorage();
    this.measurements = this.loadMeasurementsFromLocalStorage();
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem("tailorCart");
    return saved ? JSON.parse(saved) : [];
  }

  loadMeasurementsFromLocalStorage() {
    const saved = localStorage.getItem("tailorMeasurements");
    return saved ? JSON.parse(saved) : null;
  }

  saveMeasurements(measurementData) {
    this.measurements = measurementData;
    localStorage.setItem("tailorMeasurements", JSON.stringify(measurementData));
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem("tailorCart", JSON.stringify(this.items));
  }

  addItem(clothing, fabric) {
    const clothingKey = clothing.name.toLowerCase();
    const price = PRICING[clothingKey] || 0;

    const item = {
      id: Date.now(),
      clothing: clothing,
      fabric: fabric,
      quantity: 1,
      price: price,
    };
    this.items.push(item);
    this.saveToLocalStorage();
    this.updateCartUI();
    return item;
  }

  removeItem(itemId) {
    this.items = this.items.filter((item) => item.id !== itemId);
    this.saveToLocalStorage();
    this.updateCartUI();
  }

  updateQuantity(itemId, quantity) {
    const item = this.items.find((i) => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveToLocalStorage();
      this.updateCartUI();
    }
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartIcon = document.getElementById("cartIcon");
    const itemCount = this.getItemCount();

    if (cartCount) {
      cartCount.textContent = itemCount;
    }

    // Show cart icon only when there are items
    if (cartIcon) {
      if (itemCount > 0) {
        cartIcon.classList.add("show");
        // Set initial state based on scroll position
        const scrollY = window.scrollY;
        const nav = document.querySelector("nav");
        const navHeight = nav ? nav.offsetHeight : 100;

        if (scrollY > navHeight) {
          cartIcon.classList.add("floating");
          cartIcon.classList.remove("docked");
        } else {
          cartIcon.classList.add("docked");
          cartIcon.classList.remove("floating");
        }
      } else {
        cartIcon.classList.remove("show", "floating", "docked");
      }
    }
  }

  getItems() {
    return this.items;
  }

  clearCart() {
    this.items = [];
    this.saveToLocalStorage();
    this.updateCartUI();
  }
}

// Initialize cart
const cart = new Cart();

// =====================================================
// SUPABASE SUBMISSION (replaced Google Sheets)
// =====================================================

// Using Supabase for order storage - see SUPABASE_URL and SUPABASE_KEY at top

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

async function submitOrderToSheet(orderData) {
  const submitBtn = document.querySelector(".submit-btn");

  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitBtn.textContent = "Processing order...";
  }

  try {
    console.log("📤 Submitting order to Supabase:", orderData);

    // Get items for proper data structure
    const items = getCartItems();

    // Insert order into Supabase
    const { data, error } = await sbClient
      .from("orders")
      .insert([
        {
          name: orderData.name,
          email: orderData.email,
          phone: orderData.phone,
          clothing:
            items?.map((item) => item.clothing.name).join(", ") || "N/A",
          fabric: items?.map((item) => item.fabric.name).join(", ") || "N/A",
          measurements: orderData.measurements || {},
          instructions: orderData.instructions || "",
          total: orderData.total || 0,
          status: "Pending",
        },
      ])
      .select("id,status,created_at")
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      throw new Error(error.message);
    }

    const persistedOrder = {
      ...orderData,
      supabaseId: data?.id || null,
      status: data?.status || orderData.status || "Pending",
      timestamp: orderData.timestamp || Date.now(),
    };

    console.log("✅ Order saved to Supabase:", data);
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
  } catch (error) {
    console.error("❌ Order submission error:", error);
    showNotification("❌ Failed to submit order: " + error.message);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
      submitBtn.textContent = "Place Order";
    }
  }
}

function setHidden(element, hidden) {
  if (!element) return;
  element.classList.toggle("is-hidden", hidden);
}

function loadOrderHistory() {
  try {
    const stored = localStorage.getItem("orders");
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

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
    supabaseId: orderData.supabaseId || null,
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

function updateOrdersNavLinks() {
  const links = document.querySelectorAll(".orders-link");
  if (!links || links.length === 0) return;
  const hasOrders = getValidOrderHistory().length > 0;
  links.forEach((link) => {
    link.classList.toggle("is-hidden", !hasOrders);
  });
}

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

async function syncOrderStatusesFromSupabase(orders) {
  const supabaseIds = orders
    .map((order) => order.supabaseId)
    .filter((id) => typeof id === "string" && id.length > 0);

  if (supabaseIds.length === 0) return orders;

  try {
    const { data, error } = await sbClient
      .from("orders")
      .select("id,status")
      .in("id", supabaseIds);

    if (error || !data) return orders;

    const statusMap = new Map(
      data.map((row) => [row.id, row.status || "Pending"]),
    );

    const updated = orders.map((order) => {
      if (!order.supabaseId) return order;
      const status = statusMap.get(order.supabaseId);
      if (!status) return order;
      return { ...order, status };
    });

    localStorage.setItem("orders", JSON.stringify(updated));
    return updated;
  } catch (error) {
    return orders;
  }
}

async function initOrdersPage() {
  const ordersList = document.getElementById("ordersList");
  const emptyMessage = document.getElementById("ordersEmpty");
  const clearBtn = document.getElementById("clearOrderHistoryBtn");
  if (!ordersList) return;

  let orders = getValidOrderHistory();
  orders = await syncOrderStatusesFromSupabase(orders);
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

  orderForm.addEventListener("submit", function (e) {
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
    submitOrderToSheet(orderData);

    setTimeout(() => {
      if (window.cart && typeof cart.clearCart === "function") {
        cart.clearCart();
      }
      localStorage.removeItem("tailorCart");
      if (window.cart && typeof cart.updateCartUI === "function") {
        cart.updateCartUI();
      }
      if (summaryDiv) {
        summaryDiv.innerHTML =
          '<p class="empty-cart-text">No items in cart</p>';
      }
      const confirmation = document.getElementById("orderConfirmation");
      if (confirmation) {
        setHidden(confirmation, false);
      }
      setHidden(orderForm, true);
      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
    }, 2000);
  });
}

function loadCustomerDetails() {
  try {
    const stored = localStorage.getItem("customerDetails");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function saveCustomerDetails(details) {
  if (!details) return;
  const payload = {
    name: details.name || "",
    email: details.email || "",
    phone: details.phone || "",
  };
  localStorage.setItem("customerDetails", JSON.stringify(payload));
}

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

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
      clearBtn.removeEventListener("click", handleClearCart);
      clearBtn.addEventListener("click", handleClearCart);
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
    } else if (e.target.classList.contains("qty-input")) {
      const input = e.target;
      const itemId = parseInt(input.dataset.id, 10);
      const newQuantity = parseInt(input.value, 10) || 1;
      cart.updateQuantity(itemId, newQuantity);
      displayCart();
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

  displayCart();
  displayMeasurements();
  setupCheckoutHandler();
}

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

function findField(form, names) {
  for (const n of names) {
    const el = form.querySelector(`[name="${n}"]`);
    if (el) return el;
  }
  return null;
}

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
          if (["tuxedo", "trousers", "suit", "shirt", "sherwani", "thobe"].includes(cls)) {
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
        <button class="view-cart-btn" >View full cart</button>
        <button class="checkout-btn">Checkout</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Events
    backdrop.addEventListener("click", closeCartPanel);
    panel.querySelector(".close-btn").addEventListener("click", closeCartPanel);
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
    const backdrop = document.querySelector(".cart-backdrop");
    if (!panel) return;
    const body = panel.querySelector(".panel-body");
    const items = cart.getItems();
    if (!items || items.length === 0) {
      body.innerHTML =
        '<p class="cart-panel-empty">Your cart is empty. Add items to get started!</p>';
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
      item.innerHTML = `<div class="cart-panel-item-title">${it.clothing.name}</div>
                        <div class="cart-panel-item-meta">${it.fabric.name} — Qty: ${it.quantity}</div>
                        <div class="cart-panel-item-price">Rs. ${it.price} × ${it.quantity} = Rs. ${itemSubtotal}</div>`;
      list.appendChild(item);
    });

    // Add total
    const totalDiv = document.createElement("div");
    totalDiv.className = "cart-panel-total";
    totalDiv.innerHTML = `<strong>Total: Rs. ${totalPrice}</strong>`;
    list.appendChild(totalDiv);

    body.innerHTML = "";
    body.appendChild(list);
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

  function closeCartPanel() {
    const panel = document.querySelector(".cart-panel");
    const backdrop = document.querySelector(".cart-backdrop");
    if (panel && backdrop) {
      panel.classList.remove("open");
      backdrop.classList.remove("visible");
    }
  }

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
