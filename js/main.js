
const lines = document.querySelectorAll(".tv-text p, .tv-text h1, .start-btn");

// Lưu nội dung và xóa chữ ban đầu
const texts = Array.from(lines, line => line.textContent);

lines.forEach(line => {
    line.textContent = "";
});

// Ẩn nút START
const startBtn = document.querySelector(".start-btn");
startBtn.classList.remove("show");

// Hàm chờ
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Hiệu ứng gõ chữ
async function typingEffect() {
    await sleep(1000);

    for (let i = 0; i < lines.length; i++) {

        // Hiện nút START khi đến lượt
        if (lines[i].classList.contains("start-btn")) {
            lines[i].classList.add("show");
        }

        // Gõ từng ký tự
        for (const char of texts[i]) {
            lines[i].textContent += char;
            await sleep(30);
        }

        await sleep(300);
    }
}

typingEffect();
