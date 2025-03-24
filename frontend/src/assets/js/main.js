function setupUserAccount() {
    // Tải các file HTML được chỉ định trong [data-include]
    let includes = document.querySelectorAll("[data-include]");
    let promises = [];

    includes.forEach(element => {
        let file = element.getAttribute("data-include");
        let promise = fetch(file)
            .then(response => response.text())
            .then(data => {
                element.innerHTML = data;
            })
            .catch(error => console.error("Lỗi khi tải file:", file, error));

        promises.push(promise);
    });

    // Khi tất cả nội dung đã được tải xong, gọi hàm xử lý tài khoản
    Promise.all(promises).then(() => {
        initializeUser();
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

  
