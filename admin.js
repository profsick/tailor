const SUPABASE_URL = "https://ptukwjetdzqamcadzizt.supabase.co";
const SUPABASE_KEY = "sb_publishable__I-AYgmaXTBvliWFnVGQ3A_000bNXie";
let adminSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("loginError");

  // Clear previous error
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

    const { data, error } = await adminSupabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
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

      // Format measurements for display
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

      // Format instructions
      const instructions = order.instructions || "";
      const instructionsPreview =
        instructions.length > 30
          ? instructions.substring(0, 30) + "..."
          : instructions || "No instructions";
      const instructionsId = `instructions-${order.id}`;

      html += `
            <tr>
              <td>${date}</td>
              <td><strong>${order.name || "N/A"}</strong></td>
              <td>${order.phone || "N/A"}</td>
              <td>
                <strong>${order.clothing || "N/A"}</strong><br>
                <span style="color: #666; font-size: 1.2rem;">Fabric: ${order.fabric || "N/A"}</span>
              </td>
              <td><div class="measurements-cell">${measurements}</div></td>
              <td>
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
              <td class="price">₹${order.total || 0}</td>
              <td>
                <span class="status-badge ${isCompleted ? "completed" : "pending"}">${statusLabel}</span>
              </td>
              <td>
                <button class="complete-btn" onclick="markOrderCompleted('${order.id}')" ${isCompleted ? "disabled" : ""}>
                  ${isCompleted ? "✅ Completed" : "✅Completed"}
                </button>
                <button class="delete-btn" onclick="deleteOrder('${order.id}')">🗑️ Delete</button>
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

    const { error } = await adminSupabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

    if (error) throw error;

    content.innerHTML =
      '<div class="success">✅ All orders deleted successfully!</div>';
    document.getElementById("orderCount").textContent = "0";

    setTimeout(() => {
      loadOrders();
    }, 1500);
  } catch (error) {
    content.innerHTML = `<div class="error">❌ Error deleting orders: ${error.message}</div>`;
  }
}

async function deleteOrder(orderId) {
  if (!confirm("⚠️ Are you sure you want to delete this order?")) {
    return;
  }

  try {
    const { error } = await adminSupabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) throw error;

    showAdminMessage("✅ Order deleted successfully!", "success");
    setTimeout(() => {
      loadOrders();
    }, 1000);
  } catch (error) {
    showAdminMessage(`❌ Error deleting order: ${error.message}`, "error");
  }
}

async function markOrderCompleted(orderId) {
  try {
    const { error } = await adminSupabase
      .from("orders")
      .update({ status: "Completed" })
      .eq("id", orderId);

    if (error) throw error;

    showAdminMessage("✅ Order marked as completed!", "success");
    setTimeout(() => {
      loadOrders();
    }, 800);
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

// Load orders on page load - now handled in showDashboard() after login
// loadOrders();

// Test connection to Supabase
async function testConnection() {
  const content = document.getElementById("content");
  try {
    content.innerHTML =
      '<div class="loading">Testing Supabase connection...</div>';

    const { data, error } = await adminSupabase
      .from("orders")
      .select("id")
      .limit(1);

    if (error) {
      content.innerHTML = `<div class="error">❌ Connection Failed: ${error.message}</div>`;
      return;
    }

    content.innerHTML =
      '<div class="success">✅ Supabase connection successful! Database is working.</div>';
    setTimeout(() => {
      loadOrders();
    }, 2000);
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
