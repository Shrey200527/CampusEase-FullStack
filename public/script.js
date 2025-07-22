// script.js - External JavaScript

// -----------------------------
// Scroll-to-top on logo click
// -----------------------------
const logo = document.querySelector(".logo");
if (logo) {
  logo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// -----------------------------
// Button click animation
// -----------------------------
const buttons = document.querySelectorAll(".cta-button");
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("clicked");
    setTimeout(() => btn.classList.remove("clicked"), 300);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const category = document.body.dataset.category?.toLowerCase();
  const container = document.getElementById("listings-container");
  const searchInput = document.getElementById("search-input");
  const suggestionBox = document.getElementById("search-suggestions");

  let listingsCache = [];
  let currentFilter = "";
  let currentSearch = "";

  function applyFilter(data) {
    if (currentFilter === "price-low") {
      return data.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (currentFilter === "price-high") {
      return data.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (currentFilter === "delivery-fast") {
      return data.sort((a, b) => a.deliveryTime - b.deliveryTime);
    }
    return data;
  }

  function renderListings(data) {
    container.innerHTML = "";
    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "flat-card";
      const uniqueInputId = `input-${item.id}`;
      const isRent = item.mode.toLowerCase() === "rent";

      card.innerHTML = `
        <div class="flat-image">
          <img src="${item.images[0]}" alt="${item.name}" height="400" width="400" onerror="this.src='/images/placeholder.jpg'">
        </div>
        <div class="flat-details">
          <h2 class="flat-title"><strong>${item.name}</strong></h2>
          <p class="flat-society">${item.provider}</p>
          <div class="flat-info-grid">
            <div><strong>Category:</strong><br>${item.category}</div>
            <div><strong>Delivery Time:</strong><br>${item.deliveryTime} Days</div>
            <div><strong>Mode:</strong><br>${item.mode}</div>
            <div><strong>Location:</strong><br>${item.location}</div>
          </div>
          <p class="flat-description">
            A high-quality ${item.name} perfect for college events and spaces.
          </p>
          <div class="quantity-section my-2">
            <label>${isRent ? "Days:" : "Qty:"}</label>
            <input type="number" min="1" value="1" id="${uniqueInputId}" class="form-control" style="max-width: 80px; display: inline-block;">
          </div>
          <div class="flat-footer mt-2">
            <div class="flat-price">₹${item.pricePerDay} ${isRent ? "per day" : ""}</div>
            <div class="flat-buttons">
              <button class="buy-now-btn btn btn-danger">Buy Now</button>
              <button class="add-cart-btn btn btn-secondary">Add to Cart</button>
            </div>
          </div>
        </div>
      `;

      container.appendChild(card);

      const inputField = card.querySelector(`#${uniqueInputId}`);

      card.querySelector(".add-cart-btn").addEventListener("click", () => {
        const value = parseInt(inputField.value) || 1;
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        cart.push({
          ...item,
          quantity: isRent ? 1 : value,
          days: isRent ? value : 0
        });

        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Added to cart!");
      });

      card.querySelector(".buy-now-btn").addEventListener("click", () => {
        const value = parseInt(inputField.value) || 1;
        const order = [{
          ...item,
          quantity: isRent ? 1 : value,
          days: isRent ? value : 0
        }];

        localStorage.setItem("checkout", JSON.stringify(order));
        window.location.href = "checkout.html";
      });
    });
  }

  function loadListings() {
    fetch(`/api/listings?category=${category}`)
      .then(res => res.json())
      .then(data => {
        listingsCache = data;
        let filteredData = applyFilter(data);

        if (currentSearch) {
          filteredData = filteredData.filter(item =>
            item.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(currentSearch.toLowerCase()))
          );
        }

        renderListings(filteredData);
      });
  }

  document.querySelectorAll(".filter-option").forEach(option => {
    option.addEventListener("click", (e) => {
      currentFilter = e.target.dataset.filter;
      loadListings();
    });
  });

  if (searchInput && suggestionBox) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      suggestionBox.innerHTML = "";

      if (!query) {
        currentSearch = "";
        loadListings();
        return;
      }

      const matches = listingsCache.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.keywords.some(k => k.toLowerCase().includes(query))
      );

      matches.slice(0, 5).forEach(match => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.textContent = match.name;
        li.addEventListener("click", () => {
          currentSearch = match.name;
          searchInput.value = match.name;
          suggestionBox.innerHTML = "";
          loadListings();
        });
        suggestionBox.appendChild(li);
      });
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        currentSearch = searchInput.value;
        suggestionBox.innerHTML = "";
        loadListings();
      }
    });
  }

  loadListings();
  setInterval(loadListings, 5000);
});
