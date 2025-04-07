
// Biến toàn cục
let medicines = [];
let prescriptions = [];
let customers = [];
let totalMedicines = 0;

//Load dữ liệu từ API
const loadData = async () => {
  try {
    const responseOrder = await fetch("http://localhost:5000/api/orders/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    });
    const responseTotalProduct = await fetch("http://localhost:5000/api/products/total");
    const responseProduct = await fetch("http://localhost:5000/api/products/page");
    const responseCustomer = await fetch("http://localhost:5000/api/users/all", {
        method: "GET",
        
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    });
    // const responsePost = await fetch("http://localhost:5000/api/posts");
    if (!responseOrder.ok || !responseProduct.ok || !responseCustomer.ok) {
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
    adminNamefield.innerText = "Admin:" + JSON.parse(localStorage.getItem("user"))?.name;
    } catch (error) {
    //Hiện cửa sổ thông báo lỗi
    alert("Lỗi tải dữ liệu: " + error.message);

    console.error("Error loading data:", error);
  }
};

// Gọi hàm loadData khi trang được tải
loadData();


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

function openAddMedicineModal() {
  document.getElementById("medicineAddModal").style.display = "flex";
}

function addMedicine() {
  const id = document.getElementById("medicineAddId").value;
  const name = document.getElementById("medicineAddName").value;
  const description = document.getElementById("medicineAddDescription").value;
  const price = parseInt(document.getElementById("medicineAddPrice").value);
  const quantity = parseInt(
    document.getElementById("medicineAddQuantity").value
  );

  medicines.push({
    iD: id,
    name: name,
    description: description,
    packagingUnits: [{ unitName: "Viên", quantity: quantity, price: price }],
  });

  closeModal("medicineAddModal");
  updateMedicineTable();
  updateOverview();
}

function viewMedicine(id) {
  const medicine = medicines.find((m) => m.iD === id);
  document.getElementById("medicineViewContent").innerHTML = `
                ID: ${medicine.iD}<br>
                Tên: ${medicine.name}<br>
                Mô tả: ${medicine.description}<br>
                Giá: ${medicine.packagingUnits[0].price.toLocaleString(
                  "vi-VN"
                )} VNĐ<br>
                Số lượng: ${medicine.packagingUnits[0].quantity}
            `;
  document.getElementById("medicineViewModal").style.display = "flex";
}

function editMedicine(id) {
  selectedMedicineId = id;
  const medicine = medicines.find((m) => m.iD === id);
  document.getElementById("medicineEditId").value = medicine.iD;
  document.getElementById("medicineEditName").value = medicine.name;
  document.getElementById("medicineEditDescription").value =
    medicine.description;
  document.getElementById("medicineEditPrice").value =
    medicine.packagingUnits[0].price;
  document.getElementById("medicineEditQuantity").value =
    medicine.packagingUnits[0].quantity;
  document.getElementById("medicineEditModal").style.display = "flex";
}

function saveMedicine() {
  const id = document.getElementById("medicineEditId").value;
  const name = document.getElementById("medicineEditName").value;
  const description = document.getElementById("medicineEditDescription").value;
  const price = parseInt(document.getElementById("medicineEditPrice").value);
  const quantity = parseInt(
    document.getElementById("medicineEditQuantity").value
  );

  const medicine = medicines.find((m) => m.iD === id);
  medicine.name = name;
  medicine.description = description;
  medicine.packagingUnits[0].price = price;
  medicine.packagingUnits[0].quantity = quantity;

  closeModal("medicineEditModal");
  updateMedicineTable();
  updateOverview();
}

function deleteMedicineModal(id) {
  selectedMedicineId = id;
  document.getElementById("medicineDeleteModal").style.display = "flex";
}

function deleteMedicine() {
  medicines = medicines.filter((m) => m.iD !== selectedMedicineId);
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
    row.innerHTML = `
                    <td>${prescription._id}</td>
                    <td>${prescription.user}</td>
                    <td>${prescription.totalAmount.toLocaleString(
                      "vi-VN"
                    )} VNĐ</td>
                    <td>${prescription.status}</td>
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
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

function openAddPrescriptionModal() {
  document.getElementById("prescriptionAddModal").style.display = "flex";
}

function addPrescription() {
  const id = document.getElementById("prescriptionAddId").value;
  const customer = document.getElementById("prescriptionAddCustomer").value;
  const total = parseInt(document.getElementById("prescriptionAddTotal").value);
  const status = document.getElementById("prescriptionAddStatus").value;

  prescriptions.push({
    _id: id,
    user: customer,
    totalAmount: total,
    status: status,
    createdAt: new Date().toISOString().split("T")[0],
  });

  closeModal("prescriptionAddModal");
  updatePrescriptionTable();
  updateOverview();
}

function viewPrescription(id) {
  const prescription = prescriptions.find((p) => p._id === id);
  document.getElementById("prescriptionViewContent").innerHTML = `
                ID: ${prescription._id}<br>
                Khách hàng: ${prescription.user}<br>
                Tổng tiền: ${prescription.totalAmount.toLocaleString(
                  "vi-VN"
                )} VNĐ<br>
                Trạng thái: ${prescription.status}<br>
                Ngày tạo: ${prescription.createdAt}
            `;
  document.getElementById("prescriptionViewModal").style.display = "flex";
}

function editPrescription(id) {
  selectedPrescriptionId = id;
  const prescription = prescriptions.find((p) => p._id === id);
  document.getElementById("prescriptionEditId").value = prescription._id;
  document.getElementById("prescriptionEditCustomer").value = prescription.user;
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
  prescription.user = customer;
  prescription.totalAmount = total;
  prescription.status = status;

  closeModal("prescriptionEditModal");
  updatePrescriptionTable();
  updateOverview();
}

function deletePrescriptionModal(id) {
  selectedPrescriptionId = id;
  document.getElementById("prescriptionDeleteModal").style.display = "flex";
}

function deletePrescription() {
  prescriptions = prescriptions.filter((p) => p._id !== selectedPrescriptionId);
  selectedPrescriptionId = null;
  closeModal("prescriptionDeleteModal");
  updatePrescriptionTable();
  updateOverview();
}

// **Khách hàng**
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

function addCustomer() {
  const id = document.getElementById("customerAddId").value;
  const name = document.getElementById("customerAddName").value;
  const email = document.getElementById("customerAddEmail").value;
  const phone = document.getElementById("customerAddPhone").value;

  customers.push({
    _id: id,
    name: name,
    email: email,
    phone: phone,
    joinDate: new Date().toISOString().split("T")[0],
  });

  closeModal("customerAddModal");
  updateCustomerTable();
  updateOverview();
}

function viewCustomer(id) {
  const customer = customers.find((c) => c._id === id);
  document.getElementById("customerViewContent").innerHTML = `
                ID: ${customer._id}<br>
                Tên: ${customer.name}<br>
                Email: ${customer.email}<br>
                SĐT: ${customer.phone}<br>
                Ngày tham gia: ${customer.joinDate}
            `;
  document.getElementById("customerViewModal").style.display = "flex";
}

function editCustomer(id) {
  selectedCustomerId = id;
  const customer = customers.find((c) => c._id === id);
  document.getElementById("customerEditId").value = customer._id;
  document.getElementById("customerEditName").value = customer.name;
  document.getElementById("customerEditEmail").value = customer.email;
  document.getElementById("customerEditPhone").value = customer.phone;
  document.getElementById("customerEditModal").style.display = "flex";
}

function saveCustomer() {
  const id = document.getElementById("customerEditId").value;
  const name = document.getElementById("customerEditName").value;
  const email = document.getElementById("customerEditEmail").value;
  const phone = document.getElementById("customerEditPhone").value;

  const customer = customers.find((c) => c._id === id);
  customer.name = name;
  customer.email = email;
  customer.phone = phone;

  closeModal("customerEditModal");
  updateCustomerTable();
  updateOverview();
}

function deleteCustomerModal(id) {
  selectedCustomerId = id;
  document.getElementById("customerDeleteModal").style.display = "flex";
}

function deleteCustomer() {
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

