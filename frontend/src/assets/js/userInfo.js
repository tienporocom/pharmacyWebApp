document.addEventListener("DOMContentLoaded", () => {
  fetchUserProfile();
});

function fetchUserProfile() {
  fetch(`http://localhost:5000/api/users/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi token để xác thực
    },
  })
    .then((response) => response.json())
    .then((user) => {
      document.getElementById("avatar").src =
        user.avatar || "../assets/img/default_avata.png";
      document.getElementById("name").textContent = user.name;
      document.getElementById("phone").textContent = user.phone;
      document.getElementById("email").textContent = user.email;
      document.getElementById("sex").textContent =
        user.sex || "Chưa cập nhật";
      document.getElementById("dob").textContent = new Date(
        user.dOB
      ).toLocaleDateString("vi-VN");

      var QR_CODE = new QRCode("qrcode", {
        width: 220,
        height: 220,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });

      QR_CODE.makeCode("ID_TANTAM:"+user._id+"---N:"+user.name+"---P:"+user.phone); // Thay đổi ở đây, sử dụng user._id

    })
    .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
}



      //Load data tên người dùng, số điện thoại, email, giới tính, ngày sinh khi nhấn vào nút chỉnh sửa thông tin
      //Load data user profile
      function fetchUserProfileModal() {
        const profileModal = document.getElementById("editModal");

        const inputName = document.getElementById("edit-name");
        const inputPhone = document.getElementById("edit-phone");
        const inputEmail = document.getElementById("edit-email");

        inputName.setAttribute(
          "value",
          document.getElementById("name").textContent
        );
        inputPhone.setAttribute(
          "value",
          document.getElementById("phone").textContent
        );
        inputEmail.setAttribute(
          "value",
          document.getElementById("email").textContent
        );
        const dobText = document.getElementById("dob").textContent.trim();
        const parts = dobText.split("/");
        if (parts.length === 3) {
          const formattedDOB = `${parts[2]}-${parts[1]}-${parts[0]}`; // Chuyển thành YYYY-MM-DD
          document.getElementById("edit-dob").value = formattedDOB;
        }

        const inputSex = document.getElementById("edit-sex");
        inputSex.value = document.getElementById("sex").textContent.trim();
      }

      document.addEventListener("DOMContentLoaded", () => {
        const profileModal = document.getElementById("editModal");
        const addressModal = document.getElementById("addressModal");
        const closeProfileModal = document.querySelector(".close");
        const closeAddressModal = document.querySelector(".close-address");
        const editProfileBtn = document.getElementById("edit-profile");
        const editAddressBtn = document.getElementById("edit-address");
        const addNewAddressBtn = document.getElementById("add-address");
        const saveAddressBtn = document.querySelector(".btn.save");

        // Kiểm tra xem các phần tử có tồn tại không trước khi thêm sự kiện
        if (editProfileBtn && profileModal) {
          editProfileBtn.addEventListener("click", () => {
            profileModal.style.display = "flex";
            fetchUserProfileModal();
          });
        }

        if (editAddressBtn && addressModal) {
          editAddressBtn.addEventListener("click", () => {
            addressModal.style.display = "flex";

            fetchAddressModal();
            
          });
        }

        if (closeProfileModal && profileModal) {
          closeProfileModal.addEventListener("click", () => {
            profileModal.style.display = "none";
          });
        }

        if (closeAddressModal && addressModal) {
          closeAddressModal.addEventListener("click", () => {
            addressModal.style.display = "none";
          });
        }

        if (addNewAddressBtn) {
          addNewAddressBtn.addEventListener("click", () => {
            addAddressToTable();
          });
        }

        if (saveAddressBtn) {
          saveAddressBtn.addEventListener("click", () => {
            sendAddressToServer();
          });
        }

        // Đóng modal khi click ra ngoài
        window.addEventListener("click", (event) => {
          if (profileModal && event.target === profileModal) {
            profileModal.style.display = "none";
          }
          if (addressModal && event.target === addressModal) {
            addressModal.style.display = "none";
          }
        });
        // Xử lý gửi form chỉnh sửa thông tin
        const editForm = document.getElementById("edit-form");
        if (editForm) {
          editForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const newProfile = {
              name: document.getElementById("edit-name").value.trim(),
              phone: document.getElementById("edit-phone").value.trim(),
              email: document.getElementById("edit-email").value.trim(),
              sex: document.getElementById("edit-sex").value,
              dOB: document.getElementById("edit-dob").value, // Ngày sinh đã ở dạng YYYY-MM-DD
            };

            fetch("http://localhost:5000/api/users/profile", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(newProfile),
            })
              .then((response) => response.json())
              .then((data) => {
                alert("Cập nhật thông tin thành công!");
                document.getElementById("editModal").style.display = "none";
                fetchUserProfile(); // Cập nhật lại giao diện với dữ liệu mới
              })
              .catch((error) => {
                console.error("Lỗi khi cập nhật thông tin:", error);
                alert("Có lỗi xảy ra, vui lòng thử lại!");
              });
          });
        }

        

        //load địa chỉ lên bảng trong modal
        function fetchAddressModal() {
            const addressItems = document.getElementById("address-items");

            fetch(`http://localhost:5000/api/users/address`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi token để xác thực
              },
            })
              .then((response) => response.json())
              .then((address) => {
                // Xoá các dòng trước khi thêm dòng mới
                addressItems.innerHTML = ""; // Xoá các dòng trước khi thêm dòng mới
                
                for (let i = 0; i < address.length; i++) {
                  const tr = document.createElement("tr");
                  tr.innerHTML = `
                    <td>${address[i].address}</td>
                    <td>${address[i].phoneToDelivery}</td>
                    <td>${address[i].default ? "✅" : ""}</td>
                    <td>
                      <button class="btn-edit">Sửa</button>
                      <button class="btn-delete">Xóa</button>
                  `;
                  addressItems.appendChild(tr);
                }
                editAddress();
                  deleteAddress();
              })
              .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));

        }
        function addAddressToTable() {
            const addressT = {
              address: document.getElementById("edit-address-inp").value,
              phoneToDelivery: document.getElementById("edit-phoneToDelivery").value,
              default: document.getElementById("edit-default-address").checked,
            };
            const addressItems = document.getElementById("address-items");
            const tr = document.createElement("tr");
            console.log(addressT);
            tr.innerHTML = `
              <td>${addressT.address}</td>
              <td>${addressT.phoneToDelivery}</td>
              <td>${addressT.default ? "✅" : ""}</td>
              <td>
                <button class="btn-edit">Sửa</button>
                <button class="btn-delete">Xóa</button>
                </td>
            `;
            //Xoá các dòng trước khi thêm dòng mới
           
            addressItems.appendChild(tr);

            if (addressT.default) {
              const rows = addressItems.querySelectorAll("tr");
              rows.forEach((row) => {
                row.querySelector("td:nth-child(3)").textContent = "";
              });
              tr.querySelector("td:nth-child(3)").textContent = "✅";
            }
            //xoá các ô nhập

            document.getElementById("edit-address-inp").value = "";
            document.getElementById("edit-phoneToDelivery").value = ""; 

            editAddress();
            deleteAddress();
          }

        });

        //xử lý khi nhấn vào nút chỉnh sửa địa chỉ
        function editAddress() {
          const editButtons = document.querySelectorAll(".btn-edit");
          editButtons.forEach((button) => {
            button.addEventListener("click", () => {
                console.log("edit");
              const tr = button.parentElement.parentElement;
              const address = tr.querySelector("td").textContent;
              const phoneToDelivery = tr.querySelector("td:nth-child(2)").textContent;
              const isDefault = tr.querySelector("td:nth-child(3)").textContent === "✅";
              document.getElementById("edit-address-inp").value = address;
              document.getElementById("edit-phoneToDelivery").value = phoneToDelivery;
              document.getElementById("edit-default-address").checked = isDefault;
              tr.remove();
            });
          });

        }

        //xử lý khi nhấn vào nút xóa địa chỉ
        function deleteAddress() {
          const deleteButtons = document.querySelectorAll(".btn-delete");
          deleteButtons.forEach((button) => {
            button.addEventListener("click", () => {
              const tr = button.parentElement.parentElement;
              tr.remove();
            });
          });
        }

        //gọi API để gửi dữ liệu trên bảng lên server

        function sendAddressToServer() {
          const addressItems = document.getElementById("address-items");
          const rows = addressItems.querySelectorAll("tr");
          const addresses = [];
          rows.forEach((row) => {
            const address = row.querySelector("td").textContent;
            const phoneToDelivery = row.querySelector("td:nth-child(2)").textContent;
            const isDefault = row.querySelector("td:nth-child(3)").textContent === "✅";

            console.log(address, phoneToDelivery, isDefault);
            addresses.push({
              address,
              phoneToDelivery,
              default: isDefault,
            });
          });

          console.log(JSON.stringify(addresses));


          fetch("http://localhost:5000/api/users/address/", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(addresses),
          })
            .then((response) => response.json())
            .then((data) => {
              alert("Cập nhật địa chỉ thành công!");
              //xoá các dong trong bảng
                rows.forEach((row) => {
                    row.remove();
                    });
                document.getElementById("addressModal").style.display = "none";
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật địa chỉ:", error);
              alert("Có lỗi xảy ra, vui lòng thử lại!");
            });
        }

              
    