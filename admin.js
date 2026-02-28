const API_BASE = window.TAILOR_API_BASE || `${window.location.origin}/api`;

// Login credentials
const ADMIN_USERNAME = "em aay";
const ADMIN_PASSWORD = "alhamdulillah";

// Check if already logged in
window.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  if (isLoggedIn === "true") {
    showDashboard();
  }
});

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.message || `Request failed with status ${response.status}`,
    );
  }

  return payload;
}
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("loginError");

  errorDiv.classList.add("is-hidden");

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminLoggedIn", "true");
    showDashboard();
  } else {
    errorDiv.classList.remove("is-hidden");
    errorDiv.textContent = "❌ Invalid username or password";
    document.getElementById("password").value = "";
  }
}

function showDashboard() {
  document.getElementById("loginPage").classList.add("is-hidden");
  document.getElementById("dashboard").classList.remove("is-hidden");
  loadOrders();
}

async function loadOrders() {
  const content = document.getElementById("content");
  const orderCount = document.getElementById("orderCount");

  try {
    content.innerHTML = '<div class="loading">Loading orders...</div>';

    const data = await apiRequest("/orders");

    if (!Array.isArray(data) || data.length === 0) {
      content.innerHTML =
        '<div class="error">📭 No orders found yet. Orders will appear here when customers place them.</div>';
      orderCount.textContent = "0";
      return;
    }

    orderCount.textContent = data.length;

    let html = `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Phone no.</th>
                <th>Order</th>
                <th>Measurements</th>
                <th>Instructions</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
        `;

    data.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let measurements = "No measurements";
      if (order.measurements && typeof order.measurements === "object") {
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

        const measList = Object.entries(order.measurements)
          .filter(([_, val]) => val)
          .map(
            ([key, value]) =>
              `${measurementLabels[key] || key}: ${value} inches`,
          )
          .join("<br>");
        measurements = measList || "No measurements";
      }

      const statusLabel = order.status || "Pending";
      const isCompleted = statusLabel.toLowerCase() === "completed";
      const instructions = order.instructions || "";
      const instructionsPreview =
        instructions.length > 30
          ? instructions.substring(0, 30) + "..."
          : instructions || "No instructions";
      const instructionsId = `instructions-${order.id}`;

      html += `
            <tr>
              <td data-label="Date">${date}</td>
              <td data-label="Name"><strong>${order.name || "N/A"}</strong></td>
              <td data-label="Phone">${order.phone || "N/A"}</td>
              <td data-label="Order">
                <strong>${order.clothing || "N/A"}</strong><br>
                <span style="color: #666; font-size: 1.2rem;">Fabric: ${order.fabric || "N/A"}</span>
              </td>
              <td data-label="Measurements"><div class="measurements-cell">${measurements}</div></td>
              <td data-label="Instructions">
                <div class="instructions-cell">
                  <div class="instructions-preview">${instructionsPreview}</div>
                  ${
                    instructions.length > 30
                      ? `
                    <button class="expand-btn" onclick="toggleInstructions('${instructionsId}')">
                      <span class="expand-icon">▼</span>
                    </button>
                    <div id="${instructionsId}" class="instructions-full" style="display: none;">
                      ${instructions}
                    </div>
                  `
                      : ""
                  }
                </div>
              </td>
              <td data-label="Total" class="price">₹${order.total || 0}</td>
              <td data-label="Status">
                <span class="status-badge ${isCompleted ? "completed" : "pending"}">${statusLabel}</span>
              </td>
              <td data-label="Actions">
                <div class="action-buttons">
                  <button class="complete-btn" onclick="markOrderCompleted('${order.id}')" ${isCompleted ? "disabled" : ""}>
                    ${isCompleted ? "✅ Completed" : "✅Completed"}
                  </button>
                  <button class="delete-btn" onclick="deleteOrder('${order.id}')">🗑️ Delete</button>
                </div>
              </td>
            </tr>
          `;
    });

    html += `
            </tbody>
          </table>
        `;

    content.innerHTML = html;
  } catch (error) {
    content.innerHTML = `<div class="error">❌ Error loading orders: ${error.message}</div>`;
    orderCount.textContent = "0";
  }
}

async function deleteAllOrders() {
  if (!confirm("⚠️ Are you SURE? This will delete ALL orders permanently!")) {
    return;
  }

  const content = document.getElementById("content");

  try {
    content.innerHTML = '<div class="loading">Deleting all orders...</div>';

    await apiRequest("/orders", { method: "DELETE" });

    content.innerHTML =
      '<div class="success">✅ All orders deleted successfully!</div>';
    document.getElementById("orderCount").textContent = "0";

    setTimeout(() => {
      loadOrders();
    }, 1200);
  } catch (error) {
    content.innerHTML = `<div class="error">❌ Error deleting orders: ${error.message}</div>`;
  }
}

async function deleteOrder(orderId) {
  if (!confirm("⚠️ Are you sure you want to delete this order?")) {
    return;
  }

  try {
    await apiRequest(`/orders/${orderId}`, { method: "DELETE" });

    showAdminMessage("✅ Order deleted successfully!", "success");
    setTimeout(() => {
      loadOrders();
    }, 800);
  } catch (error) {
    showAdminMessage(`❌ Error deleting order: ${error.message}`, "error");
  }
}

async function markOrderCompleted(orderId) {
  try {
    await apiRequest(`/orders/${orderId}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Completed" }),
    });

    showAdminMessage("✅ Order marked as completed!", "success");
    setTimeout(() => {
      loadOrders();
    }, 700);
  } catch (error) {
    showAdminMessage(`❌ Error updating order: ${error.message}`, "error");
  }
}

function showAdminMessage(message, type) {
  const content = document.getElementById("content");
  const messageDiv = document.createElement("div");
  messageDiv.className = type;
  messageDiv.textContent = message;

  if (content.firstChild) {
    content.insertBefore(messageDiv, content.firstChild);
  } else {
    content.appendChild(messageDiv);
  }

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

async function testConnection() {
  const content = document.getElementById("content");
  try {
    content.innerHTML =
      '<div class="loading">Testing backend connection...</div>';

    await apiRequest("/health");

    content.innerHTML =
      '<div class="success">✅ Backend connection successful! API is working.</div>';
    setTimeout(() => {
      loadOrders();
    }, 1500);
  } catch (error) {
    content.innerHTML = `<div class="error">❌ Connection Error: ${error.message}</div>`;
  }
}

function toggleInstructions(id) {
  const element = document.getElementById(id);
  const btn = element?.previousElementSibling;

  if (element && btn) {
    const isHidden = element.style.display === "none";
    element.style.display = isHidden ? "block" : "none";

    const icon = btn.querySelector(".expand-icon");
    if (icon) {
      icon.textContent = isHidden ? "▲" : "▼";
    }
  }
}
