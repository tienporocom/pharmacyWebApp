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

  // Các câu trả lời ngẫu nhiên của bot
const botResponses = [
  "Chào bạn! Bạn cần tư vấn về loại thuốc nào ạ?",
  "Bạn đang gặp triệu chứng gì? Mình sẽ giúp bạn chọn thuốc phù hợp.",
  "Cảm ơn bạn đã nhắn tin! Bạn có cần hỗ trợ về liều dùng không?",
  "Nhà thuốc Tận Tâm luôn sẵn sàng lắng nghe bạn.",
  "Bạn có thể cho mình biết tuổi và tình trạng sức khỏe hiện tại không?",
  "Bạn có bị dị ứng với thành phần thuốc nào không ạ?",
  "Nếu bạn có đơn thuốc, vui lòng gửi nội dung để chúng tôi hỗ trợ chính xác hơn.",
  "Bạn muốn mua thuốc bổ, giảm đau, hay điều trị bệnh lý cụ thể nào ạ?",
  "Để an toàn, bạn nên uống thuốc đúng hướng dẫn từ bác sĩ hoặc dược sĩ.",
  "Chúng tôi có giao hàng tận nơi. Bạn ở khu vực nào vậy?",
  "Cảm ơn bạn đã tin tưởng Nhà thuốc Tận Tâm!",
  "Mình đã ghi nhận yêu cầu của bạn. Vui lòng chờ trong giây lát.",
  "Bạn cần hỗ trợ gợi ý sản phẩm phù hợp? Mình sẵn sàng giúp!",
  "Sức khỏe là ưu tiên hàng đầu, bạn đừng ngần ngại chia sẻ nhé!",
  "Bạn có thể miêu tả thêm triệu chứng để mình tư vấn chi tiết hơn.",
];

// Lấy các phần tử DOM
const chatModal = document.getElementById("chat-modal");
const openChatBtn = document.getElementById("open-chat");
const closeChatBtn = document.getElementById("close-chat");
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

// Mở modal chat
openChatBtn.addEventListener("click", function () {
  chatModal.style.display = "flex";
});

// Đóng modal chat
closeChatBtn.addEventListener("click", function () {
  chatModal.style.display = "none";
});

// Thêm tin nhắn vào khung chat
function addMessage(text, isUser) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(isUser ? "user-message" : "bot-message");
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Lấy câu trả lời ngẫu nhiên từ bot
function getRandomResponse() {
  const randomIndex = Math.floor(Math.random() * botResponses.length);
  return botResponses[randomIndex];
}

// Xử lý gửi tin nhắn
sendButton.addEventListener("click", function () {
  const message = messageInput.value.trim();
  if (message) {
    addMessage(message, true);
    messageInput.value = "";

    // Bot trả lời sau 0.5 giây
    setTimeout(() => {
      const response = getRandomResponse();
      addMessage(response, false);
    }, 500);
  }
});

// Gửi tin nhắn khi nhấn Enter
messageInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendButton.click();
  }
});

// Tin nhắn chào mừng khi mở chat
openChatBtn.addEventListener("click", function () {
  // Chỉ thêm tin nhắn chào mừng nếu chưa có tin nhắn nào
  if (chatMessages.children.length === 0) {
    setTimeout(() => {
      addMessage(
        "Xin chào! MÌnh là trợ lý của Nhà thuốc Tận Tâm. Bạn cần tư vấn về thuốc hay sức khỏe?",
        false
      );
    }, 300);
  }
});


const modal = document.getElementById("mapModal");
        const btn = document.getElementById("openMapBtn");
        const span = document.querySelector(".close-modal");
        const mapIframe = document.getElementById("mapIframe");

        // Link Google Maps iframe (thay tọa độ bằng địa chỉ của bạn)
        const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.126365068466!2d106.6600103153346!3d10.801834261709976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292e8d3dd1%3A0xf15f5aad773c112b!2zSOG7kyBDaMOtIE1pbmgsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s";

        // Mở modal khi click nút
        btn.addEventListener("click", function() {
            modal.style.display = "block";
            mapIframe.src = mapUrl; // Chỉ tải map khi modal mở
            document.body.style.overflow = "hidden"; // Ngăn scroll background
        });

        // Đóng modal khi click nút đóng
        span.addEventListener("click", function() {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });

        // Đóng modal khi click bên ngoài
        window.addEventListener("click", function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });

        // Đóng modal khi nhấn phím Esc
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
});


