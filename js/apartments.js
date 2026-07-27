document.addEventListener('DOMContentLoaded', () => {
    const injectStyles = (id, css) => {
        if (document.getElementById(id)) return;
        const el = document.createElement('style');
        el.id = id;
        el.textContent = css;
        document.head.appendChild(el);
    };

    injectStyles('unified-fx-styles', `
        @keyframes btnShake {
            0% { transform: translate(0, 0) rotate(0deg); }
            20% { transform: translate(-6px, 3px) rotate(-2deg); }
            40% { transform: translate(6px, -4px) rotate(2deg); }
            60% { transform: translate(-4px, -2px) rotate(-1deg); }
            80% { transform: translate(4px, 2px) rotate(1deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
        }
        .explosion-canvas {
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 99999;
        }
    `);

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    class SpringValue {
        constructor(initial = 0, stiffness = 0.12, damping = 0.78) {
            this.value = initial;
            this.target = initial;
            this.velocity = 0;
            this.stiffness = stiffness;
            this.damping = damping;
        }

        update() {
            const force = (this.target - this.value) * this.stiffness;
            this.velocity = (this.velocity + force) * this.damping;
            this.value += this.velocity;
            return this.value;
        }
    }

    class MagicCard {
        constructor(card) {
            this.card = card;
            this.imgWrap = card.querySelector('.apartment-card__image');
            this.title = card.querySelector('.apartment-card__type');

            this.rotateX = new SpringValue(0, 0.09, 0.82);
            this.rotateY = new SpringValue(0, 0.09, 0.82);
            this.scale = new SpringValue(1, 0.1, 0.8);
            this.imgX = new SpringValue(0, 0.11, 0.78);
            this.imgY = new SpringValue(0, 0.11, 0.78);
            this.titleZ = new SpringValue(25, 0.1, 0.8);

            this.maxTilt = 11;
            this.isHovering = false;
            this.chromaAngle = 0;

            this.setupChromaGlow();
            this.bindEvents();
            this.loop();
        }

        setupChromaGlow() {
            this.glowEl = document.createElement('div');
            this.glowEl.className = 'apartment-card__glow';
            this.card.prepend(this.glowEl);
        }

        bindEvents() {
            this.card.addEventListener('mousemove', (e) => {
                const rect = this.card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                this.card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                this.card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

                this.rotateX.target = clamp(-((y - centerY) / centerY) * this.maxTilt, -this.maxTilt, this.maxTilt);
                this.rotateY.target = clamp(((x - centerX) / centerX) * this.maxTilt, -this.maxTilt, this.maxTilt);
                this.scale.target = 1.025;
                this.imgX.target = ((x - centerX) / centerX) * -14;
                this.imgY.target = ((y - centerY) / centerY) * -14;
                this.titleZ.target = 32;

                this.isHovering = true;
            });

            this.card.addEventListener('mouseleave', () => {
                this.rotateX.target = 0;
                this.rotateY.target = 0;
                this.scale.target = 1;
                this.imgX.target = 0;
                this.imgY.target = 0;
                this.titleZ.target = 25;
                this.isHovering = false;
            });
        }

        loop() {
            this.rotateX.update();
            this.rotateY.update();
            this.scale.update();
            this.imgX.update();
            this.imgY.update();
            this.titleZ.update();

            this.card.style.transform = `perspective(1000px) rotateX(${this.rotateX.value}deg) rotateY(${this.rotateY.value}deg) scale3d(${this.scale.value}, ${this.scale.value}, ${this.scale.value})`;

            if (this.imgWrap) {
                this.imgWrap.style.transform = `translateZ(60px) translate(${this.imgX.value}px, ${this.imgY.value}px)`;
            }

            if (this.title) {
                this.title.style.transform = `translateZ(${this.titleZ.value}px)`;
            }

            this.chromaAngle = (this.chromaAngle + (this.isHovering ? 1.4 : 0.3)) % 360;
            this.glowEl.style.setProperty('--chroma-angle', `${this.chromaAngle}deg`);

            requestAnimationFrame(() => this.loop());
        }
    }

    function initRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.apartment-card').forEach((card) => observer.observe(card));
    }

    function buildApartmentCard(apartment) {
        const card = document.createElement('div');
        card.className = `apartment-card${apartment.is_active ? ' active' : ''}`;
        card.dataset.apartmentType = apartment.type_name;
        card.dataset.apartmentArea = apartment.area;
        card.dataset.apartmentImage = apartment.image_path;
        card.dataset.apartmentRooms = apartment.rooms;
        card.dataset.apartmentPrice = apartment.price;
        card.innerHTML = `
            <div class="apartment-card__shimmer"></div>
            <div class="apartment-card__image">
                <img src="${apartment.image_path}" alt="${apartment.type_name} Apartment Plan" loading="lazy">
            </div>
            <h3 class="apartment-card__type">${apartment.type_name}</h3>
            <p class="apartment-card__area">${apartment.area}</p>
        `;
        return card;
    }

    const APARTMENTS_DATA = [
        { type_name: 'Type 1', area: '23 m²', rooms: '1 room', price: 'from $1,000 / m²', image_path: './img/plan_a.svg', is_active: true },
        { type_name: 'Type 2', area: '27 m²', rooms: '2 rooms', price: 'from $1,150 / m²', image_path: './img/plan_b.svg', is_active: false },
        { type_name: 'Type 3', area: '31 m²', rooms: '3 rooms', price: 'from $1,300 / m²', image_path: './img/plan_c.svg', is_active: false }
    ];

    function loadApartments() {
        const grid = document.getElementById('apartmentsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        APARTMENTS_DATA.forEach((apartment) => {
            grid.appendChild(buildApartmentCard(apartment));
        });

        grid.querySelectorAll('.apartment-card').forEach((card) => new MagicCard(card));
        initRevealObserver();
    }

    loadApartments();

    const infrastructurePanel = document.querySelector('.infrastructure__panel');
    if (infrastructurePanel) {
        const infraObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    infraObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        infraObserver.observe(infrastructurePanel);

        infrastructurePanel.addEventListener('mousemove', (e) => {
            const rect = infrastructurePanel.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            infrastructurePanel.style.setProperty('--panel-mouse-x', `${x}%`);
            infrastructurePanel.style.setProperty('--panel-mouse-y', `${y}%`);
        });
    }

    const btn = document.querySelector('.apartments__button');
    if (btn) {
        const messages = ["Эй, аккуратнее!", "Хватит меня бить!", "Всё, мне надоело..."];
        let lastX = 0, lastY = 0, lastTime = Date.now(), hitCount = 0, isExploded = false;

        btn.addEventListener('mousemove', (e) => {
            if (isExploded) return;

            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);

            const now = Date.now();
            const dt = now - lastTime;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const speed = Math.sqrt(dx * dx + dy * dy) / (dt || 1);

            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = now;

            if (speed > 2.5 && !btn.dataset.hitProcessed) {
                btn.dataset.hitProcessed = "true";
                hitCount++;

                if (hitCount < 3) {
                    btn.textContent = messages[hitCount - 1];
                    btn.style.animation = 'btnShake 0.4s ease';
                    setTimeout(() => { btn.style.animation = ''; }, 400);
                } else {
                    btn.textContent = messages[2];
                    isExploded = true;
                    setTimeout(() => executeCanvasExplosion(btn), 400);
                }

                setTimeout(() => { delete btn.dataset.hitProcessed; }, 600);
            }

            const rotateX = -((y - centerY) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * 12;
            const moveX = (x - centerX) * 0.15;
            const moveY = (y - centerY) * 0.15;

            btn.style.transform = `perspective(800px) translate(${moveX}px, ${moveY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
        });

        btn.addEventListener('mouseleave', () => {
            if (!isExploded) {
                btn.style.transform = 'perspective(800px) translate(0px, 0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            }
        });
    }

    function executeCanvasExplosion(targetBtn) {
        const rect = targetBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        targetBtn.style.opacity = '0';
        targetBtn.style.pointerEvents = 'none';

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = document.createElement('canvas');
        canvas.className = 'explosion-canvas';
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const gravity = 2400;
        const floorY = window.innerHeight - 20;
        const colors = ['#ffffff', '#f4ede2', '#c9b79c', '#7E6D53', '#5a4d3a', '#2D2A22'];
        const particles = [];
        const particleCount = 420;

        for (let i = 0; i < particleCount; i++) {
            const px = rect.left + Math.random() * rect.width;
            const py = rect.top + Math.random() * rect.height;
            const dx = px - centerX;
            const dy = py - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const dirX = dx / dist;
            const dirY = dy / dist;
            const burstSpeed = Math.random() * 420 + 160;

            particles.push({
                x: px,
                y: py,
                vx: dirX * burstSpeed + (Math.random() * 140 - 70),
                vy: dirY * burstSpeed - (Math.random() * 320 + 120),
                size: Math.random() * 3 + 1.5,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 18,
                color: colors[Math.floor(Math.random() * colors.length)],
                bounced: false,
                life: 1,
                fadeSpeed: Math.random() * 0.35 + 0.55
            });
        }

        for (let s = 0; s < 24; s++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 200 + 60;
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * dist * 3,
                vy: Math.sin(angle) * dist * 3,
                size: Math.random() * 2 + 1,
                rot: 0,
                rotSpeed: 0,
                color: '#ffffff',
                bounced: true,
                life: 1,
                fadeSpeed: 1.8,
                glow: true
            });
        }

        let lastTs = performance.now();
        const startTs = lastTs;
        const maxDuration = 1500;

        const renderFrame = (ts) => {
            const dt = Math.min((ts - lastTs) / 1000, 0.032);
            lastTs = ts;
            const elapsed = ts - startTs;

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            let alive = false;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.life <= 0) continue;

                p.vy += gravity * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.rot += p.rotSpeed * dt;

                if (!p.bounced && p.y >= floorY) {
                    p.y = floorY;
                    p.vy *= -0.32;
                    p.vx *= 0.6;
                    p.bounced = true;
                }

                if (elapsed > maxDuration * 0.5) {
                    p.life -= p.fadeSpeed * dt;
                }

                if (p.life <= 0) continue;
                alive = true;

                ctx.save();
                ctx.globalAlpha = clamp(p.life, 0, 1);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);

                if (p.glow) {
                    ctx.shadowColor = '#7E6D53';
                    ctx.shadowBlur = 8;
                }

                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }

            if (alive && elapsed < maxDuration) {
                requestAnimationFrame(renderFrame);
            } else {
                canvas.remove();
            }
        };

        requestAnimationFrame(renderFrame);

        const shockwaveDiv = document.createElement('div');
        shockwaveDiv.style.position = 'fixed';
        shockwaveDiv.style.left = `${centerX}px`;
        shockwaveDiv.style.top = `${centerY}px`;
        shockwaveDiv.style.width = '20px';
        shockwaveDiv.style.height = '20px';
        shockwaveDiv.style.border = '2px solid rgba(255,255,255,0.9)';
        shockwaveDiv.style.borderRadius = '50%';
        shockwaveDiv.style.pointerEvents = 'none';
        shockwaveDiv.style.zIndex = '99998';
        shockwaveDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        shockwaveDiv.style.transition = 'all 0.5s cubic-bezier(0.08, 0.82, 0.25, 1)';
        document.body.appendChild(shockwaveDiv);

        requestAnimationFrame(() => {
            shockwaveDiv.style.transform = 'translate(-50%, -50%) scale(22)';
            shockwaveDiv.style.opacity = '0';
        });
        setTimeout(() => shockwaveDiv.remove(), 500);
    }
});
