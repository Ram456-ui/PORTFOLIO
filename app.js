/**
 * Personal Portfolio Application Script
 * Developer: Ram (ramtomar7962@gmail.com)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // Storage Keys & Core Selectors
  // ==========================================
  const STORAGE_USERS_KEY = 'portfolio_users';
  const STORAGE_SESSION_KEY = 'portfolio_current_session';

  // Navigation & Menu
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const navAuthArea = document.getElementById('navAuthArea');
  const navItems = document.querySelectorAll('.nav-link');

  // Modal Selectors
  const authModal = document.getElementById('authModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabSignupBtn = document.getElementById('tabSignupBtn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const modalAlert = document.getElementById('modalAlert');

  // Contact Form Selectors
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  // ==========================================
  // Mobile Hamburger Toggle
  // ==========================================
  hamburgerBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const icon = hamburgerBtn.querySelector('i');
    if (navLinks.classList.contains('mobile-open')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });

  // Close mobile nav when clicking any link
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      const icon = hamburgerBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    });
  });

  // ==========================================
  // Modal Control Functions
  // ==========================================
  const openModal = (tab = 'login') => {
    clearModalAlert();
    authModal.classList.add('active');
    authModal.setAttribute('aria-hidden', 'false');

    if (tab === 'signup') {
      switchTab('signup');
    } else {
      switchTab('login');
    }
  };

  const closeModal = () => {
    authModal.classList.remove('active');
    authModal.setAttribute('aria-hidden', 'true');
    clearModalAlert();
  };

  const switchTab = (tab) => {
    clearModalAlert();
    if (tab === 'signup') {
      tabSignupBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
    } else {
      tabLoginBtn.classList.add('active');
      tabSignupBtn.classList.remove('active');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
    }
  };

  const showModalAlert = (message, type = 'error') => {
    modalAlert.textContent = message;
    modalAlert.className = `modal-alert ${type}`;
  };

  const clearModalAlert = () => {
    modalAlert.textContent = '';
    modalAlert.className = 'modal-alert';
  };

  // Modal Event Listeners
  modalCloseBtn.addEventListener('click', closeModal);
  tabLoginBtn.addEventListener('click', () => switchTab('login'));
  tabSignupBtn.addEventListener('click', () => switchTab('signup'));

  // Close modal when clicking on the outside overlay
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
  });

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
      closeModal();
    }
  });

  // ==========================================
  // Authentication Engine (LocalStorage)
  // ==========================================
  const getUsers = () => {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUsers = (users) => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  };

  const getCurrentSession = () => {
    const data = localStorage.getItem(STORAGE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  };

  const setCurrentSession = (user) => {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    renderAuthUI();
  };

  const logoutUser = () => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    renderAuthUI();
  };

  // Sign Up Form Handling
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
      showModalAlert('Please fill in all fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showModalAlert('Password must be at least 6 characters.', 'error');
      return;
    }

    const users = getUsers();
    const exists = users.find(u => u.email === email);

    if (exists) {
      showModalAlert('Email is already registered! Please sign in.', 'error');
      return;
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    saveUsers(users);

    showModalAlert('Account successfully created! Logging in...', 'success');

    // Auto login
    setTimeout(() => {
      setCurrentSession({ name: newUser.name, email: newUser.email });
      signupForm.reset();
      closeModal();
    }, 1000);
  });

  // Login Form Handling
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showModalAlert('Please enter both email and password.', 'error');
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      showModalAlert('Invalid email or password.', 'error');
      return;
    }

    showModalAlert('Login successful!', 'success');
    setTimeout(() => {
      setCurrentSession({ name: user.name, email: user.email });
      loginForm.reset();
      closeModal();
    }, 700);
  });

  // Render Navbar according to Session State
  const renderAuthUI = () => {
    const session = getCurrentSession();

    if (session) {
      navAuthArea.innerHTML = `
        <div class="user-badge">
          <i class="fa-solid fa-circle-user"></i>
          <span>Hi, ${escapeHtml(session.name)}</span>
        </div>
        <button class="btn btn-danger btn-sm" id="logoutBtn">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      `;

      document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    } else {
      navAuthArea.innerHTML = `
        <button class="btn btn-outline" id="loginBtn">Login</button>
        <button class="btn btn-primary" id="signupBtn">Sign Up</button>
      `;

      document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
      document.getElementById('signupBtn').addEventListener('click', () => openModal('signup'));
    }
  };

  // Helper function to prevent basic XSS when rendering user names
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m];
    });
  }

  // ==========================================
  // Contact Form Handling (Client-Side)
  // ==========================================
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const submitBtn = document.getElementById('contactSubmitBtn');

    if (!name || !email || !message) {
      contactStatus.className = 'form-status error';
      contactStatus.textContent = 'Please fill out all fields before sending.';
      return;
    }

    // Simulated Sending state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    setTimeout(() => {
      contactStatus.className = 'form-status success';
      contactStatus.textContent = `Thank you, ${name}! Your message has been noted.`;
      contactForm.reset();

      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i> Send Message';

      setTimeout(() => {
        contactStatus.textContent = '';
      }, 5000);
    }, 1200);
  });

  // Initial Auth Check & Setup
  renderAuthUI();
});