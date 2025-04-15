document.addEventListener("DOMContentLoaded", () => {
  let currentSlide = 0;
  const slides = document.querySelectorAll(".slide");
  const totalSlides = slides.length;
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const dots = document.querySelectorAll(".dot");
  const slideContainer = document.querySelector(".slide-container");

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
      dots[i].classList.toggle("active", i === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
  }
  function setCurrentSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
  }
  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);
  setInterval(nextSlide, 5000);
  showSlide(currentSlide); // Hiển thị slide đầu tiên

  

  const modal = document.getElementById("mapModal");
  const btn = document.getElementById("openMapBtn");
  const span = document.querySelector(".close-modal");
  const mapIframe = document.getElementById("mapIframe");

  // Link Google Maps iframe (thay tọa độ bằng địa chỉ của bạn)
  const mapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.126365068466!2d106.6600103153346!3d10.801834261709976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292e8d3dd1%3A0xf15f5aad773c112b!2zSOG7kyBDaMOtIE1pbmgsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s";

  // Mở modal khi click nút
  btn.addEventListener("click", function () {
    modal.style.display = "block";
    mapIframe.src = mapUrl; // Chỉ tải map khi modal mở
    document.body.style.overflow = "hidden"; // Ngăn scroll background
  });

  // Đóng modal khi click nút đóng
  span.addEventListener("click", function () {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // Đóng modal khi click bên ngoài
  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Đóng modal khi nhấn phím Esc
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});
