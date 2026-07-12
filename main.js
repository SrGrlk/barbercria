// DADOS DO PROJETO (ESTÁTICOS E OFFLINE)
const HAIRCUTS = [
  { id: 'maquina', name: 'MÁQUINA', description: 'Corte rápido e prático feito inteiramente na máquina.', price: 20 },
  { id: 'navalhado', name: 'NAVALHADO', description: 'Corte moderno com acabamento na navalha para máxima precisão.', price: 30 },
  { id: 'disfarcado', name: 'DISFARÇADO', description: 'O clássico degradê (fade) com transição suave.', price: 25 },
  { id: 'sobrancelha', name: 'SOBRANCELHA', description: 'Design e limpeza da sobrancelha na navalha ou pinça.', price: 5 },
  { id: 'pezinho', name: 'PÉZINHO', description: 'Limpeza e contorno do cabelo (acabamento).', price: 10 },
  { id: 'barba', name: 'BARBA', description: 'Modelagem e aparo da barba com toalha e produtos.', price: 15 },
  { id: 'barba_pigmentada', name: 'BARBA PIGMENTADA', description: 'Barba modelada com técnica de camuflagem e preenchimento.', price: 20 },
  { id: 'cavanhaque', name: 'CAVANHAQUE', description: 'Modelagem específica para estilo cavanhaque.', price: 15 },
  { id: 'disfarcado_barba', name: 'DISFARÇADO + BARBA', description: 'Combo degradê completo com barba modelada.', price: 40 },
  { id: 'disfarcado_pigmentacao', name: 'DISFARÇADO + PIGMENTAÇÃO', description: 'Degradê com técnica de pigmentação para maior definição.', price: 40 },
  { id: 'disfarcado_pigment_barba', name: 'DISFARÇADO + PIGMENT.+ BARBA', description: 'O serviço mais completo: degradê, pigmentação e barba.', price: 55 },
  { id: 'reflexo_disfarcado', name: 'REFLEXO + DISFARÇADO', description: 'Luzes (reflexo) combinadas com corte degradê.', price: 70 },
  { id: 'reflexo_disfarcado_corte', name: 'REFLEXO + DISFARÇADO C/ CORTE', description: 'Transformação completa com reflexo e corte premium.', price: 100 },
  { id: 'nevou', name: 'NEVOU', description: 'Descoloração global (platinado) de alto nível.', price: 100 }
];

const BARBERS = {
  betao: { name: 'Betão', phone: '5522981726683', username: 'betaodocorte' },
  th: { name: 'Th', phone: '5522981709255', username: 'thdocorte' }
};

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

// CREDENCIAIS DE LOGIN DE BARBEIRO / ADMIN
const BARBER_CREDENTIALS = {
  'betaodocorte': { password: 'Admin123', name: 'Betão', id: 'betao', role: 'barber' },
  'thdocorte': { password: 'Admin123', name: 'Th', id: 'th', role: 'barber' },
  'admin': { password: 'Admin123', name: 'Administrador', id: 'admin', role: 'admin' }
};

// ESTADOS GLOBAIS DO SITE
let selectedBarber = null;
let selectedServiceIds = [];
let selectedDateStr = '';
let selectedTime = null;
let currentStep = 1;
let activeDashboardFilter = 'all';

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  renderAppointments();
  checkAuthSession();
  lucide.createIcons();
  
  // Set default date string to today (or Monday if today is Sunday)
  const today = new Date();
  if (today.getDay() === 0) {
    today.setDate(today.getDate() + 1);
  }
  selectedDateStr = today.toISOString().split('T')[0];
});

/* ==========================================================================
   NAVEGAÇÃO E ABAS
   ========================================================================== */
function ensureDashboardDOM() {
  const section = document.getElementById('section-dashboard');
  const template = document.getElementById('dashboard-template');
  if (section && template && !section.querySelector('.dashboard-content')) {
    const clone = template.content.cloneNode(true);
    section.appendChild(clone);
    lucide.createIcons();
  }
}

function clearDashboardDOM() {
  const section = document.getElementById('section-dashboard');
  if (section) {
    const content = section.querySelector('.dashboard-content');
    if (content) {
      content.remove();
    }
  }
}

function switchTab(tabId) {
  // Protege o acesso ao painel de controle (dashboard)
  if (tabId === 'dashboard') {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!loggedUser || (loggedUser.role !== 'barber' && loggedUser.role !== 'admin')) {
      switchTab('home');
      return;
    }
    ensureDashboardDOM();
  }

  // Esconde todas as abas
  document.querySelectorAll('.tab-section').forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('block');
  });
  
  // Mostra a aba selecionada
  const activeSection = document.getElementById(`section-${tabId}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.classList.add('block');
  }

  // Atualiza classes do menu desktop
  const desktopBtns = ['home', 'catalog', 'appointments', 'dashboard'];
  const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
  const isAdmin = loggedUser && (loggedUser.role === 'barber' || loggedUser.role === 'admin');

  desktopBtns.forEach(btn => {
    const el = document.getElementById(`nav-${btn}`);
    const mel = document.getElementById(`m-nav-${btn}`);
    
    // Se for o painel e o usuário não for admin, mantém oculto e não processa classes normais
    if (btn === 'dashboard' && !isAdmin) {
      if (el) el.className = "hidden text-sm font-medium transition-colors text-stone-400 hover:text-white";
      if (mel) mel.className = "hidden w-full text-left text-xl font-black uppercase italic tracking-tighter text-stone-400";
      return;
    }

    if (btn === tabId) {
      if (el) el.className = "text-sm font-medium transition-colors text-gold-500";
      if (mel) mel.className = "w-full text-left text-xl font-black uppercase italic tracking-tighter text-gold-500";
    } else {
      if (el) el.className = "text-sm font-medium transition-colors text-stone-400 hover:text-white";
      if (mel) mel.className = "w-full text-left text-xl font-black uppercase italic tracking-tighter text-stone-400";
    }
  });

  // Se entrar no dashboard, renderiza seus dados
  if (tabId === 'dashboard') {
    renderBarberDashboard();
  } else if (tabId === 'appointments') {
    renderAppointments();
  }

  // Fecha menu mobile
  document.getElementById('mobile-menu').classList.add('hidden');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  mobileMenu.classList.toggle('hidden');
}

/* ==========================================================================
   SISTEMA DE AUTENTICAÇÃO (LOGIN / REGISTRO / LOGOUT)
   ========================================================================== */
function openLogin() {
  const modal = document.getElementById('login-modal');
  modal.classList.remove('hidden');
  toggleAuthView('login');
}

function closeLogin() {
  const modal = document.getElementById('login-modal');
  modal.classList.add('hidden');
}

function toggleAuthView(view) {
  const title = document.getElementById('auth-modal-title');
  const loginForm = document.getElementById('login-form-view');
  const regForm = document.getElementById('register-form-view');
  
  document.getElementById('login-error-msg').classList.add('hidden');
  document.getElementById('register-error-msg').classList.add('hidden');

  if (view === 'login') {
    title.innerHTML = `<i data-lucide="lock" class="w-4 h-4"></i> Acessar Conta`;
    loginForm.classList.remove('hidden');
    loginForm.classList.add('block');
    regForm.classList.add('hidden');
    regForm.classList.remove('block');
  } else {
    title.innerHTML = `<i data-lucide="user-plus" class="w-4 h-4"></i> Criar Conta`;
    loginForm.classList.add('hidden');
    loginForm.classList.remove('block');
    regForm.classList.remove('hidden');
    regForm.classList.add('block');
    
    // Reseta form de registro
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-password').value = '';
  }
  lucide.createIcons();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  
  const usernameInput = document.getElementById('login-username').value.trim();
  const passwordInput = document.getElementById('login-password').value;
  const errorMsg = document.getElementById('login-error-msg');
  
  // 1. Verifica se é Barbeiro ou Admin
  const barber = BARBER_CREDENTIALS[usernameInput];
  if (barber && barber.password === passwordInput) {
    const sessionUser = {
      role: barber.role || 'barber',
      username: usernameInput,
      name: barber.name,
      id: barber.id
    };
    sessionStorage.setItem('loggedUser', JSON.stringify(sessionUser));
    checkAuthSession();
    closeLogin();
    switchTab('dashboard');
    return;
  }

  // 2. Verifica se é Cliente registrado no localStorage (apenas nome e senha)
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const client = clients.find(c => c.name.toLowerCase() === usernameInput.toLowerCase());
  
  if (client && client.password === passwordInput) {
    if (client.blocked) {
      alert('Esta conta foi bloqueada por um administrador.');
      return;
    }
    const sessionUser = {
      role: 'client',
      name: client.name
    };
    sessionStorage.setItem('loggedUser', JSON.stringify(sessionUser));
    checkAuthSession();
    closeLogin();
    switchTab('home');
  } else {
    errorMsg.classList.remove('hidden');
  }
}

function handleRegisterSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('reg-name').value.trim();
  const password = document.getElementById('reg-password').value;
  const errorMsg = document.getElementById('register-error-msg');

  // Verifica se o nome já existe
  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  const exists = clients.some(c => c.name.toLowerCase() === name.toLowerCase());

  if (exists) {
    errorMsg.classList.remove('hidden');
    return;
  }

  // Cadastra novo cliente (apenas nome e senha)
  const newClient = { name, password };
  clients.push(newClient);
  localStorage.setItem('clients', JSON.stringify(clients));

  // Loga automaticamente
  const sessionUser = {
    role: 'client',
    name
  };
  sessionStorage.setItem('loggedUser', JSON.stringify(sessionUser));
  
  checkAuthSession();
  closeLogin();
  switchTab('home');
}

function logoutUser() {
  sessionStorage.removeItem('loggedUser');
  checkAuthSession();
  switchTab('home');
}

function checkAuthSession() {
  const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
  
  const navTrigger = document.getElementById('btn-login-trigger');
  const navTriggerMobile = document.getElementById('btn-login-trigger-mobile');
  const navLogged = document.getElementById('user-logged-nav');
  const navLoggedMobile = document.getElementById('user-logged-nav-mobile');
  
  const navDash = document.getElementById('nav-dashboard');
  const mNavDash = document.getElementById('m-nav-dashboard');

  if (loggedUser) {
    // Esconde botões de login
    if (navTrigger) navTrigger.classList.add('hidden');
    if (navTriggerMobile) navTriggerMobile.classList.add('hidden');

    // Configura e mostra dados do usuário logado (Desktop)
    if (navLogged) {
      navLogged.classList.remove('hidden');
      navLogged.classList.add('flex');
      
      const roleLabel = loggedUser.role === 'barber' ? 'Barbeiro' : (loggedUser.role === 'admin' ? 'Admin' : 'Cliente');
      document.getElementById('user-nav-role').innerText = roleLabel;
      document.getElementById('user-nav-name').innerText = loggedUser.name;
    }

    // Configura e mostra dados do usuário logado (Mobile)
    if (navLoggedMobile) {
      navLoggedMobile.classList.remove('hidden');
      navLoggedMobile.classList.add('flex');
      
      const roleLabel = loggedUser.role === 'barber' ? 'Barbeiro' : (loggedUser.role === 'admin' ? 'Admin' : 'Cliente');
      document.getElementById('user-nav-role-mobile').innerText = roleLabel;
      document.getElementById('user-nav-name-mobile').innerText = loggedUser.name;
    }

    // Exibe abas baseadas nas permissões do papel
    if (loggedUser.role === 'barber' || loggedUser.role === 'admin') {
      ensureDashboardDOM();
      if (navDash) navDash.classList.remove('hidden');
      if (mNavDash) mNavDash.classList.remove('hidden');
      
      const badge = document.getElementById('dashboard-barber-badge');
      if (badge) badge.innerText = loggedUser.name;
    } else {
      clearDashboardDOM();
      if (navDash) navDash.classList.add('hidden');
      if (mNavDash) mNavDash.classList.add('hidden');
    }
  } else {
    // Exibe botões de login
    if (navTrigger) navTrigger.classList.remove('hidden');
    if (navTriggerMobile) navTriggerMobile.classList.remove('hidden');

    // Esconde cabeçalho de usuário logado
    if (navLogged) {
      navLogged.classList.add('hidden');
      navLogged.classList.remove('flex');
    }
    if (navLoggedMobile) {
      navLoggedMobile.classList.add('hidden');
      navLoggedMobile.classList.remove('flex');
    }

    // Esconde painel administrativo e remove o HTML
    clearDashboardDOM();
    if (navDash) navDash.classList.add('hidden');
    if (mNavDash) mNavDash.classList.add('hidden');
  }
  lucide.createIcons();
}

/* ==========================================================================
   RENDERIZADORES
   ========================================================================== */
function renderCatalog() {
  const catalogGrid = document.getElementById('catalog-grid');
  if (!catalogGrid) return;

  catalogGrid.innerHTML = HAIRCUTS.map(cut => `
    <div class="group bg-stone-900 border border-stone-800 p-6 rounded-[2rem] shadow-lg hover:shadow-xl hover:border-stone-750 transition-all duration-300 flex flex-col justify-between">
      <div class="mb-6">
        <div class="flex justify-between items-start gap-4 mb-3">
          <h3 class="text-xl font-black uppercase italic tracking-tighter text-white leading-tight">${cut.name}</h3>
          <div class="bg-gold-500/10 px-3 py-1 rounded-full text-xs font-black italic text-gold-400 whitespace-nowrap">
            R$ ${cut.price.toFixed(2)}
          </div>
        </div>
        <p class="text-xs text-stone-400 font-medium leading-relaxed">${cut.description}</p>
      </div>

      <button onclick="openBooking('${cut.id}')" class="w-full bg-stone-850 hover:bg-gold-500 hover:text-stone-950 text-stone-200 py-4 rounded-xl font-black uppercase tracking-widest italic text-xs transition-all flex items-center justify-center gap-2">
        Agendar Horário
      </button>
    </div>
  `).join('');
}

function renderAppointments() {
  const container = document.getElementById('appointments-container');
  if (!container) return;

  const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));

  // Se não estiver logado, avisa que precisa de conta
  if (!loggedUser) {
    container.innerHTML = `
      <div class="text-center py-16 bg-stone-900 border border-stone-800 rounded-[2rem]">
        <div class="w-16 h-16 bg-stone-850 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-500">
          <i data-lucide="lock" class="w-8 h-8 text-gold-500"></i>
        </div>
        <h3 class="text-xl font-black uppercase italic tracking-tighter text-white mb-1">Acesso Restrito</h3>
        <p class="text-sm text-stone-400 max-w-xs mx-auto mb-6">Por favor, acesse sua conta para ver seus agendamentos.</p>
        <button onclick="openLogin()" class="bg-gold-500 text-stone-950 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gold-400 transition-colors">
          Entrar na Conta
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  
  // Filtra apenas agendamentos do cliente logado (exclui cancelados)
  const appointments = allAppointments.filter(app => 
    app.status !== 'cancelled' && 
    (loggedUser.role === 'barber' || loggedUser.role === 'admin' || app.clientName.toLowerCase() === loggedUser.name.toLowerCase())
  );

  if (appointments.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 bg-stone-900 border border-stone-800 rounded-[2rem]">
        <div class="w-16 h-16 bg-stone-850 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-500">
          <i data-lucide="calendar" class="w-8 h-8"></i>
        </div>
        <h3 class="text-xl font-black uppercase italic tracking-tighter text-white mb-1">Nenhum agendamento</h3>
        <p class="text-sm text-stone-400 max-w-xs mx-auto">Você não possui nenhum horário marcado.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Sort appointments by date & time
  appointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  container.innerHTML = appointments.map(app => {
    const dateFormatted = formatDateString(app.date);
    const statusText = app.status === 'completed' ? 'Concluído' : 'Agendado';
    const statusClass = app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gold-500/10 text-gold-400';
    
    return `
      <div class="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gold-500/10 text-gold-500 rounded-xl">
            <i data-lucide="scissors" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-lg font-black uppercase italic tracking-tight text-white leading-snug">${app.serviceNames}</h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider italic ${statusClass}">${statusText}</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 mt-1">
              <span class="flex items-center gap-1">
                <i data-lucide="user" class="w-3.5 h-3.5 text-gold-500"></i> Barbeiro: ${app.barberName}
              </span>
              <span class="flex items-center gap-1">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-gold-500"></i> ${dateFormatted} às ${app.time}
              </span>
              <span class="flex items-center gap-1 text-gold-500 font-bold">
                Total: R$ ${app.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          ${app.status !== 'completed' ? `
            <a href="${getWhatsAppLink(app)}" target="_blank" class="flex-1 sm:flex-initial bg-[#25D366] hover:bg-[#1ebe57] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5">
              <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp
            </a>
            <button onclick="cancelAppointment('${app.id}')" class="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all" title="Cancelar Agendamento">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  lucide.createIcons();
}

function formatDateString(dateStr) {
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ==========================================================================
   MODAL DE AGENDAMENTO (WIZARD STEPS)
   ========================================================================== */
function openBooking(initialServiceId = null) {
  // 1. Trava de segurança: exige login antes de abrir agendamento
  const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
  if (!loggedUser) {
    alert('Por favor, faça login ou crie uma conta para agendar um horário.');
    openLogin();
    return;
  }

  // Reseta estados do modal
  selectedBarber = null;
  selectedServiceIds = [];
  selectedTime = null;
  currentStep = 1;
  
  if (initialServiceId) {
    selectedServiceIds.push(initialServiceId);
  }

  // Configura campos do cliente no Passo 4 baseado na conta do cliente ativo
  const nameInput = document.getElementById('client-name');
  const phoneInput = document.getElementById('client-phone');
  
  if (loggedUser.role === 'client') {
    nameInput.value = loggedUser.name;
    nameInput.disabled = true;
    nameInput.classList.add('cursor-not-allowed', 'text-stone-500');
    
    // Telefone continua editável pois não é solicitado no cadastro
    phoneInput.value = localStorage.getItem('clientPhone') || '';
    phoneInput.disabled = false;
    phoneInput.classList.remove('cursor-not-allowed', 'text-stone-500');
  } else {
    // Barbeiros podem agendar inserindo qualquer nome e telefone
    nameInput.value = '';
    nameInput.disabled = false;
    nameInput.classList.remove('cursor-not-allowed', 'text-stone-500');
    
    phoneInput.value = '';
    phoneInput.disabled = false;
    phoneInput.classList.remove('cursor-not-allowed', 'text-stone-500');
  }

  // Mostra modal
  const modal = document.getElementById('booking-modal');
  modal.classList.remove('hidden');
  
  // Renderiza passos
  updateModalStep();
}

function closeBooking() {
  const modal = document.getElementById('booking-modal');
  modal.classList.add('hidden');
}

function selectBarber(barberId) {
  selectedBarber = barberId;
  
  // Atualiza classe visual nos cards
  document.querySelectorAll('.barber-card').forEach(card => {
    card.classList.remove('border-gold-500', 'bg-gold-500/5');
    card.classList.add('border-stone-700', 'bg-stone-850');
  });

  const selectedCard = document.getElementById(`barber-card-${barberId}`);
  if (selectedCard) {
    selectedCard.classList.remove('border-stone-700', 'bg-stone-850');
    selectedCard.classList.add('border-gold-500', 'bg-gold-500/5');
  }

  nextStep();
}

function toggleService(serviceId) {
  const idx = selectedServiceIds.indexOf(serviceId);
  if (idx > -1) {
    selectedServiceIds.splice(idx, 1);
  } else {
    selectedServiceIds.push(serviceId);
  }

  // Atualiza visual
  renderModalServices();
  updateServicesTotal();
  validateNavigation();
}

function selectDate(dateStr) {
  selectedDateStr = dateStr;
  
  // Atualiza botões
  document.querySelectorAll('.date-btn').forEach(btn => {
    btn.classList.remove('border-gold-500', 'bg-gold-500/10', 'text-gold-500');
    btn.classList.add('border-stone-800', 'bg-stone-950', 'text-stone-300');
  });

  const selectedBtn = document.getElementById(`date-btn-${dateStr}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-stone-800', 'bg-stone-950', 'text-stone-300');
    selectedBtn.classList.add('border-gold-500', 'bg-gold-500/10', 'text-gold-500');
  }

  // Recarrega horários (simulando ocupados)
  renderTimesGrid();
}

function selectTimeSlot(time) {
  selectedTime = time;

  // Atualiza botões
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.classList.remove('border-gold-500', 'bg-gold-500/10', 'text-gold-500');
    btn.classList.add('border-stone-850', 'bg-stone-950', 'text-stone-300');
  });

  const selectedBtn = document.getElementById(`time-btn-${time.replace(':', '')}`);
  if (selectedBtn) {
    selectedBtn.classList.remove('border-stone-850', 'bg-stone-950', 'text-stone-300');
    selectedBtn.classList.add('border-gold-500', 'bg-gold-500/10', 'text-gold-500');
  }

  nextStep();
}

function updateModalStep() {
  // Esconde todos os painéis
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.add('hidden');
    panel.classList.remove('block');
  });

  // Mostra o painel do passo atual
  if (currentStep === 1) {
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('step-1').classList.add('block');
  } else if (currentStep === 2) {
    document.getElementById('step-2').classList.remove('hidden');
    document.getElementById('step-2').classList.add('block');
    renderModalServices();
    updateServicesTotal();
  } else if (currentStep === 3) {
    document.getElementById('step-3').classList.remove('hidden');
    document.getElementById('step-3').classList.add('block');
    renderDatesGrid();
    renderTimesGrid();
  } else if (currentStep === 4) {
    document.getElementById('step-4').classList.remove('hidden');
    document.getElementById('step-4').classList.add('block');
    renderReviewData();
  }

  // Atualiza indicadores de progresso
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step-indicator-${i}`);
    if (el) {
      if (i <= currentStep) {
        el.classList.add('text-gold-500');
        el.classList.remove('text-stone-500');
      } else {
        el.classList.remove('text-gold-500');
        el.classList.add('text-stone-500');
      }
    }
  }

  validateNavigation();
  lucide.createIcons();
}

function validateNavigation() {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const footer = document.getElementById('booking-footer');

  if (currentStep === 5) {
    footer.classList.add('hidden');
    return;
  }
  footer.classList.remove('hidden');

  // Habilita/Desabilita Voltar
  btnPrev.disabled = currentStep === 1;

  // Habilita/Desabilita Avançar
  let canNext = false;
  if (currentStep === 1) canNext = selectedBarber !== null;
  else if (currentStep === 2) canNext = selectedServiceIds.length > 0;
  else if (currentStep === 3) canNext = selectedTime !== null;
  else if (currentStep === 4) canNext = true;

  btnNext.disabled = !canNext;
  btnNext.innerText = currentStep === 4 ? 'Confirmar Agendamento' : 'Avançar';
}

function nextStep() {
  if (currentStep === 4) {
    confirmBooking();
  } else {
    currentStep++;
    updateModalStep();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateModalStep();
  }
}

/* ==========================================================================
   RENDERIZADORES DENTRO DO MODAL
   ========================================================================== */
function renderModalServices() {
  const list = document.getElementById('modal-services-list');
  if (!list) return;

  list.innerHTML = HAIRCUTS.map(cut => {
    const isChecked = selectedServiceIds.includes(cut.id);
    return `
      <div onclick="toggleService('${cut.id}')" class="flex items-center justify-between p-4 bg-stone-950 border border-stone-850 rounded-xl cursor-pointer hover:border-gold-500 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 rounded border ${isChecked ? 'bg-gold-500 border-gold-500 text-stone-950' : 'border-stone-700 bg-stone-900'} flex items-center justify-center">
            ${isChecked ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
          </div>
          <div>
            <p class="text-sm font-bold uppercase italic">${cut.name}</p>
            <p class="text-[11px] text-stone-400 mt-0.5 leading-snug max-w-md">${cut.description}</p>
          </div>
        </div>
        <span class="text-sm font-black text-gold-500 whitespace-nowrap pl-4">R$ ${cut.price.toFixed(2)}</span>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function updateServicesTotal() {
  const totalEl = document.getElementById('modal-services-total');
  if (!totalEl) return;

  const total = selectedServiceIds.reduce((sum, id) => {
    const service = HAIRCUTS.find(c => c.id === id);
    return sum + (service ? service.price : 0);
  }, 0);

  totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

// RESTANTE DO CÓDIGO DO MODAL IGUAL
function renderDatesGrid() {
  const grid = document.getElementById('dates-grid');
  if (!grid) return;

  const today = new Date();
  let datesHtml = '';

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 0; i < 7; i++) {
    const current = new Date();
    current.setDate(today.getDate() + i);
    const dateStr = current.toISOString().split('T')[0];
    const isSelected = selectedDateStr === dateStr;
    const isSunday = current.getDay() === 0;

    if (isSunday) {
      datesHtml += `
        <button class="flex flex-col items-center justify-center p-3 rounded-xl border text-xs transition-all border-stone-900/50 bg-stone-900/10 text-stone-600 cursor-not-allowed" disabled>
          <span class="text-[9px] font-bold text-stone-600 uppercase">${dayNames[current.getDay()]}</span>
          <span class="text-base font-black mt-0.5">${current.getDate()}</span>
          <span class="text-[8px] font-bold text-rose-500/70 uppercase">Fechado</span>
        </button>
      `;
    } else {
      datesHtml += `
        <button onclick="selectDate('${dateStr}')" id="date-btn-${dateStr}" class="date-btn flex flex-col items-center justify-center p-3 rounded-xl border text-xs transition-all ${
          isSelected 
          ? 'border-gold-500 bg-gold-500/10 text-gold-500' 
          : 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
        }">
          <span class="text-[10px] font-bold text-stone-500 uppercase">${dayNames[current.getDay()]}</span>
          <span class="text-base font-black mt-0.5">${current.getDate()}</span>
        </button>
      `;
    }
  }

  grid.innerHTML = datesHtml;
}

function renderTimesGrid() {
  const grid = document.getElementById('times-grid');
  if (!grid) return;

  // Lê do localStorage os horários que já estão agendados com esse barbeiro nesta data (e não cancelados)
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const occupiedTimes = appointments
    .filter(app => app.barberId === selectedBarber && app.date === selectedDateStr && app.status !== 'cancelled')
    .map(app => app.time);

  grid.innerHTML = TIME_SLOTS.map(time => {
    const isOccupied = occupiedTimes.includes(time);
    const isSelected = selectedTime === time;
    
    if (isOccupied) {
      return `
        <button class="bg-stone-900 border border-stone-850/50 text-stone-600 rounded-xl py-3 text-xs font-bold line-through cursor-not-allowed" disabled>
          ${time}
        </button>
      `;
    }

    return `
      <button onclick="selectTimeSlot('${time}')" id="time-btn-${time.replace(':', '')}" class="time-btn bg-stone-950 border text-stone-300 font-bold rounded-xl py-3 text-xs hover:border-gold-500 transition-all ${
        isSelected 
        ? 'border-gold-500 bg-gold-500/10 text-gold-500' 
        : 'border-stone-850 hover:border-stone-700'
      }">
        ${time}
      </button>
    `;
  }).join('');
}

function renderReviewData() {
  const barber = BARBERS[selectedBarber];
  const servicesSelected = selectedServiceIds.map(id => HAIRCUTS.find(c => c.id === id)).filter(Boolean);
  const total = servicesSelected.reduce((sum, s) => sum + s.price, 0);

  document.getElementById('review-barber').innerText = barber ? barber.name : '';
  document.getElementById('review-services').innerText = servicesSelected.map(s => s.name).join(' + ');
  document.getElementById('review-datetime').innerText = `${formatDateString(selectedDateStr)} às ${selectedTime}`;
  document.getElementById('review-total').innerText = `R$ ${total.toFixed(2)}`;
}

/* ==========================================================================
   CONFIRMAÇÃO E WHATSAPP REDIRECT
   ========================================================================== */
function confirmBooking() {
  const nameInput = document.getElementById('client-name');
  const phoneInput = document.getElementById('client-phone');
  
  const clientName = nameInput.value.trim();
  const clientPhone = phoneInput.value.trim();

  if (!clientName || !clientPhone) {
    alert('Por favor, informe seu nome e telefone.');
    return;
  }

  // Guarda o telefone localmente para autocompletar na próxima vez
  localStorage.setItem('clientPhone', clientPhone);

  const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
  const barber = BARBERS[selectedBarber];
  const servicesSelected = selectedServiceIds.map(id => HAIRCUTS.find(c => c.id === id)).filter(Boolean);
  const total = servicesSelected.reduce((sum, s) => sum + s.price, 0);

  const newApp = {
    id: `app_${Date.now()}`,
    clientName,
    clientPhone,
    barberId: selectedBarber,
    barberName: barber.name,
    serviceIds: selectedServiceIds,
    serviceNames: servicesSelected.map(s => s.name).join(' + '),
    totalPrice: total,
    date: selectedDateStr,
    time: selectedTime,
    status: 'scheduled'
  };

  // Carrega agendamentos existentes, adiciona e salva
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments.push(newApp);
  localStorage.setItem('appointments', JSON.stringify(appointments));

  // Se o agendamento foi feito por um barbeiro ou admin, avisa na tela
  if (loggedUser && (loggedUser.role === 'barber' || loggedUser.role === 'admin')) {
    showNotificationToast(
      'Agendamento Criado!',
      `O agendamento para <strong>${newApp.clientName}</strong> foi criado com sucesso.`
    );
  }

  // Configura botão do WhatsApp no sucesso
  const wppBtn = document.getElementById('btn-whatsapp-redirect');
  if (wppBtn) {
    wppBtn.href = getWhatsAppLink(newApp);
  }

  // Esconde o painel do passo 4 e rodapé, e mostra tela de sucesso
  document.getElementById('step-4').classList.add('hidden');
  document.getElementById('step-4').classList.remove('block');
  document.getElementById('booking-footer').classList.add('hidden');
  
  const stepSuccess = document.getElementById('step-success');
  stepSuccess.classList.remove('hidden');
  stepSuccess.classList.add('block');
  
  currentStep = 5;

  // Atualiza painéis
  renderAppointments();
  if (loggedUser && (loggedUser.role === 'barber' || loggedUser.role === 'admin')) {
    renderBarberDashboard();
  }
  lucide.createIcons();
}

function getWhatsAppLink(app) {
  const barber = BARBERS[app.barberId];
  const text = `Olá, *${barber.name}*! Acabei de agendar um horário com você pela Barbercria.

*Detalhes do Agendamento:*
- *Cliente:* ${app.clientName}
- *Telefone:* ${app.clientPhone}
- *Serviço(s):* ${app.serviceNames}
- *Data:* ${formatDateString(app.date)}
- *Horário:* ${app.time}
- *Valor Total:* R$ ${app.totalPrice.toFixed(2)}

Confirma meu agendamento?`;

  return `https://wa.me/${barber.phone}?text=${encodeURIComponent(text)}`;
}

function cancelAppointment(appId) {
  if (!confirm('Deseja realmente cancelar este agendamento?')) return;

  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments = appointments.map(app => {
    if (app.id === appId) app.status = 'cancelled';
    return app;
  });
  localStorage.setItem('appointments', JSON.stringify(appointments));

  // Recarrega
  renderAppointments();
  if (sessionStorage.getItem('loggedUser')) {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (loggedUser.role === 'barber' || loggedUser.role === 'admin') {
      renderBarberDashboard();
    }
  }
}

/* ==========================================================================
   PAINEL DO BARBEIRO (BARBER DASHBOARD)
   ========================================================================== */
function renderBarberDashboard() {
  const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
  if (!loggedUser || (loggedUser.role !== 'barber' && loggedUser.role !== 'admin')) return;

  // Renderiza Caixa e Finanças
  renderFinancialMetrics();
  renderExpenses();
  
  // Renderiza Lista de Agendamentos
  renderDashboardAppointments();

  // Renderiza Lista de Clientes
  renderDashboardClients();
}

function renderDashboardClients() {
  const container = document.getElementById('dashboard-clients-list');
  const countEl = document.getElementById('dashboard-clients-count');
  if (!container) return;

  const clients = JSON.parse(localStorage.getItem('clients') || '[]');
  
  if (countEl) {
    countEl.innerText = `${clients.length} ${clients.length === 1 ? 'Cliente' : 'Clientes'}`;
  }

  if (clients.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-xs text-stone-500 italic">
        Nenhum cliente cadastrado.
      </div>
    `;
    return;
  }

  // Ordena por nome
  clients.sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = clients.map(client => {
    const isBlocked = client.blocked === true;
    const blockBtnText = isBlocked ? 'Desbloquear' : 'Bloquear';
    const blockBtnClass = isBlocked 
      ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white' 
      : 'bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white';
    const blockBadge = isBlocked 
      ? `<span class="bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase px-2 py-0.5 rounded italic">Bloqueado</span>`
      : `<span class="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded italic">Ativo</span>`;

    return `
      <div class="bg-stone-950 border border-stone-850 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-md">
        <div class="flex items-center justify-between gap-2">
          <div class="truncate">
            <span class="font-bold text-white uppercase italic text-sm tracking-tight block truncate">${client.name}</span>
          </div>
          ${blockBadge}
        </div>
        <div class="flex items-center gap-2 mt-1">
          <button onclick="toggleBlockClient('${client.name}')" class="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${blockBtnClass}">
            ${blockBtnText}
          </button>
          <button onclick="removeClient('${client.name}')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all" title="Remover Cliente">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function toggleBlockClient(clientName) {
  let clients = JSON.parse(localStorage.getItem('clients') || '[]');
  clients = clients.map(c => {
    if (c.name.toLowerCase() === clientName.toLowerCase()) {
      c.blocked = !c.blocked;
    }
    return c;
  });
  localStorage.setItem('clients', JSON.stringify(clients));
  renderBarberDashboard();
  showNotificationToast('Cadastro Atualizado', `Status do cliente <strong>${clientName}</strong> foi alterado.`);
}

function removeClient(clientName) {
  if (!confirm(`Deseja realmente excluir permanentemente a conta do cliente "${clientName}"?`)) return;

  let clients = JSON.parse(localStorage.getItem('clients') || '[]');
  clients = clients.filter(c => c.name.toLowerCase() !== clientName.toLowerCase());
  localStorage.setItem('clients', JSON.stringify(clients));
  
  renderBarberDashboard();
  showNotificationToast('Cliente Removido', `A conta de <strong>${clientName}</strong> foi deletada.`);
}

function renderFinancialMetrics() {
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

  // Faturamento = soma de todos os finalizados (completed)
  const revenue = appointments
    .filter(app => app.status === 'completed')
    .reduce((sum, app) => sum + app.totalPrice, 0);

  // Despesas = soma das saídas cadastradas
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Lucro líquido
  const profit = revenue - totalExpenses;

  // Atualiza elementos de texto
  document.getElementById('metric-revenue').innerText = `R$ ${revenue.toFixed(2)}`;
  document.getElementById('metric-expenses').innerText = `R$ ${totalExpenses.toFixed(2)}`;
  
  const profitEl = document.getElementById('metric-profit');
  profitEl.innerText = `R$ ${profit.toFixed(2)}`;
  if (profit >= 0) {
    profitEl.className = "text-xl sm:text-3xl font-black text-gold-500 italic";
  } else {
    profitEl.className = "text-xl sm:text-3xl font-black text-rose-500 italic";
  }
}

function renderExpenses() {
  const list = document.getElementById('expenses-list');
  if (!list) return;

  const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

  if (expenses.length === 0) {
    list.innerHTML = `
      <p class="text-xs text-stone-500 italic text-center py-8">Nenhuma despesa lançada.</p>
    `;
    return;
  }

  // Sort by date (descending)
  expenses.sort((a, b) => b.id - a.id);

  list.innerHTML = expenses.map(exp => `
    <div class="flex justify-between items-center bg-stone-950 p-3 rounded-xl border border-stone-850">
      <div>
        <p class="text-sm font-bold text-white">${exp.description}</p>
        <span class="text-[10px] text-stone-500">${formatDateString(exp.date)}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-rose-500 font-bold">- R$ ${exp.amount.toFixed(2)}</span>
        <button onclick="deleteExpense(${exp.id})" class="text-stone-500 hover:text-red-500 transition-colors p-1" title="Excluir">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function addExpense(event) {
  event.preventDefault();

  const descInput = document.getElementById('expense-desc');
  const amountInput = document.getElementById('expense-amount');

  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!description || isNaN(amount) || amount <= 0) return;

  const today = new Date().toISOString().split('T')[0];

  const newExpense = {
    id: Date.now(),
    description,
    amount,
    date: today
  };

  const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  expenses.push(newExpense);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  // Limpa formulário e recarrega
  descInput.value = '';
  amountInput.value = '';
  
  renderBarberDashboard();
}

function deleteExpense(id) {
  if (!confirm('Excluir esta saída?')) return;

  let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  expenses = expenses.filter(exp => exp.id !== id);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  renderBarberDashboard();
}

function filterBarberDashboard(barberId) {
  activeDashboardFilter = barberId;
  
  // Atualiza estilo dos botões
  ['all', 'betao', 'th'].forEach(btn => {
    const el = document.getElementById(`filter-barber-${btn}`);
    if (el) {
      if (btn === barberId) {
        el.className = "px-3 py-1.5 rounded-lg font-bold transition-all text-white bg-stone-850";
      } else {
        el.className = "px-3 py-1.5 rounded-lg font-bold transition-all text-stone-400 hover:text-white";
      }
    }
  });

  renderDashboardAppointments();
}

function renderDashboardAppointments() {
  const container = document.getElementById('dashboard-appointments-list');
  if (!container) return;

  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  
  // Filtra de acordo com a aba e status ativo
  const filtered = appointments.filter(app => {
    if (app.status === 'cancelled') return false;
    
    if (activeDashboardFilter === 'all') return true;
    return app.barberId === activeDashboardFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <p class="text-xs text-stone-500 italic text-center py-16">Nenhum agendamento encontrado para este filtro.</p>
    `;
    return;
  }

  // Ordena por data e hora (mais recentes/proximos primeiro)
  filtered.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  container.innerHTML = filtered.map(app => {
    const isCompleted = app.status === 'completed';
    return `
      <div class="bg-stone-950 border border-stone-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-white uppercase italic text-sm leading-snug">${app.serviceNames}</span>
            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
              isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gold-500/10 text-gold-400'
            }">${isCompleted ? 'Concluído' : 'Em Aberto'}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-stone-400 mt-2">
            <span>Cliente: <strong class="text-stone-300 font-medium">${app.clientName}</strong> (${app.clientPhone})</span>
            <span>Atendente: <strong class="text-stone-300 font-medium">${app.barberName}</strong></span>
            <span>Data/Hora: <strong class="text-stone-300 font-medium">${formatDateString(app.date)} às ${app.time}</strong></span>
            <span class="text-gold-500">Valor: R$ ${app.totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 self-end md:self-center">
          ${!isCompleted ? `
            <button onclick="completeAppointment('${app.id}')" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Concluir
            </button>
          ` : ''}
          <button onclick="deleteDashboardAppointment('${app.id}')" class="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all" title="Cancelar Agendamento">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function completeAppointment(appId) {
  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments = appointments.map(app => {
    if (app.id === appId) {
      app.status = 'completed';
    }
    return app;
  });
  localStorage.setItem('appointments', JSON.stringify(appointments));

  // Recarrega dashboard e listagem do cliente
  renderBarberDashboard();
  renderAppointments();
}

function deleteDashboardAppointment(appId) {
  if (!confirm('Deseja cancelar este agendamento permanentemente?')) return;

  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments = appointments.map(app => {
    if (app.id === appId) {
      app.status = 'cancelled';
    }
    return app;
  });
  localStorage.setItem('appointments', JSON.stringify(appointments));

  // Recarrega dashboard e listagem do cliente
  renderBarberDashboard();
  renderAppointments();
}

/* ==========================================================================
   SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL (MÚLTIPLAS ABAS)
   ========================================================================== */
function playNotificationSound() {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tom 1 (Dó 5)
    const osc1 = context.createOscillator();
    const gain1 = context.createGain();
    osc1.connect(gain1);
    gain1.connect(context.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, context.currentTime); 
    gain1.gain.setValueAtTime(0.1, context.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
    osc1.start(context.currentTime);
    osc1.stop(context.currentTime + 0.15);
    
    // Tom 2 (Mi 5) a 150ms de delay
    setTimeout(() => {
      const osc2 = context.createOscillator();
      const gain2 = context.createGain();
      osc2.connect(gain2);
      gain2.connect(context.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, context.currentTime); 
      gain2.gain.setValueAtTime(0.1, context.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      osc2.start(context.currentTime);
      osc2.stop(context.currentTime + 0.3);
    }, 150);
  } catch (e) {
    console.log('AudioContext not allowed or not supported yet: ', e);
  }
}

function showNotificationToast(title, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = "bg-stone-900 border border-gold-500/30 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 transform translate-x-12 opacity-0 transition-all duration-300 border-l-4 border-l-gold-500 pointer-events-auto w-full max-w-sm";
  
  toast.innerHTML = `
    <div class="p-2 bg-gold-500/10 text-gold-500 rounded-xl shrink-0">
      <i data-lucide="bell" class="w-5 h-5"></i>
    </div>
    <div class="flex-1">
      <h4 class="font-bold text-sm text-gold-400">${title}</h4>
      <p class="text-xs text-stone-300 mt-0.5 leading-snug">${message}</p>
    </div>
    <button onclick="this.parentElement.remove()" class="text-stone-500 hover:text-white transition-colors shrink-0">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Som de notificação
  playNotificationSound();

  // Efeito fade-in
  setTimeout(() => {
    toast.classList.remove('translate-x-12', 'opacity-0');
  }, 50);

  // Auto-remove em 6 segundos
  setTimeout(() => {
    toast.classList.add('translate-x-12', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 6000);
}

// Ouvinte de eventos Storage para atualizações de abas
window.addEventListener('storage', (event) => {
  if (event.key === 'appointments') {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (loggedUser && (loggedUser.role === 'barber' || loggedUser.role === 'admin')) {
      const oldApps = JSON.parse(event.oldValue || '[]');
      const newApps = JSON.parse(event.newValue || '[]');
      
      if (newApps.length > oldApps.length) {
        // Encontra o agendamento adicionado
        const added = newApps.filter(n => !oldApps.some(o => o.id === n.id));
        added.forEach(app => {
          if (app.status === 'scheduled') {
            showNotificationToast(
              'Novo Agendamento Recebido!',
              `O cliente <strong>${app.clientName}</strong> agendou com <strong>${app.barberName}</strong> para o dia <strong>${formatDateString(app.date)}</strong> às <strong>${app.time}</strong>.`
            );
          }
        });
      }
      
      // Recarrega dashboard
      renderBarberDashboard();
    }
  }
});
