const API_BASE = window.TAILOR_API_BASE || `${window.location.origin}/api`;
const catalogChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("tailor-catalog") : null;

function getAdminToken() {
  return sessionStorage.getItem("adminToken") || "";
}

function apiRequest(path, options = {}) {
  const token = getAdminToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  }).then(async (response) => {
    let payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.message || `Request failed with status ${response.status}`);
    }

    return payload;
  });
}

function broadcastCatalogUpdate() {
  if (catalogChannel) {
    catalogChannel.postMessage({ type: "catalog-updated" });
  }
}

function requireAdminSession() {
  if (!sessionStorage.getItem("adminToken")) {
    window.location.href = "admin.html";
    return false;
  }

  return true;
}

// Bootstraps the add-items page with catalog data from MongoDB.
window.addEventListener("DOMContentLoaded", async () => {
  if (!requireAdminSession()) {
    return;
  }

  loadExistingClothing();
  loadExistingFabrics();
  setupFileInputs();
});

// Wires file inputs so admins get an immediate preview before uploading.
function setupFileInputs() {
  document.getElementById('clothingImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('clothingFileName').textContent = file.name;
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = document.getElementById('clothingPreview');
        preview.src = event.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('fabricImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('fabricFileName').textContent = file.name;
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = document.getElementById('fabricPreview');
        preview.src = event.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

// Renders the current clothing catalog cards in the admin panel.
async function loadExistingClothing() {
  const container = document.getElementById('clothingItems');

  try {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Loading clothing items...</p>';
    const clothing = await apiRequest('/catalog?type=clothing');

    if (!Array.isArray(clothing) || clothing.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No clothing items yet</p>';
      return;
    }

    container.innerHTML = clothing.map((item) => `
      <div class="item-card">
        <img src="${item.image}" alt="${item.name}">
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-actions">
            <button class="delete-btn" onclick="deleteCatalogItem('${item.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #c00;">Error loading clothing: ${error.message}</p>`;
  }
}

// Renders the current fabric catalog cards in the admin panel.
async function loadExistingFabrics() {
  const container = document.getElementById('fabricItems');

  try {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Loading fabric items...</p>';
    const fabrics = await apiRequest('/catalog?type=fabric');

    if (!Array.isArray(fabrics) || fabrics.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No fabric items yet</p>';
      return;
    }

    container.innerHTML = fabrics.map((item, index) => `
      <div class="item-card">
        <img src="${item.image}" alt="${item.name || 'Fabric'}">
        <div class="item-info">
          <div class="item-name">${item.name || 'Fabric ' + (index + 1)}</div>
          <div class="item-actions">
            <button class="delete-btn" onclick="deleteCatalogItem('${item.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #c00;">Error loading fabrics: ${error.message}</p>`;
  }
}

// Validates and saves a newly uploaded clothing item into MongoDB.
function uploadClothing() {
  const name = document.getElementById('clothingName').value.trim();
  const imageFile = document.getElementById('clothingImage').files[0];
  const messageDiv = document.getElementById('clothingMessage');

  if (!name) {
    showMessage(messageDiv, 'Please enter a clothing name', 'error');
    return;
  }

  if (!imageFile) {
    showMessage(messageDiv, 'Please select an image', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const base64Image = e.target.result;
      await apiRequest('/catalog', {
        method: 'POST',
        body: JSON.stringify({
          type: 'clothing',
          name,
          image: base64Image,
        }),
      });

      document.getElementById('clothingName').value = '';
      document.getElementById('clothingImage').value = '';
      document.getElementById('clothingFileName').textContent = '';
      document.getElementById('clothingPreview').style.display = 'none';

      showMessage(messageDiv, '✅ Clothing added successfully!', 'success');
      await loadExistingClothing();
      broadcastCatalogUpdate();
    } catch (error) {
      showMessage(messageDiv, 'Error uploading: ' + error.message, 'error');
    }
  };

  reader.readAsDataURL(imageFile);
}

// Validates and saves a newly uploaded fabric item into MongoDB.
function uploadFabric() {
  const name = document.getElementById('fabricName').value.trim();
  const imageFile = document.getElementById('fabricImage').files[0];
  const messageDiv = document.getElementById('fabricMessage');

  if (!imageFile) {
    showMessage(messageDiv, 'Please select an image', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const base64Image = e.target.result;
      await apiRequest('/catalog', {
        method: 'POST',
        body: JSON.stringify({
          type: 'fabric',
          name,
          image: base64Image,
        }),
      });

      document.getElementById('fabricName').value = '';
      document.getElementById('fabricImage').value = '';
      document.getElementById('fabricFileName').textContent = '';
      document.getElementById('fabricPreview').style.display = 'none';

      showMessage(messageDiv, '✅ Fabric added successfully!', 'success');
      await loadExistingFabrics();
      broadcastCatalogUpdate();
    } catch (error) {
      showMessage(messageDiv, 'Error uploading: ' + error.message, 'error');
    }
  };

  reader.readAsDataURL(imageFile);
}

// Removes one catalog item from MongoDB after confirmation.
async function deleteCatalogItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }

  try {
    await apiRequest(`/catalog/${id}`, { method: 'DELETE' });
    await loadExistingClothing();
    await loadExistingFabrics();
    broadcastCatalogUpdate();
  } catch (error) {
    alert('Error deleting item: ' + error.message);
  }
}

// Displays inline success/error feedback under the relevant upload form.
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = 'message ' + type;
  
  if (type === 'success') {
    setTimeout(() => {
      element.className = 'message';
      element.textContent = '';
    }, 3000);
  }
}
