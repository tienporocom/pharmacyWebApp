// Biến toàn cục
let medicines = [];
let prescriptions = [];
let customers = [];
let totalMedicines = 0;

//Load dữ liệu từ API
const loadData = async () => {
  
  try {
    // Hiển thị modal mờ với logo và nội dung
    const loadingModal = document.createElement("div");
    loadingModal.className = "loading-modal";
    loadingModal.innerHTML = `
      <div class="loading-content">
        <img src="../assets/img/logo.png" alt="Logo" class="loading-logo" />
        <p class="loading-text">Đang xác thực...</p>
      </div>
      <style>
        .loading-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .loading-content {
          text-align: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .loading-logo {
          width: 100px;
          height: 100px;
          margin-bottom: 20px;
        }
        .loading-text {
          margin-top: 10px;
          font-size: 18px;
        }
      </style>
    `;
    document.body.appendChild(loadingModal);
    //sau khi xác thực xong thì đổi sang loading thành "Đang tải dữ liệu..."
    await new Promise((resolve) => setTimeout(resolve, 500));
    loadingModal.querySelector(".loading-text").innerText = "Đang tải dữ liệu...";


    
    const responseOrder = await fetch("http://localhost:5000/api/orders/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const responseTotalProduct = await fetch(
      "http://localhost:5000/api/products/total"
    );
    const responseProduct = await fetch("http://localhost:5000/api/products/");
    const responseCustomer = await fetch(
      "http://localhost:5000/api/users/all",
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (!responseOrder.ok || !responseProduct.ok || !responseCustomer.ok) {
      // Hiện cửa sổ thông báo Không có quyền truy cập
      alert("Không có quyền truy cập vào dữ liệu này.");
      throw new Error("Failed to fetch data");
    }

    const responseTotal = await responseTotalProduct.json();
    const orders = await responseOrder.json();
    const products = await responseProduct.json();
    const user = await responseCustomer.json();
    // Cập nhật dữ liệu vào biến toàn cục
    totalMedicines = responseTotal.total;
    medicines = products;
    prescriptions = orders;
    customers = user;
    // Cập nhật bảng
    updateTables();
    updateOverview();
    const adminNamefield = document.querySelector(".adminName");
    adminNamefield.innerText =
      "Admin:" + JSON.parse(localStorage.getItem("user"))?.name;

    

    
      document.body.removeChild(loadingModal);
  } catch (error) {
    
    console.error("Error loading data:", error);
  }
};

// Gọi hàm loadData khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

let posts = [
  {
    id: "B001",
    title: "Bài viết 1",
    content: "Nội dung bài viết 1",
    date: "2025-04-06",
  },
  {
    id: "B002",
    title: "Bài viết 2",
    content: "Nội dung bài viết 2",
    date: "2025-04-07",
  },
];

let selectedMedicineId = null;
let selectedPrescriptionId = null;
let selectedCustomerId = null;
let selectedPostId = null;

// Hiển thị section
function showSection(sectionId) {
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
    section.style.display = "none";
  });
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.add("active");
    selectedSection.style.display = "block";
  }
  document.querySelectorAll(".nav-menu li").forEach((item) => {
    item.classList.remove("active");
  });
  const selectedMenuItem = document.getElementById(`nav-${sectionId}`);
  if (selectedMenuItem) {
    selectedMenuItem.classList.add("active");
  }
  updateTables();
  if (sectionId === "overview") {
    updateOverview();
  }
}

// Cập nhật tổng quan
function updateOverview() {
  console.log("loading overview");
  const today = "2025-04-07";
  document.getElementById("totalMedicines").innerText = totalMedicines;
  document.getElementById("totalPrescriptions").innerText =
    prescriptions.length;
  document.getElementById("totalCustomers").innerText = customers.length;
  document.getElementById("totalPosts").innerText = posts.length;

  const todayRevenue = prescriptions
    .filter((p) => p.createdAt === today && p.status === "delivered")
    .reduce((sum, p) => sum + p.totalAmount, 0);
  document.getElementById("todayRevenue").innerText =
    todayRevenue.toLocaleString("vi-VN") + " VNĐ";

  const pendingPrescriptions = prescriptions.filter(
    (p) => p.status === "pending" || p.status === "processing"
  ).length;
  document.getElementById("pendingPrescriptions").innerText =
    pendingPrescriptions;

  const lowStockMedicines = medicines.filter(
    (m) => m.packagingUnits[0].quantity < 10
  ).length;
  document.getElementById("lowStockMedicines").innerText = lowStockMedicines;

  const newCustomersToday = customers.filter(
    (c) => c.joinDate === today
  ).length;
  document.getElementById("newCustomersToday").innerText = newCustomersToday;
}

// Đóng modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// **Quản lý thuốc**
function updateMedicineTable() {
  const tableBody = document
    .getElementById("medicineTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";
  medicines.forEach((medicine) => {
    const row = document.createElement("tr");
    const isPrescribe = medicine.isPrescribe ? "Có" : "Không";
    row.innerHTML = `
                    <td>${medicine.iD}</td>
                    <td>${medicine.name}</td>
                    <td>${isPrescribe}</td>
                    <td>${medicine.packaging} VNĐ</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewMedicine('${medicine.iD}')">Xem</button>
                        <button class="edit-btn" onclick="editMedicine('${medicine.iD}')">Sửa</button>
                        <button class="delete-btn" onclick="deleteM
                        edicineModal('${medicine.iD}')">Xóa</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function openAddMedicineModal() {
  document.getElementById("medicineAddModal").style.display = "flex";
}

function addMedicine() {
  const name = document.getElementById("medicineAddName").value;
  const description = document.getElementById("medicineAddDescription").value;
  const shortDescription = document.getElementById("medicineAddShortDescription").value;
  const images = document.getElementById("medicineAddImages").value;
  const isPrescribe = document.getElementById("medicineAddIsPrescribe").value === "true";
  const drugGroup = document.getElementById("medicineAddDrugGroup").value;
  const manufacturer = document.getElementById("medicineAddManufacturer").value;
  const manufacturerOrigin = document.getElementById("medicineAddManufacturerOrigin").value;
  const registrationNumber = document.getElementById("medicineAddRegistrationNumber").value;
  const ingredient = document.getElementById("medicineAddIngredient").value;
  const placeOfManufacture = document.getElementById("medicineAddPlaceOfManufacture").value;
  const dosageForm = document.getElementById("medicineAddDosageForm").value;
  const packaging = document.getElementById("medicineAddPackaging").value;
  const packagingUnits = [];
  const unitNames = document.querySelectorAll(".unitName");
  const quantities = document.querySelectorAll(".quantity");
  const prices = document.querySelectorAll(".price");

  unitNames.forEach((unitNameElement, index) => {
    const unitName = unitNameElement.value;
    const quantity = parseInt(quantities[index].value);
    const price = parseInt(prices[index].value);
    packagingUnits.push({
      unitName,
      quantity,
      price,
    });
  });
  const sales = parseInt(document.getElementById("medicineAddSales").value);

  //xử lý lấy id = max id + 1
  let maxId = 0;
  medicines.forEach((medicine) => {
    const id = parseInt(medicine.iD.substring(1)); // Lấy phần số của ID
    if (id > maxId) {
      maxId = id;
    }
  });
  const id = (maxId + 1).toString().padStart(8, "0"); // Tạo ID mới

  const newMedicine = {
    iD: id,
    name: name,
    description: description,
    shortDescription: shortDescription,
    images: images,
    isPrescribe: isPrescribe,
    drugGroup: drugGroup,
    manufacturer: manufacturer,
    manufacturerOrigin: manufacturerOrigin,
    registrationNumber: registrationNumber,
    ingredient: ingredient,
    placeOfManufacture: placeOfManufacture,
    dosageForm: dosageForm,
    packaging: packaging,
    packagingUnits: packagingUnits,
    sales: sales,
  };
  console.log(newMedicine);

  medicines.push(newMedicine);

  // Gửi yêu cầu POST đến API để thêm sản phẩm mới
  fetch("http://localhost:5000/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(newMedicine),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to add medicine");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Medicine added:", data);
      alert("Thêm thuốc thành công!");
    })

  closeModal("medicineAddModal");
  updateMedicineTable();
  updateOverview();
}

function viewMedicine(id) {
  const medicine = medicines.find((m) => m.iD === id);
  const categories = medicine.packagingUnits
    .map(
      (unit) =>
        `<tr><td>${unit.unitName}</td><td>${unit.quantity}</td> <td> ${unit.price.toLocaleString(
          "vi-VN"
        )} VNĐ</td></tr>`
    )
    .join("");
    document.getElementById("medicineViewContent").innerHTML = `
      <div class="medicine-info">
        <div class="info-item">
          <span class="info-label">ID:</span>
          <span class="info-value">${medicine.iD}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tên:</span>
          <span class="info-value">${medicine.name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mô tả:</span>
          <span class="info-value">${medicine.shortDescription || "Không có"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Kê đơn:</span>
          <span class="info-value">${medicine.isPrescribe ? "Có" : "Không"}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nước sản xuất:</span>
          <span class="info-value">${medicine.manufacturer || "Không có"}</span>
        </div>
        

      <div class="medicine-categories">
        <h3>Phân loại</h3>
        <table class="medicine-table">
          <thead>
            <tr>
              <th>Tên phân loại</th>
              <th>Số lượng</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            ${categories}
          </tbody>
        </table>
      </div>
      <style>
        .medicine-info {
          margin-bottom: 20px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
        }
        .medicine-table {
          width: 100%;
          border-collapse: collapse;
        }
        .medicine-table th, .medicine-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .medicine-table th {
          background-color: #ccc;
          color: #333;
          font-weight: bold;
        }
      </style>
    `;
  
  document.getElementById("medicineViewModal").style.display = "flex";
}

function editMedicine(id) {
  selectedMedicineId = id;
  const medicine = medicines.find((m) => m.iD === id);
  document.getElementById("medicineEditId").value = medicine.iD;
  document.getElementById("medicineEditName").value = medicine.name;
  document.getElementById("medicineEditDescription").value = medicine.description;
  document.getElementById("medicineEditShortDescription").value = medicine.shortDescription;
  document.getElementById("medicineEditImages").value = medicine.images;
  document.getElementById("medicineEditIsPrescribe").value = medicine.isPrescribe.toString();
  document.getElementById("medicineEditDrugGroup").value = medicine.drugGroup;
  document.getElementById("medicineEditManufacturer").value = medicine.manufacturer;
  document.getElementById("medicineEditManufacturerOrigin").value = medicine.manufacturerOrigin;
  document.getElementById("medicineEditRegistrationNumber").value = medicine.registrationNumber;
  document.getElementById("medicineEditIngredient").value = medicine.ingredient;
  document.getElementById("medicineEditPlaceOfManufacture").value = medicine.placeOfManufacture;
  document.getElementById("medicineEditDosageForm").value = medicine.dosageForm;
  document.getElementById("medicineEditPackaging").value = medicine.packaging;
  document.getElementById("medicineEditSales").value = medicine.sales;

  const tableBody = document.getElementById("editPackagingUnitsTableBody");
  tableBody.innerHTML = "";
  medicine.packagingUnits.forEach((unit) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="text" class="unitName" value="${unit.unitName}" placeholder="Tên đơn vị" /></td>
      <td><input type="number" class="quantity" value="${unit.quantity}" placeholder="Số lượng" /></td>
      <td><input type="number" class="price" value="${unit.price}" placeholder="Giá" /></td>
      <td><button onclick="removeRow(this)">Xóa</button></td>
    `;
    tableBody.appendChild(row);
  });

  document.getElementById("medicineEditModal").style.display = "flex";
}

function saveMedicine() {
  const name = document.getElementById("medicineEditName").value;
  const description = document.getElementById("medicineEditDescription").value;
  const shortDescription = document.getElementById("medicineEditShortDescription").value;
  const images = document.getElementById("medicineEditImages").value;
  const isPrescribe = document.getElementById("medicineEditIsPrescribe").value === "true";
  const drugGroup = document.getElementById("medicineEditDrugGroup").value;
  const manufacturer = document.getElementById("medicineEditManufacturer").value;
  const manufacturerOrigin = document.getElementById("medicineEditManufacturerOrigin").value;
  const registrationNumber = document.getElementById("medicineEditRegistrationNumber").value;
  const ingredient = document.getElementById("medicineEditIngredient").value;
  const placeOfManufacture = document.getElementById("medicineEditPlaceOfManufacture").value;
  const dosageForm = document.getElementById("medicineEditDosageForm").value;
  const packaging = document.getElementById("medicineEditPackaging").value;
  const packagingUnits = [];
  const unitNames = document.querySelectorAll("#editPackagingUnitsTableBody .unitName");
  const quantities = document.querySelectorAll("#editPackagingUnitsTableBody .quantity");
  const prices = document.querySelectorAll("#editPackagingUnitsTableBody .price");

  unitNames.forEach((unitNameElement, index) => {
    const unitName = unitNameElement.value;
    const quantity = parseInt(quantities[index].value);
    const price = parseInt(prices[index].value);
    packagingUnits.push({
      unitName,
      quantity,
      price,
    });
  });
  const sales = parseInt(document.getElementById("medicineEditSales").value);

  const medicine = medicines.find((m) => m.iD === selectedMedicineId);
  medicine.name = name;
  medicine.description = description;
  medicine.shortDescription = shortDescription;
  medicine.images = images;
  medicine.isPrescribe = isPrescribe;
  medicine.drugGroup = drugGroup;
  medicine.manufacturer = manufacturer;
  medicine.manufacturerOrigin = manufacturerOrigin;
  medicine.registrationNumber = registrationNumber;
  medicine.ingredient = ingredient;
  medicine.placeOfManufacture = placeOfManufacture;
  medicine.dosageForm = dosageForm;
  medicine.packaging = packaging;
  medicine.packagingUnits = packagingUnits;
  medicine.sales = sales;

  // Gửi yêu cầu PUT đến API để cập nhật thuốc
  fetch(`http://localhost:5000/api/products/${medicine._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(medicine),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update medicine");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Medicine updated:", data);
      alert("Cập nhật thuốc thành công!");
    })
    .catch((error) => {
      console.error("Error updating medicine:", error);
      alert("Có lỗi xảy ra khi cập nhật thuốc.");
    });

  closeModal("medicineEditModal");
  updateMedicineTable();
  updateOverview();
}

function deleteMedicineModal(id) {
  selectedMedicineId = id;
  document.getElementById("medicineDeleteModal").style.display = "flex";
}

function deleteMedicine() {
  const medicine = medicines.find((m) => m.iD === selectedMedicineId);
  const _id = medicine._id;
  medicines = medicines.filter((m) => m.iD !== selectedMedicineId);

  //gửi delete request đến api /api/products/:id
  fetch(`http://localhost:5000/api/products/${_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete medicine");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Medicine deleted:", data);
      alert("Xóa thuốc thành công!");
    })
    .catch((error) => {
      console.error("Error deleting medicine:", error);
    });
  selectedMedicineId = null;
  closeModal("medicineDeleteModal");
  updateMedicineTable();
  updateOverview();
}

// **Đơn thuốc**
function updatePrescriptionTable() {
  const tableBody = document
    .getElementById("prescriptionTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";
  prescriptions.forEach((prescription) => {
    const row = document.createElement("tr");

    //chuyển status sang tiếng việt
    let status = prescription.status;
    switch (status) {
      case "new":
        status = "Mới";
        break;
      case "pending":
        status = "Chờ xử lý";
        break;
      case "processing":
        status = "Đang xử lý";
        break;
      case "shipped":
        status = "Đã giao hàng";
        break;
      case "delivered":
        status = "Đã giao";
        break;
      case "cancelled":
        status = "Đã hủy";
        break;
      default:
        status = "Không xác định";
    }
    row.innerHTML = `
                    <td>${prescription._id}</td>
                    <td>${prescription.user.name}</td>
                    <td>${prescription.totalAmount.toLocaleString(
                      "vi-VN"
                    )} VNĐ</td>
                    <td>${status}</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewPrescription('${
                          prescription._id
                        }')">Xem</button>
                        <button class="edit-btn" onclick="editPrescription('${
                          prescription._id
                        }')">Sửa</button>
                        <button class="delete-btn" onclick="deletePrescriptionModal('${
                          prescription._id
                        }')">Xóa</button>
                        <button class="print-btn" onclick="openPrintPrescription('${
                          prescription._id
                        }')">In Đơn</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function openPrintPrescription(id) {
  window.open(`./printOrder.html?id=${id}`, "_blank");
}

function viewPrescription(id) {
  const prescription = prescriptions.find((p) => p._id === id);

  // Cập nhật nội dung modal
  document.getElementById("prescriptionViewContent").innerHTML = `
    
    <div class="prescription-grid">
      <div class="prescription-info">
        <div class="info-item">
          <span class="info-label">Khách hàng:</span>
          <span class="info-value">${prescription.user.name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ngày tạo:</span>
          <span class="info-value">${new Date(
            prescription.createdAt
          ).toLocaleString("vi-VN")}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Địa chỉ giao hàng:</span>
          <span class="info-value">${prescription.shippingAddress}</span>
        </div>
        <div class="info-item">
          <span class="info-label">SĐT:</span>
          <span class="info-value">${prescription.phoneNumber}</span>
        </div>
      </div>
      
      <div class="prescription-payment">
        <div class="info-item">
          <span class="info-label">Tổng tiền:</span>
          <span class="info-value highlight">${prescription.totalAmount.toLocaleString(
            "vi-VN"
          )} VNĐ</span>
        </div>
        <div class="info-item">
          <span class="info-label">Phương thức thanh toán:</span>
          <span class="info-value">${prescription.paymentMethod}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Trạng thái thanh toán:</span>
          <span class="info-value ${prescription.paymentStatus.toLowerCase()}">
            ${prescription.paymentStatus==="paid" ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        </div>
      </div>
    </div>
    
    <div class="prescription-items">
      <h3>Chi tiết đơn thuốc</h3>
      <table class="prescription-table">
        <thead>
          <tr>
            <th>Tên thuốc</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody id="prescriptionViewItems">
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="total-label">Tổng cộng:</td>
            <td class="total-amount">${prescription.totalAmount.toLocaleString(
              "vi-VN"
            )} VNĐ</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <style>
      .prescription-grid {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }

      .prescription-info, .prescription-payment {
        flex: 1;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .info-label {
        font-weight: bold;
        flex: 1;
      }

      .info-value {
        flex: 2;
        text-align: right;
      }

      .highlight {
        color: red;
        font-weight: bold;
      }

      .prescription-items {
        margin-top: 20px;
      }

      .prescription-table {
        width: 100%;
        border-collapse: collapse;
      }

      .prescription-table th, .prescription-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      .prescription-table th {
        background-color: #f2f2f2;
        font-weight: bold;
      }

      .total-label {
        text-align: right;
        font-weight: bold;
      }

      .total-amount {
        font-weight: bold;
        color: red;
      }
    </style>
  `;

  const itemsTableBody = document.getElementById("prescriptionViewItems");
  itemsTableBody.innerHTML = "";

  prescription.orderItems.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.product.name}</td>
      <td>${item.product.unit || "Viên"} x ${item.items[0].quantity}</td>
      <td>${item.items[0].price.toLocaleString("vi-VN")} VNĐ</td>
      <td>${item.subtotal.toLocaleString("vi-VN")} VNĐ</td>
    `;
    itemsTableBody.appendChild(row);
  });

  document.getElementById("prescriptionViewModal").style.display = "flex";
}

function editPrescription(id) {
  selectedPrescriptionId = id;
  const prescription = prescriptions.find((p) => p._id === id);
  document.getElementById("prescriptionEditId").value = prescription._id;
  document.getElementById("prescriptionEditCustomer").value =
    prescription.user.name;
  document.getElementById("prescriptionEditTotal").value =
    prescription.totalAmount;
  document.getElementById("prescriptionEditStatus").value = prescription.status;
  document.getElementById("prescriptionEditModal").style.display = "flex";
}

function savePrescription() {
  const id = document.getElementById("prescriptionEditId").value;
  const customer = document.getElementById("prescriptionEditCustomer").value;
  const total = parseInt(
    document.getElementById("prescriptionEditTotal").value
  );
  const status = document.getElementById("prescriptionEditStatus").value;

  const prescription = prescriptions.find((p) => p._id === id);
  prescription.user.name = customer;
  prescription.totalAmount = total;
  prescription.status = status;

  closeModal("prescriptionEditModal");
  updatePrescriptionTable();
  updateOverview();
  //gửi put request đến api /api/orders/:id/status với body là {status: prescription.status}
  console.log("Status:", status);
  fetch(`http://localhost:5000/api/orders/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ status: status }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function deletePrescriptionModal(id) {
  selectedPrescriptionId = id;
  document.getElementById("prescriptionDeleteModal").style.display = "flex";
}

function deletePrescription() {
  prescriptions = prescriptions.filter((p) => p._id !== selectedPrescriptionId);

  //gửi delete request đến api /api/orders/:id
  fetch(`http://localhost:5000/api/orders/${selectedPrescriptionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  selectedPrescriptionId = null;
  closeModal("prescriptionDeleteModal");
  updatePrescriptionTable();
  updateOverview();
}

// **Khách hàng**
async function loadCustomers() {
  try {
    const response = await fetch("http://localhost:5000/api/users/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      customers = await response.json(); // Cập nhật biến toàn cục `customers`
      updateCustomerTable(); // Hiển thị danh sách khách hàng
    } else {
      alert("Không thể tải danh sách khách hàng.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
function updateCustomerTable() {
  const tableBody = document
    .getElementById("customerTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";
  customers.forEach((customer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${customer._id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewCustomer('${customer._id}')">Xem</button>
                        <button class="edit-btn" onclick="editCustomer('${customer._id}')">Sửa</button>
                        <button class="delete-btn" onclick="deleteCustomerModal('${customer._id}')">Xóa</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function openAddCustomerModal() {
  document.getElementById("customerAddModal").style.display = "flex";
}

async function addCustomer() {
  const customerData = {
    name: document.getElementById("customerAddName").value,
    email: document.getElementById("customerAddEmail").value,
    password: document.getElementById("customerAddPassword").value,
    phone: document.getElementById("customerAddPhone").value,
    sex: document.getElementById("customerAddGender").value,
    dOB: document.getElementById("customerAddDOB").value,
    role: "user", // Mặc định vai trò là "user"
  };

  try {
    const response = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (response.ok) {
      alert("Thêm khách hàng thành công!");
      closeModal("customerAddModal");
      loadCustomers(); // Tải lại danh sách khách hàng
    } else {
      const error = await response.json();
      alert(`Lỗi: ${error.message}`);
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Có lỗi xảy ra khi thêm khách hàng.");
  }
}

function viewCustomer(id) {
  const customer = customers.find((c) => c._id === id);
  document.getElementById("customerViewContent").innerHTML = `
    <div class="customer-info">
      <div class="info-item">
        <span class="info-label">ID:</span>
        <span class="info-value">${customer._id}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Tên:</span>
        <span class="info-value">${customer.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email:</span>
        <span class="info-value">${customer.email}</span>
      </div>
      <div class="info-item">
        <span class="info-label">SĐT:</span>
        <span class="info-value">${customer.phone}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Ngày sinh:</span>
        <span class="info-value">${new Date(customer.dOB).toLocaleDateString("vi-VN")}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Giới tính:</span>
        <span class="info-value">${customer.sex === "male" ? "Nam" : "Nữ"}</span>
      </div>
      <style>
        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }

        .info-label {
          font-weight: bold;
        }

        .info-value {
          text-align: right;
        }
      </style>
    </div>
  `;
  document.getElementById("customerViewModal").style.display = "flex";
}

function editCustomer(id) {
  selectedCustomerId = id;
  const customer = customers.find((c) => c._id === id);
  console.log(customer.sex + customer.dOB);

  document.getElementById("customerEditId").value = customer._id;
  document.getElementById("customerEditName").value = customer.name;
  document.getElementById("customerEditEmail").value = customer.email;
  document.getElementById("customerEditPhone").value = customer.phone;
  // chọn giới tính trong ô select có id customerEditGender với giá trị là customer.sex
  document.getElementById("customerEditGender").value = customer.sex;
  // chuyển dob sang dạng date mm/dd/yyyy
  const dob = new Date(customer.dOB);
  const yyyy = dob.getFullYear();
  const mm = String(dob.getMonth() + 1).padStart(2, "0"); // getMonth() trả về 0-11
  const dd = String(dob.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  document.getElementById("customerEditDOB").value = formattedDate;
  document.getElementById("customerEditModal").style.display = "flex";
}

function saveCustomer() {
  const id = document.getElementById("customerEditId").value;
  const name = document.getElementById("customerEditName").value;
  const email = document.getElementById("customerEditEmail").value;
  const phone = document.getElementById("customerEditPhone").value;
  const dOB = document.getElementById("customerEditDOB").value;
  const sex = document.getElementById("customerEditGender").value;

  const customer = customers.find((c) => c._id === id);
  customer.name = name;
  customer.email = email;
  customer.phone = phone;
  customer.dOB = dOB;
  customer.sex = sex;

  //Gửi PUT lên API
  fetch(`http://localhost:5000/api/users/profile/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(customer),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  closeModal("customerEditModal");
  updateCustomerTable();
  updateOverview();
}

function deleteCustomerModal(id) {
  selectedCustomerId = id;
  document.getElementById("customerDeleteModal").style.display = "flex";
}

function deleteCustomer() {
  //Gửi DELETE lên API
  fetch(`http://localhost:5000/api/users/profile/${selectedCustomerId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  customers = customers.filter((c) => c._id !== selectedCustomerId);
  selectedCustomerId = null;
  closeModal("customerDeleteModal");
  updateCustomerTable();
  updateOverview();
}

// **Bài viết**
function updatePostTable() {
  const tableBody = document.getElementById("postTable").querySelector("tbody");
  tableBody.innerHTML = "";
  posts.forEach((post) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${post.id}</td>
                    <td>${post.title}</td>
                    <td>${post.content}</td>
                    <td>${post.date}</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewPost('${post.id}')">Xem</button>
                        <button class="edit-btn" onclick="editPost('${post.id}')">Sửa</button>
                        <button class="delete-btn" onclick="deletePostModal('${post.id}')">Xóa</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function openAddPostModal() {
  document.getElementById("postAddModal").style.display = "flex";
}

function addPost() {
  const id = document.getElementById("postAddId").value;
  const title = document.getElementById("postAddTitle").value;
  const content = document.getElementById("postAddContent").value;
  const date = document.getElementById("postAddDate").value;

  posts.push({
    id: id,
    title: title,
    content: content,
    date: date,
  });

  closeModal("postAddModal");
  updatePostTable();
  updateOverview();
}

function viewPost(id) {
  const post = posts.find((p) => p.id === id);
  document.getElementById("postViewContent").innerHTML = `
                ID: ${post.id}<br>
                Tiêu đề: ${post.title}<br>
                Nội dung: ${post.content}<br>
                Ngày đăng: ${post.date}
            `;
  document.getElementById("postViewModal").style.display = "flex";
}

function editPost(id) {
  selectedPostId = id;
  const post = posts.find((p) => p.id === id);
  document.getElementById("postEditId").value = post.id;
  document.getElementById("postEditTitle").value = post.title;
  document.getElementById("postEditContent").value = post.content;
  document.getElementById("postEditDate").value = post.date;
  document.getElementById("postEditModal").style.display = "flex";
}

function savePost() {
  const id = document.getElementById("postEditId").value;
  const title = document.getElementById("postEditTitle").value;
  const content = document.getElementById("postEditContent").value;
  const date = document.getElementById("postEditDate").value;

  const post = posts.find((p) => p.id === id);
  post.title = title;
  post.content = content;
  post.date = date;

  closeModal("postEditModal");
  updatePostTable();
  updateOverview();
}

function deletePostModal(id) {
  selectedPostId = id;
  document.getElementById("postDeleteModal").style.display = "flex";
}

function deletePost() {
  posts = posts.filter((p) => p.id !== selectedPostId);
  selectedPostId = null;
  closeModal("postDeleteModal");
  updatePostTable();
  updateOverview();
}

// Cập nhật tất cả bảng
function updateTables() {
  updateMedicineTable();
  updatePrescriptionTable();
  updateCustomerTable();
  updatePostTable();
}

// Khởi tạo
updateTables();
updateOverview();

function resetBtnClick() {
  loadData();
  updateTables();
  updateOverview();
  //tạm ngưng 3s
  setTimeout(() => {
    document.getElementById("resetBtn").blur();
  }, 1000);
}

function searchMedicines() {
  const searchValue = document
    .getElementById("searchMedicines")
    .value.toLowerCase();
  const filteredMedicines = medicines.filter(
    (medicine) =>
      //Tìm bằng iD, name, _id
      medicine.iD.toLowerCase().includes(searchValue) ||
      medicine._id.toLowerCase().includes(searchValue) ||
      medicine.name.toLowerCase().includes(searchValue)
  );
  const tableBody = document
    .getElementById("medicineTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";
  filteredMedicines.forEach((medicine) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${medicine.iD}</td>
                    <td>${medicine.name}</td>
                    <td>${medicine.isPrescribe ? "Có" : "Không"}</td>
                    <td>${medicine.packaging} VNĐ</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewMedicine('${
                          medicine.iD
                        }')">Xem</button>
                        <button class="edit-btn" onclick="editMedicine('${
                          medicine.iD
                        }')">Sửa</button>
                        <button class="delete-btn" onclick="deleteMedicineModal('${
                          medicine.iD
                        }')">Xóa</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}
function searchCustomers() {
  const searchValue = document
    .getElementById("searchCustomers")
    .value.toLowerCase();
  const filteredCustomers = customers.filter(
    (customer) =>
      //Tìm bằng iD, name, _id, email, phone
      customer._id.toLowerCase().includes(searchValue) ||
      customer.name.toLowerCase().includes(searchValue) ||
      customer.email.toLowerCase().includes(searchValue) ||
      (customer.phone &&
        customer.phone.toString().toLowerCase().includes(searchValue))
  );
  const tableBody = document
    .getElementById("customerTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";
  filteredCustomers.forEach((customer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${customer._id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewCustomer('${customer._id}')">Xem</button>
                        <button class="edit-btn" onclick="editCustomer('${customer._id}')">Sửa</button>
                        <button class="delete-btn" onclick="deleteCustomerModal('${customer._id}')">Xóa</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}
function searchOrders() {
  const searchValue = document
    .getElementById("searchPrescriptions")
    .value.toLowerCase();
  const filteredOrders = prescriptions.filter(
    (order) =>
      //Tìm bằng iD, name, _id
      order._id.toLowerCase().includes(searchValue) ||
      order.user.name.toLowerCase().includes(searchValue)
  );
  const tableBody = document
    .getElementById("prescriptionTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";
  filteredOrders.forEach((order) => {
    const row = document.createElement("tr");

    //chuyển status sang tiếng việt
    let status = order.status;
    switch (status) {
      case "new":
        status = "Mới";
        break;
      case "pending":
        status = "Chờ xử lý";
        break;
      case "processing":
        status = "Đang xử lý";
        break;
      case "shipped":
        status = "Đã giao hàng";
        break;
      case "delivered":
        status = "Đã giao";
        break;
      case "cancelled":
        status = "Đã hủy";
        break;
      default:
        status = "Không xác định";
    }
    row.innerHTML = `
                    <td>${order._id}</td>
                    <td>${order.user.name}</td>
                    <td>${order.totalAmount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>${status}</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewPrescription('${
                          order._id
                        }')">Xem</button>
                        <button class="edit-btn" onclick="editPrescription('${
                          order._id
                        }')">Sửa</button>
                        <button class="delete-btn" onclick="deletePrescriptionModal('${
                          order._id
                        }')">Xóa</button>
                        <button class="print-btn" onclick="openPrintPrescription('${
                          order._id
                        }')">In Đơn</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function filterPrescriptions() {
  const filterValue = document.getElementById("statusFilter").value;
  const filteredOrders = prescriptions.filter((order) =>
    order.status.toLowerCase().includes(filterValue.toLowerCase())
  );
  const tableBody = document
    .getElementById("prescriptionTable")
    .querySelector("tbody");
  tableBody.innerHTML = "";
  filteredOrders.forEach((order) => {
    const row = document.createElement("tr");

    //chuyển status sang tiếng việt
    let status = order.status;
    switch (status) {
      case "new":
        status = "Mới";
        break;
      case "pending":
        status = "Chờ xử lý";
        break;
      case "processing":
        status = "Đang xử lý";
        break;
      case "shipped":
        status = "Đã giao hàng";
        break;
      case "delivered":
        status = "Đã giao";
        break;
      case "cancelled":
        status = "Đã hủy";
        break;
      default:
        status = "Không xác định";
    }
    row.innerHTML = `
                    <td>${order._id}</td>
                    <td>${order.user.name}</td>
                    <td>${order.totalAmount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>${status}</td>
                    <td class="action-buttons">
                        <button class="view-btn" onclick="viewPrescription('${
                          order._id
                        }')">Xem</button>
                        <button class="edit-btn" onclick="editPrescription('${
                          order._id
                        }')">Sửa</button>
                        <button class="delete-btn" onclick="deletePrescriptionModal('${
                          order._id
                        }')">Xóa</button>
                        <button class="print-btn" onclick="openPrintPrescription('${
                          order._id
                        }')">In Đơn</button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}
function sortMedicines() {
  const sortValue = document.getElementById("sortFilter").value;
  const orderValue = document.getElementById("orderFilter").value;

  medicines.sort((a, b) => {
    if (sortValue === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortValue === "price") {
      return a.packagingUnits[0].price - b.packagingUnits[0].price;
    } else if (sortValue === "quantity") {
      //so sánh vói tổng số lượng
      const totalA = a.packagingUnits.reduce(
        (sum, unit) => sum + unit.quantity,
        0
      );
      const totalB = b.packagingUnits.reduce(
        (sum, unit) => sum + unit.quantity,
        0
      );
      return totalA - totalB;
    }
  });
  if (orderValue === "desc") {
    medicines.reverse();
  }
  updateMedicineTable();
}
