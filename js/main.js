// ===================================================
// 8-BIT RETRO PORTFOLIO ENGINE - JAVASCRIPT
// Features: Web Audio SFX, TV Typing, Mascot, Modals, Nav
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------------
    // 1. 8-BIT WEB AUDIO SYNTHESIZER
    // Generates authentic NES/Gameboy sound waves in real time
    // ---------------------------------------------------
    let audioCtx = null;
    let sfxEnabled = true;

    // Load saved sound preference
    if (localStorage.getItem("retro_sfx_enabled") !== null) {
        sfxEnabled = localStorage.getItem("retro_sfx_enabled") === "true";
    }

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    // Play generic retro tone
    function playTone(freq, type = "square", duration = 0.08, vol = 0.1) {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context not allowed or supported
        }
    }

    // Sound FX: Hover blip
    function playHoverSound() {
        playTone(660, "square", 0.04, 0.03);
    }

    // Sound FX: Button click
    function playClickSound() {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(880, now + 0.05);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    // Sound FX: Power-up / Modal Fanfare
    function playPowerUpSound() {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const now = audioCtx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);

                gain.gain.setValueAtTime(0.08, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.15);
            });
        } catch (e) {}
    }

    // Sound FX: Coin sound
    function playCoinSound() {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    // Update SFX UI
    const sfxBtn = document.getElementById("sfx-toggle");
    const sfxIcon = document.getElementById("sfx-icon");

    function updateSfxUi() {
        if (!sfxIcon) return;
        if (sfxEnabled) {
            sfxIcon.textContent = "🔊";
            sfxBtn.classList.remove("is-error");
            sfxBtn.classList.add("is-warning");
        } else {
            sfxIcon.textContent = "🔇";
            sfxBtn.classList.remove("is-warning");
            sfxBtn.classList.add("is-error");
        }
    }

    if (sfxBtn) {
        updateSfxUi();
        sfxBtn.addEventListener("click", () => {
            initAudioContext();
            sfxEnabled = !sfxEnabled;
            localStorage.setItem("retro_sfx_enabled", sfxEnabled.toString());
            updateSfxUi();
            if (sfxEnabled) playCoinSound();
        });
    }

    // Attach sound effects to all interactive elements
    const interactiveElements = document.querySelectorAll("a, button, .nes-btn, .nes-badge, input, textarea");
    interactiveElements.forEach(el => {
        el.addEventListener("mouseenter", () => {
            playHoverSound();
        });
        el.addEventListener("click", () => {
            playClickSound();
        });
    });

    // ---------------------------------------------------
    // 2. TV SCREEN TYPING EFFECT
    // ---------------------------------------------------
    const lines = document.querySelectorAll(".tv-text p, .tv-text h1, .start-btn");
    const texts = Array.from(lines, line => line.textContent.trim());

    lines.forEach(line => {
        line.textContent = "";
    });

    const startBtn = document.querySelector(".start-btn");
    if (startBtn) {
        startBtn.classList.remove("show");
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function typingEffect() {
        await sleep(800);

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].classList.contains("start-btn")) {
                lines[i].classList.add("show");
                lines[i].textContent = texts[i];
                playCoinSound();
                continue;
            }

            for (const char of texts[i]) {
                lines[i].textContent += char;
                playTone(520, "sine", 0.02, 0.015);
                await sleep(35);
            }

            await sleep(250);
        }
    }

    typingEffect();

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            playPowerUpSound();
        });
    }

    // ---------------------------------------------------
    // 3. INTERACTIVE CORNER MASCOT
    // ---------------------------------------------------
    const mascotSpriteBtn = document.getElementById("mascot-sprite-btn");
    const mascotBalloon = document.getElementById("mascot-balloon");
    const mascotText = document.getElementById("mascot-text");

    const mascotQuotes = [
        "Xin chào! Mình là trợ thủ phép thuật của Trâm (UTH IT)! ✨",
        "Trâm hiện đang theo học ngành CNTT tại Trường ĐH Giao thông Vận tải TP.HCM (Viện Đào tạo CLC) 🎓",
        "Dự án nổi bật: FLUX Multi File Downloader & Quản Lý Vật Tư Xây Dựng 💻",
        "Kỹ năng: Python, PySide6, Socket, SQL Server, HTML/CSS/JS, Git/GitHub 🛠️",
        "Sở thích của Trâm: Chơi game, xem phim và chỉnh sửa ảnh/video (Editing)! 🎮",
        "Email kết nối: thachthitram2k6@gmail.com | SĐT: 0356796802 📞",
        "Cảm ơn bạn đã ghé thăm Portfolio của Trâm! Chúc bạn một ngày thật vui vẻ! 🌟"
    ];

    let quoteIdx = 0;

    function cycleMascotQuote() {
        quoteIdx = (quoteIdx + 1) % mascotQuotes.length;
        if (mascotText) {
            mascotText.textContent = mascotQuotes[quoteIdx];
        }
        playPowerUpSound();
    }

    if (mascotSpriteBtn) {
        mascotSpriteBtn.addEventListener("click", cycleMascotQuote);
    }
    if (mascotBalloon) {
        mascotBalloon.addEventListener("click", cycleMascotQuote);
    }

    // ---------------------------------------------------
    // 4. ACHIEVEMENTS / TROPHY MODAL
    // ---------------------------------------------------
    const trophyModal = document.getElementById("trophy-modal");
    const openTrophyBtn = document.getElementById("open-trophy-btn");
    const closeTrophyBtn = document.getElementById("close-trophy-modal");

    function openModal() {
        if (!trophyModal) return;
        trophyModal.classList.add("active");
        playPowerUpSound();
    }

    function closeModal() {
        if (!trophyModal) return;
        trophyModal.classList.remove("active");
        playClickSound();
    }

    if (openTrophyBtn) {
        openTrophyBtn.addEventListener("click", openModal);
    }
    if (closeTrophyBtn) {
        closeTrophyBtn.addEventListener("click", closeModal);
    }
    if (trophyModal) {
        trophyModal.addEventListener("click", (e) => {
            if (e.target === trophyModal) closeModal();
        });
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && trophyModal && trophyModal.classList.contains("active")) {
            closeModal();
        }
    });

    // ---------------------------------------------------
    // 5. MOBILE MENU TOGGLE
    // ---------------------------------------------------
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("mobile-open");
            playClickSound();
        });

        // Close menu on nav link click
        navMenu.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("mobile-open");
            });
        });
    }

    // ---------------------------------------------------
    // 6. SCROLLSPY (ACTIVE NAV HIGHLIGHT)
    // ---------------------------------------------------
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    });

    // ---------------------------------------------------
    // 7. CONTACT FORM SIMULATION
    // ---------------------------------------------------
    const contactForm = document.getElementById("retro-contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            playPowerUpSound();

            const name = document.getElementById("contact-name").value;
            alert(`⚔️ QUEST ACCEPTED!\n\nCảm ơn ${name}! Lời nhắn của bạn đã được gửi thành công đến Thạch Thị Trâm.\nMình sẽ phản hồi bạn qua email hoặc số điện thoại trong thời gian sớm nhất!`);
            contactForm.reset();
        });
    }

    // ---------------------------------------------------
    // 8. RESUME / CV DOWNLOAD SIMULATION
    // ---------------------------------------------------
    const resumeBtn = document.getElementById("resume-btn");
    if (resumeBtn) {
        resumeBtn.addEventListener("click", () => {
            playCoinSound();
            alert("📄 [CV / RESUME]\n\nTính năng tải CV đang được chuẩn bị. Bạn có thể gửi email trực tiếp tới thachthitram2k6@gmail.com để nhận CV chi tiết nhé!");
        });
    }
});
