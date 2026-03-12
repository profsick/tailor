// Initialize items from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  loadExistingClothing();
  loadExistingFabrics();
  setupFileInputs();
});

function notifyItemsUpdated() {
  localStorage.setItem('tailorItemsVersion', String(Date.now()));
}

// Setup file input change handlers
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

// Load existing clothing items
function loadExistingClothing() {
  const clothing = getClothingFromStorage();
  const container = document.getElementById('clothingItems');
  
  if (clothing.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No clothing items yet</p>';
    return;
  }

  container.innerHTML = clothing.map((item, index) => `
    <div class="item-card">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-actions">
          <button class="delete-btn" onclick="deleteClothing(${index})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Load existing fabric items
function loadExistingFabrics() {
  const fabrics = getFabricsFromStorage();
  const container = document.getElementById('fabricItems');
  
  if (fabrics.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No fabric items yet</p>';
    return;
  }

  container.innerHTML = fabrics.map((item, index) => `
    <div class="item-card">
      <img src="${item.image}" alt="${item.name || 'Fabric'}">
      <div class="item-info">
        <div class="item-name">${item.name || 'Fabric ' + (index + 1)}</div>
        <div class="item-actions">
          <button class="delete-btn" onclick="deleteFabric(${index})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Get clothing from localStorage
function getClothingFromStorage() {
  try {
    const defaultClothing = [
      { name: 'Tuxedo', image: 'assets/tuxedo2.jpg' },
      { name: 'Trousers', image: 'assets/trousers.jpg' },
      { name: 'Suit', image: 'assets/suit.jpg' },
      { name: 'Shirt', image: 'assets/shirt.jpg' },
      { name: 'Sherwani', image: 'assets/sherwani.jpg' },
      { name: 'Thobe', image: 'assets/thobe.jpg' }
    ];
    
    const stored = localStorage.getItem('tailorClothing');
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with defaults on first load
      localStorage.setItem('tailorClothing', JSON.stringify(defaultClothing));
      return defaultClothing;
    }
  } catch (error) {
    console.error('Error loading clothing:', error);
    return [];
  }
}

// Get fabrics from localStorage
function getFabricsFromStorage() {
  try {
    const defaultFabrics = [
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' },
      { name: '', image: 'assets/fabric.jpg' }
    ];
    
    const stored = localStorage.getItem('tailorFabrics');
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with defaults on first load
      localStorage.setItem('tailorFabrics', JSON.stringify(defaultFabrics));
      return defaultFabrics;
    }
  } catch (error) {
    console.error('Error loading fabrics:', error);
    return [];
  }
}

// Upload new clothing item
function uploadClothing() {
  const name = document.getElementById('clothingName').value.trim();
  const imageFile = document.getElementById('clothingImage').files[0];
  const messageDiv = document.getElementById('clothingMessage');

  // Validation
  if (!name) {
    showMessage(messageDiv, 'Please enter a clothing name', 'error');
    return;
  }

  if (!imageFile) {
    showMessage(messageDiv, 'Please select an image', 'error');
    return;
  }

  // Convert image to base64
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const base64Image = e.target.result;
      const clothing = getClothingFromStorage();

      // Check for duplicate names
      if (clothing.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        showMessage(messageDiv, 'This clothing item already exists!', 'error');
        return;
      }

      // Add new item
      clothing.push({ name, image: base64Image });
      localStorage.setItem('tailorClothing', JSON.stringify(clothing));
      notifyItemsUpdated();

      // Reset form
      document.getElementById('clothingName').value = '';
      document.getElementById('clothingImage').value = '';
      document.getElementById('clothingFileName').textContent = '';
      document.getElementById('clothingPreview').style.display = 'none';

      showMessage(messageDiv, '✅ Clothing added successfully!', 'success');
      loadExistingClothing();
    } catch (error) {
      showMessage(messageDiv, 'Error uploading: ' + error.message, 'error');
    }
  };

  reader.readAsDataURL(imageFile);
}

// Upload new fabric item
function uploadFabric() {
  const name = document.getElementById('fabricName').value.trim();
  const imageFile = document.getElementById('fabricImage').files[0];
  const messageDiv = document.getElementById('fabricMessage');

  if (!imageFile) {
    showMessage(messageDiv, 'Please select an image', 'error');
    return;
  }

  // Convert image to base64
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const base64Image = e.target.result;
      const fabrics = getFabricsFromStorage();

      // Add new item
      fabrics.push({ 
        name: name || 'Fabric ' + (fabrics.length + 1), 
        image: base64Image 
      });
      localStorage.setItem('tailorFabrics', JSON.stringify(fabrics));
      notifyItemsUpdated();

      // Reset form
      document.getElementById('fabricName').value = '';
      document.getElementById('fabricImage').value = '';
      document.getElementById('fabricFileName').textContent = '';
      document.getElementById('fabricPreview').style.display = 'none';

      showMessage(messageDiv, '✅ Fabric added successfully!', 'success');
      loadExistingFabrics();
    } catch (error) {
      showMessage(messageDiv, 'Error uploading: ' + error.message, 'error');
    }
  };

  reader.readAsDataURL(imageFile);
}

// Delete clothing item
function deleteClothing(index) {
  if (confirm('Are you sure you want to delete this clothing item?')) {
    const clothing = getClothingFromStorage();
    clothing.splice(index, 1);
    localStorage.setItem('tailorClothing', JSON.stringify(clothing));
    notifyItemsUpdated();
    loadExistingClothing();
    document.getElementById('clothingMessage').innerHTML = '';
  }
}

// Delete fabric item
function deleteFabric(index) {
  if (confirm('Are you sure you want to delete this fabric item?')) {
    const fabrics = getFabricsFromStorage();
    fabrics.splice(index, 1);
    localStorage.setItem('tailorFabrics', JSON.stringify(fabrics));
    notifyItemsUpdated();
    loadExistingFabrics();
    document.getElementById('fabricMessage').innerHTML = '';
  }
}

// Show message helper
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
