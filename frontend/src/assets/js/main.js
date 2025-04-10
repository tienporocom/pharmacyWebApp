function setupUserAccount() {
  // Tải các file HTML được chỉ định trong [data-include]
  let includes = document.querySelectorAll("[data-include]");
  let promises = [];

  includes.forEach((element) => {
    let file = element.getAttribute("data-include");
    let promise = fetch(file)
      .then((response) => response.text())
      .then((data) => {
        element.innerHTML = data;
      })
      .catch((error) => console.error("Lỗi khi tải file:", file, error));

    promises.push(promise);
  });

  // Khi tất cả nội dung đã được tải xong, gọi hàm xử lý tài khoản
  Promise.all(promises).then(() => {
    initializeUser();
    loadCartInfoFromAPIToHeader(); // Gọi hàm tải thông tin giỏ hàng từ API
    scrollToTop(); // Gọi hàm cuộn lên đầu trang
  });
}

// Hàm xử lý thông tin đăng nhập
function initializeUser() {
  const isLogged = localStorage.getItem("user");
  if (!isLogged) {
    console.log("Chưa có thông tin đăng nhập.");
    return;
  }

  try {
    const user = JSON.parse(isLogged);

    // Kiểm tra các phần tử có tồn tại trước khi gán dữ liệu
    const loginBtn = document.getElementById("login-btn");
    const userInfo = document.getElementById("user-info");
    const accountLink = document.getElementById("account-link");
    const userName = document.getElementById("user-name");
    const userAvatar = document.getElementById("user-avatar");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const logoutBtn = document.getElementById("logout-btn");

    if (!userName || !userAvatar || !loginBtn || !userInfo) {
      console.error("Phần tử HTML không tồn tại.");
      return;
    }

    // Hiển thị thông tin user
    userName.textContent = user.name;
    userAvatar.src = user.avatar || "../assets/img/default_avata.png";

    // Ẩn nút đăng nhập, hiển thị thông tin người dùng
    loginBtn.style.display = "none";
    userInfo.style.display = "block";

    // Xử lý hover menu
    let hideTimeout;
    if (accountLink && dropdownMenu) {
      accountLink.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
        dropdownMenu.style.display = "block";
      });

      dropdownMenu.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
      });

      accountLink.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
          dropdownMenu.style.display = "none";
        }, 300);
      });

      dropdownMenu.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
          dropdownMenu.style.display = "none";
        }, 300);
      });
    }

    // Xử lý đăng xuất
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
      });
    }
  } catch (error) {
    console.error("Lỗi khi parse JSON user:", error);
  }
}

// Gọi function sau khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", setupUserAccount);

//sự kiện back to top
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

//hàm tìm kiếm sản phẩm
function searchProducts() {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  console.log("Tìm kiếm sản phẩm");
  if (searchInput && searchButton) {
    const keyword = searchInput.value.trim();
    if (keyword) {
      // Lưu từ khóa tìm kiếm vào localStorage
      localStorage.setItem("searchKeyword", keyword);
      // Chuyển hướng đến trang tìm kiếm
      window.location.href = `search.html?keyword=${encodeURIComponent(
        keyword
      )}`;
    } else {
      alert("Vui lòng nhập từ khóa tìm kiếm.");
    }
  }
}

async function loadCartInfoFromAPIToHeader() {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const requestHeader = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const host = "http://localhost:5000";
    
    if (!user || !token) {
        console.error("User or token not found in localStorage.");
        return;
    }
    
    try {
        const response = await fetch(`${host}/api/cart/info`, {
            method: "GET",
            headers: requestHeader,
        });
    
        const data = await response.json();
        let totalItems = 0;

        // Calculate total items in cart
        data.orderItems.forEach(orderItem => {
            orderItem.items.forEach(item => {
                totalItems += item.quantity;
            });
        });

        // Update cart count
        const cartCount = document.getElementById("cart-count");
        if (cartCount) {
            cartCount.textContent = totalItems;
        }

        // Update cart items list
        const cartItemsUl = document.getElementById("cart-items");
        if (cartItemsUl) {
            cartItemsUl.innerHTML = ""; // Clear existing items
            
            data.orderItems.forEach((orderItem) => {
                orderItem.items.forEach((item) => {
                    // Create list item
                    const li = document.createElement("li");
                    li.className = "cart-item";
                    li.dataset.id = item._id; // Store item ID for deletion
                    
                    // Create item container
                    const itemDiv = document.createElement("div");
                    itemDiv.className = "cart-item-container";
                    
                    // Create image element
                    const imgDiv = document.createElement("div");
                    imgDiv.className = "cart-item-image";
                    const img = document.createElement("img");
                    img.src = orderItem.product.images || "../assets/img/default_product.png";
                    img.alt = orderItem.product.name;
                    imgDiv.appendChild(img);
                    
                    // Create product info container
                    const infoDiv = document.createElement("div");
                    infoDiv.className = "cart-item-info";
                    
                    // Create product name (shortened if too long)
                    const productName = document.createElement("div");
                    productName.className = "cart-product-name";
                    const nameText = orderItem.product.name;
                    productName.textContent = nameText;
                    
                    // Create product price and quantity
                    const priceQuantity = document.createElement("div");
                    priceQuantity.className = "cart-price-quantity";
                    
                    // Format price with VND currency
                    const formattedPrice = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(item.price);
                    
                    priceQuantity.textContent = `${formattedPrice} x${item.quantity} ${item.unitName}`;
                    
                    // Create delete button
                    const deleteBtn = document.createElement("button");
deleteBtn.className = "cart-delete-btn";
deleteBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
    </svg>
`;
deleteBtn.onclick = function() {
    deleteRow(this);
};
                    
                    // Append elements
                    infoDiv.appendChild(productName);
                    infoDiv.appendChild(priceQuantity);
                    itemDiv.appendChild(imgDiv);
                    itemDiv.appendChild(infoDiv);
                    itemDiv.appendChild(deleteBtn);
                    li.appendChild(itemDiv);
                    cartItemsUl.appendChild(li);
                });
            });

            // Add total amount
            const totalDiv = document.createElement("div");
            totalDiv.className = "cart-total";
            
            const formattedTotal = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(data.totalAmount);
            
            totalDiv.textContent = `Tổng: ${formattedTotal}`;
            cartItemsUl.appendChild(totalDiv);
        }

        console.log("Số lượng sản phẩm trong giỏ hàng:", totalItems);
        console.log("Giỏ hàng:", data);
    } catch (error) {
        console.error("Error loading cart info:", error);
    }
}

// Delete item function
function deleteRow(button) {
    const itemElement = button.closest(".cart-item");
    const itemId = itemElement.dataset.id;
    
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
        return;
    }

    fetch(`http://localhost:5000/api/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to delete item");
        
        // Remove item from UI
        itemElement.remove();
        
        // Update cart count
        const cartItems = document.querySelectorAll(".cart-item");
        const cartCount = document.getElementById("cart-count");
        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }
        
       
        // Update total amount
        const totalDiv = document.querySelector(".cart-total");
        if (totalDiv) {
            const totalAmount = Array.from(cartItems).reduce((sum, item) => {
                const priceQuantity = item.querySelector(".cart-price-quantity").textContent;
                const price = parseFloat(priceQuantity.split(" x")[0].replace(/[^0-9.-]+/g,""));
                const quantity = parseInt(priceQuantity.split(" x")[1]);
                return sum + (price * quantity);
            }, 0);
            
            const formattedTotal = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(totalAmount);
            
            totalDiv.textContent = `Tổng: ${formattedTotal}`;
        }
    })
    .catch(err => {
        console.error("Error deleting item:", err);
        alert("Có lỗi xảy ra khi xóa sản phẩm");
    });
}