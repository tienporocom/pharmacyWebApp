// Hàm để import nội dung của file HTML vào phần tử có id tương ứng
function includeHTML() {
    document.querySelectorAll("[data-include]").forEach(element => {
        let file = element.getAttribute("data-include");

        fetch(file)
            .then(response => response.text())
            .then(data => {
                element.innerHTML = data;
            })
            .catch(error => console.error("Lỗi khi tải file: " + file, error));
    });
}

// Gọi hàm sau khi trang đã load
document.addEventListener("DOMContentLoaded", includeHTML);


