/**
 * Generates an interactive, celebratory HTML landing page with graffiti / confetti animation
 * in Gold and Navy Blue, adapting automatically to the user's device light/dark theme.
 */
exports.renderWaitlistSuccessPage = ({
  firstName,
  waitlistPosition,
  totalWaitlistCount,
  referralCode,
  referralLink,
  signupBonus = 0,
  referralReward = "1 USDT",
}) => {
  const rewardDisplay = typeof referralReward === "number" ? `${referralReward} USDT` : referralReward;
  const formattedTotal = Number(totalWaitlistCount).toLocaleString();

  const tweetText = encodeURIComponent(
    `I just secured spot #${waitlistPosition} on the @HedgeNest waitlist! Join with my link for a chance to win 1 USDT: ${referralLink}`
  );
  const whatsappText = encodeURIComponent(
    `Hey! I just secured spot #${waitlistPosition} on the HedgeNest waitlist. Join with my link for a chance to win 1 USDT: ${referralLink}`
  );
  const telegramText = encodeURIComponent(
    `I secured spot #${waitlistPosition} on the HedgeNest waitlist! Join here: ${referralLink}`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Spot Secured! 🎉 - HedgeNest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Permanent+Marker&display=swap" rel="stylesheet">
  <style>
    /* Default Theme: Dark Navy & Radiant Gold */
    :root {
      --bg: #070d1e;
      --bg-glow: radial-gradient(circle, rgba(221, 173, 15, 0.18) 0%, rgba(10, 25, 47, 0.4) 50%, transparent 70%);
      --card-bg: rgba(13, 27, 62, 0.94);
      --card-border: rgba(221, 173, 15, 0.3);
      --card-shadow: 0 25px 50px -12px rgba(2, 6, 23, 0.85), 0 0 35px rgba(221, 173, 15, 0.12);
      --header-border: rgba(221, 173, 15, 0.18);
      
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-sub: #cbd5e1;
      
      --gold: #ddad0f;
      --gold-hover: #b48c08;
      --gold-light: #fef08a;
      --gold-badge: #facc15;
      --gold-shadow: 2px 2px 0px #081026, -1px -1px 0px #081026, 3px 3px 10px rgba(221, 173, 15, 0.6);
      
      --navy-deep: #070d1e;
      --navy-card: #0d1b3e;
      --navy-hero: linear-gradient(145deg, #0f214d 0%, #081026 100%);
      --hero-border: rgba(221, 173, 15, 0.4);
      --hero-shadow: 0 14px 30px -5px rgba(0, 0, 0, 0.6), inset 0 0 25px rgba(221, 173, 15, 0.08);
      --hero-num: #ffffff;
      --hero-num-glow: 0 0 35px rgba(221, 173, 15, 0.5);
      --hero-total: #94a3b8;
      --hero-total-strong: #ffffff;
      --hero-note: #cbd5e1;
      --hero-note-border: rgba(255, 255, 255, 0.1);
      
      --perk-bg: rgba(15, 33, 77, 0.7);
      --perk-border: rgba(221, 173, 15, 0.2);
      --perk-val-gold: #facc15;
      
      --share-bg: rgba(15, 33, 77, 0.55);
      --share-border: rgba(221, 173, 15, 0.35);
      --share-title: #fde047;
      
      --input-bg: #070d1e;
      --input-border: rgba(221, 173, 15, 0.3);
      --input-text: #f1f5f9;
      
      --pill-bg: rgba(221, 173, 15, 0.12);
      --pill-border: rgba(221, 173, 15, 0.35);
      --pill-color: #facc15;
      
      --footer-text: #64748b;
      --toast-bg: #1e3a8a;
      --toast-color: #fef08a;
      --toast-border: 1px solid rgba(221, 173, 15, 0.5);
    }

    /* Automatic Light Mode (Device Preference) */
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f4f7fc;
        --bg-glow: radial-gradient(circle, rgba(221, 173, 15, 0.22) 0%, rgba(30, 58, 138, 0.08) 50%, transparent 70%);
        --card-bg: #ffffff;
        --card-border: rgba(15, 33, 77, 0.14);
        --card-shadow: 0 20px 45px -10px rgba(10, 25, 47, 0.14), 0 0 25px rgba(221, 173, 15, 0.1);
        --header-border: rgba(15, 33, 77, 0.08);
        
        --text-main: #0a1931;
        --text-muted: #4b5563;
        --text-sub: #334155;
        
        --gold: #b48c08;
        --gold-hover: #947104;
        --gold-light: #fef3c7;
        --gold-badge: #b45309;
        --gold-shadow: 2px 2px 0px #0a1931, 3px 3px 6px rgba(180, 83, 9, 0.3);
        
        --navy-deep: #0a1931;
        --navy-card: #f8fafc;
        --navy-hero: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        --hero-border: rgba(180, 140, 8, 0.4);
        --hero-shadow: 0 10px 25px -5px rgba(10, 25, 47, 0.08), 0 0 20px rgba(221, 173, 15, 0.08);
        --hero-num: #0a1931;
        --hero-num-glow: 0 2px 8px rgba(10, 25, 49, 0.12);
        --hero-total: #475569;
        --hero-total-strong: #0a1931;
        --hero-note: #334155;
        --hero-note-border: rgba(15, 33, 77, 0.1);
        
        --perk-bg: #f8fafc;
        --perk-border: rgba(15, 33, 77, 0.1);
        --perk-val-gold: #b48c08;
        
        --share-bg: #fffdf5;
        --share-border: rgba(180, 140, 8, 0.35);
        --share-title: #92400e;
        
        --input-bg: #ffffff;
        --input-border: rgba(15, 33, 77, 0.22);
        --input-text: #0a1931;
        
        --pill-bg: rgba(10, 25, 49, 0.06);
        --pill-border: rgba(10, 25, 49, 0.2);
        --pill-color: #0a1931;
        
        --footer-text: #64748b;
        --toast-bg: #0a1931;
        --toast-color: #fef08a;
        --toast-border: 1px solid rgba(212, 175, 55, 0.5);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Fullscreen Confetti Canvas */
    #confettiCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
    }

    /* Ambient Glow */
    .glow-bg {
      position: absolute;
      width: 500px;
      height: 500px;
      background: var(--bg-glow);
      top: 5%;
      left: 50%;
      transform: translateX(-50%);
      filter: blur(60px);
      z-index: 1;
      pointer-events: none;
    }

    .container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 540px;
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      box-shadow: var(--card-shadow);
      overflow: hidden;
      animation: popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }

    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.92) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .header-bar {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--header-border);
    }

    .brand {
      font-size: 20px;
      font-weight: 800;
      color: var(--gold);
      letter-spacing: 0.5px;
    }

    .verified-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--pill-bg);
      color: var(--pill-color);
      border: 1px solid var(--pill-border);
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-body {
      padding: 32px 28px;
      text-align: center;
    }

    /* Graffiti Banner Badge */
    .graffiti-tag {
      font-family: 'Permanent Marker', cursive;
      font-size: 28px;
      color: var(--gold-badge);
      text-shadow: var(--gold-shadow);
      transform: rotate(-3deg);
      display: inline-block;
      margin-bottom: 8px;
      letter-spacing: 1px;
      animation: wiggle 3s infinite ease-in-out;
    }

    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(1deg) scale(1.03); }
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 8px;
      line-height: 1.25;
    }

    .subtitle {
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    /* Position Hero Card (Deep Navy & Polished Gold) */
    .position-hero {
      background: var(--navy-hero);
      border: 2px solid var(--hero-border);
      border-radius: 20px;
      padding: 24px 20px;
      margin-bottom: 24px;
      position: relative;
      box-shadow: var(--hero-shadow);
    }

    .position-label {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--gold);
      margin-bottom: 4px;
    }

    .position-number {
      font-size: 58px;
      font-weight: 900;
      color: var(--hero-num);
      line-height: 1;
      margin: 8px 0;
      letter-spacing: -2px;
      text-shadow: var(--hero-num-glow);
    }

    .position-total {
      font-size: 14px;
      color: var(--hero-total);
      font-weight: 500;
    }

    .position-total strong {
      color: var(--hero-total-strong);
    }

    .reach-out-note {
      font-size: 13px;
      color: var(--hero-note);
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--hero-note-border);
      font-style: italic;
    }

    /* Perks Grid */
    .perks-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .perk-card {
      background: var(--perk-bg);
      border: 1px solid var(--perk-border);
      border-radius: 14px;
      padding: 14px;
      text-align: center;
    }

    .perk-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .perk-val {
      font-size: 18px;
      font-weight: 800;
      color: var(--perk-val-gold);
      margin-top: 4px;
    }

    /* Referral Share Section */
    .share-box {
      background: var(--share-bg);
      border: 1px dashed var(--share-border);
      border-radius: 18px;
      padding: 20px;
      text-align: left;
      margin-bottom: 20px;
    }

    .share-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--share-title);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .share-desc {
      font-size: 13px;
      color: var(--text-sub);
      line-height: 1.45;
      margin-bottom: 14px;
    }

    .copy-group {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }

    .referral-input {
      flex: 1;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--input-text);
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-family: monospace;
      outline: none;
    }

    .copy-btn {
      background: var(--gold);
      color: #070d1e;
      border: none;
      border-radius: 10px;
      padding: 0 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .copy-btn:hover {
      background: var(--gold-hover);
      color: #ffffff;
    }

    .social-row {
      display: flex;
      gap: 8px;
    }

    .social-btn {
      flex: 1;
      padding: 10px 8px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.2s;
    }

    .social-btn:hover { opacity: 0.88; }
    .social-whatsapp { background: #25d366; color: #ffffff; }
    .social-twitter { background: #1d9bf0; color: #ffffff; }
    .social-telegram { background: #0088cc; color: #ffffff; }

    .footer-note {
      font-size: 12px;
      color: var(--footer-text);
      margin-top: 16px;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 24px;
      background: var(--toast-bg);
      color: var(--toast-color);
      border: var(--toast-border);
      padding: 10px 20px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
      pointer-events: none;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="glow-bg"></div>
  <canvas id="confettiCanvas"></canvas>

  <div class="container">
    <div class="header-bar">
      <span class="brand">HedgeNest</span>
      <span class="verified-pill">✓ Email Verified</span>
    </div>

    <div class="card-body">
      <div class="graffiti-tag">🎉 CONGRATULATIONS!</div>
      <h1>You’re in. Spot secured! 🎉</h1>
      <p class="subtitle">Hi <strong>${firstName}</strong>, your email has been verified. You're officially on the HedgeNest waitlist!</p>

      <!-- Position Hero Card -->
      <div class="position-hero">
        <p class="position-label">Your Waitlist Position</p>
        <div class="position-number">#${waitlistPosition}</div>
        <p class="position-total">Out of <strong>${formattedTotal}</strong> people on the waitlist.</p>
        <p class="reach-out-note">We’ll reach out when HedgeNest is ready for you.</p>
      </div>

      <!-- Financial Perks Grid -->
      <div class="perks-grid">
        <div class="perk-card">
          <div class="perk-label">🎁 Signup Bonus</div>
          <div class="perk-val">₦${formattedBonus}</div>
        </div>
        <div class="perk-card">
          <div class="perk-label">🤝 Referral Reward</div>
          <div class="perk-val">₦${formattedReward} <span style="font-size: 11px; font-weight: 400; color: var(--text-muted);">/ friend</span></div>
        </div>
      </div>

      <!-- Share Box -->
      <div class="share-box">
        <div class="share-title">🚀 Want to win 1 USDT & move up the waitlist?</div>
        <p class="share-desc">
          Share your referral link with friends. For every friend who signs up using your link, you get an extra raffle entry to win <strong>1 USDT</strong>!
        </p>

        <div class="copy-group">
          <input type="text" readonly value="${referralLink}" id="refLinkInput" class="referral-input" />
          <button onclick="copyRefLink()" class="copy-btn" id="copyBtn">📋 Copy</button>
        </div>

        <div class="social-row">
          <a href="https://api.whatsapp.com/send?text=${whatsappText}" target="_blank" rel="noopener" class="social-btn social-whatsapp">WhatsApp</a>
          <a href="https://twitter.com/intent/tweet?text=${tweetText}" target="_blank" rel="noopener" class="social-btn social-twitter">Share on X</a>
          <a href="https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${telegramText}" target="_blank" rel="noopener" class="social-btn social-telegram">Telegram</a>
        </div>
      </div>

      <p class="footer-note">We've also emailed you a confirmation of your spot and referral link.</p>
    </div>
  </div>

  <div id="toast" class="toast">Link copied to clipboard! 📋</div>

  <script>
    // Copy to clipboard
    function copyRefLink() {
      const input = document.getElementById('refLinkInput');
      input.select();
      input.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.getElementById('copyBtn');
        const toast = document.getElementById('toast');
        btn.textContent = '✅ Copied!';
        toast.classList.add('show');
        setTimeout(() => {
          btn.textContent = '📋 Copy';
          toast.classList.remove('show');
        }, 2500);
      });
    }

    // Graffiti / Confetti Animation Engine (Navy Blue & Gold)
    (function () {
      const canvas = document.getElementById('confettiCanvas');
      const ctx = canvas.getContext('2d');
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      });

      // Gold and Navy Blue palette with luminous accents
      const colors = [
        '#ddad0f', // Classic Gold
        '#facc15', // Bright Gold
        '#fbbf24', // Amber Gold
        '#b48c08', // Deep Antique Gold
        '#0a1931', // Deep Navy Blue
        '#1e3a8a', // Royal Navy Blue
        '#2563eb', // Vivid Blue
        '#3b82f6', // Sky Blue
        '#ffffff'  // Metallic Sparkle
      ];

      const particles = [];
      const particleCount = 140;

      class Particle {
        constructor(x, y, isBurst = false) {
          this.x = x ?? Math.random() * width;
          this.y = y ?? (isBurst ? height * 0.45 : Math.random() * -50);
          this.size = Math.random() * 9 + 5;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.speedX = (Math.random() - 0.5) * (isBurst ? 14 : 5);
          this.speedY = isBurst ? (Math.random() * -12 - 4) : (Math.random() * 3 + 2);
          this.gravity = 0.22;
          this.rotation = Math.random() * 360;
          this.rotationSpeed = (Math.random() - 0.5) * 10;
          this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
          this.opacity = 1;
          this.decay = Math.random() * 0.005 + 0.002;
        }

        update() {
          this.speedY += this.gravity;
          this.x += this.speedX;
          this.y += this.speedY;
          this.rotation += this.rotationSpeed;
          this.opacity -= this.decay;
        }

        draw() {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate((this.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, this.opacity);
          ctx.fillStyle = this.color;

          if (this.shape === 'rect') {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // Initial double burst from center
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(width * 0.5, height * 0.35, true));
      }

      // Continuous gentle falling confetti
      function loop() {
        ctx.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.update();
          p.draw();

          if (p.y > height || p.opacity <= 0) {
            particles.splice(i, 1);
          }
        }

        // Add periodic ambient flakes
        if (particles.length < 80 && Math.random() > 0.6) {
          particles.push(new Particle());
        }

        requestAnimationFrame(loop);
      }

      loop();
    })();
  </script>
</body>
</html>`;
};

exports.renderWaitlistErrorPage = ({ message }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Error - HedgeNest</title>
  <style>
    :root {
      --bg: #070d1e;
      --card-bg: #0d1b3e;
      --card-border: rgba(221, 173, 15, 0.3);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --gold: #ddad0f;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f4f7fc;
        --card-bg: #ffffff;
        --card-border: rgba(15, 33, 77, 0.14);
        --text-main: #0a1931;
        --text-muted: #4b5563;
        --gold: #b48c08;
      }
    }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      transition: background-color 0.3s ease;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      max-width: 460px;
      width: 100%;
      padding: 40px 30px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      color: #ef4444;
      margin-bottom: 12px;
    }
    p {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: var(--gold);
      color: #070d1e;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Verification Link Expired or Invalid</h1>
    <p>${message || "We could not verify your email address. The link may have expired or already been used."}</p>
    <a href="https://hedge-nest.vercel.app/waitlist" class="btn">Return to Waitlist</a>
  </div>
</body>
</html>`;
};
