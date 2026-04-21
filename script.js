// =============================================================================
// script.js — A-Note
//
// ESTRATÉGIA DE PÁGINA ÚNICA:
//   Cada módulo verifica se seus elementos existem antes de rodar.
//   Assim o mesmo arquivo funciona em login.html e list.html sem
//   lançar erros no console quando um elemento não está presente.
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
// CHAVES DO LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_USERS_KEY  = 'anote_users';        // Array de { email, password }
const STORAGE_NOTES_KEY  = 'anote_notes';        // Array de { id, title, text }
const STORAGE_LOGGED_KEY = 'anote_logged_user';  // String com e-mail da sessão ativa


// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

/** Lê e faz parse de um item do localStorage. Retorna [] se não existir. */
function getFromStorage(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

/** Serializa e salva um valor no localStorage. */
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Valida formato básico de e-mail. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Exibe (ou atualiza) uma mensagem de feedback dentro de um container.
 * Cria um <p class="js-message"> da primeira vez; reutiliza nas demais.
 */
function showMessage(container, message, isError = true) {
  let msg = container.querySelector('.js-message');
  if (!msg) {
    msg = document.createElement('p');
    msg.classList.add('js-message');
    msg.style.cssText = 'margin: 8px 0; font-size: 0.875rem; font-weight: 500;';
    container.prepend(msg);
  }
  msg.textContent = message;
  msg.style.color = isError ? '#e74c3c' : '#27ae60';
}


// =============================================================================
// MÓDULO — PÁGINA DE LOGIN / CADASTRO  (login.html)
// Detectado pela presença da classe .formulario-login
// =============================================================================

function initLoginPage() {

  // Guarda de entrada: se o formulário não existir, não é esta página
  const form = document.querySelector('.formulario-login');
  if (!form) return;

  // Seleção por tipo pois os inputs não possuem ID no HTML
  const emailInput    = form.querySelector('input[type="email"]');
  const passwordInput = form.querySelector('input[type="password"]');

  // Botões identificados pela ordem de aparição no HTML
  const buttons       = form.querySelectorAll('button[type="button"]');
  const btnEntrar     = buttons[0]; // "Entrar"
  const btnCriarConta = buttons[1]; // "Criar Conta"

  /** Valida os campos e exibe mensagem de erro se necessário. */
  function validateFields(email, password, checkLength = false) {
    if (!email || !password) {
      showMessage(form, 'Preencha todos os campos.');
      return false;
    }
    if (!isValidEmail(email)) {
      showMessage(form, 'Informe um e-mail válido (ex: nome@email.com).');
      return false;
    }
    if (checkLength && password.length < 6) {
      showMessage(form, 'A senha deve ter no mínimo 6 caracteres.');
      return false;
    }
    return true;
  }

  // ── Entrar (Login) ────────────────────────────────────────────────────────
  btnEntrar.addEventListener('click', () => {
    const email    = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateFields(email, password)) return;

    const users = getFromStorage(STORAGE_USERS_KEY);
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
      showMessage(form, 'E-mail ou senha incorretos.');
      return;
    }

    saveToStorage(STORAGE_LOGGED_KEY, user.email);
    showMessage(form, 'Login realizado! Redirecionando…', false);
    setTimeout(() => { window.location.href = 'list.html'; }, 1200);
  });

  // ── Criar Conta (Cadastro) ────────────────────────────────────────────────
  btnCriarConta.addEventListener('click', () => {
    const email    = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateFields(email, password, true)) return;

    const users         = getFromStorage(STORAGE_USERS_KEY);
    const alreadyExists = users.some(u => u.email === email);

    if (alreadyExists) {
      showMessage(form, 'Este e-mail já está cadastrado. Faça login.');
      return;
    }

    users.push({ email, password });
    saveToStorage(STORAGE_USERS_KEY, users);
    saveToStorage(STORAGE_LOGGED_KEY, email);

    showMessage(form, 'Conta criada! Redirecionando…', false);
    setTimeout(() => { window.location.href = 'list.html'; }, 1200);
  });
}


// =============================================================================
// MÓDULO — PÁGINA DE LISTAGEM DE NOTAS  (list.html)
// Detectado pela presença do elemento #notes-container
// =============================================================================

function initListPage() {

  // Guarda de entrada: se o container não existir, não é esta página
  const notesContainer = document.getElementById('notes-container');
  if (!notesContainer) return;

  // ── Referências (mantidas do código original) ─────────────────────────────
  const btnExpand   = document.getElementById('btn-expand-note');
  const btnClose    = document.getElementById('btn-close-note');
  const form        = document.getElementById('note-form');
  const searchInput = document.getElementById('search-input');
  const inputTitle  = document.getElementById('note-title');
  const inputText   = document.getElementById('note-text');

  // Array em memória sincronizado com o localStorage.
  // Substitui o `const notas = []` original, que perdia tudo ao recarregar.
  const notas = getFromStorage(STORAGE_NOTES_KEY);

  // ── Funções auxiliares (inalteradas do código original) ───────────────────

  function limparFormulario() {
    inputTitle.value = '';
    inputText.value  = '';
  }

  function criarNota(nota) {
    const article = document.createElement('article');

    const h3 = document.createElement('h3');
    h3.textContent = nota.title;

    const p = document.createElement('p');
    p.textContent = nota.text;

    const btnEdit   = document.createElement('button');
    btnEdit.textContent = 'Editar';

    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'Excluir';

    btnDelete.addEventListener('click', () => {
      deletarNota(article, nota);
    });

    btnEdit.addEventListener('click', () => {
      editarNota(nota, h3, p);
    });

    article.appendChild(h3);
    article.appendChild(p);
    article.appendChild(btnEdit);
    article.appendChild(btnDelete);
    notesContainer.appendChild(article);
  }

  function deletarNota(article, nota) {
    const index = notas.findIndex(n => n.id === nota.id);
    if (index !== -1) {
      notas.splice(index, 1);
    }
    saveToStorage(STORAGE_NOTES_KEY, notas); // persiste a remoção
    article.remove();
  }

  function editarNota(nota, h3, p) {
    const novoTitulo = prompt('Editar título:', nota.title);
    const novoTexto  = prompt('Editar conteúdo:', nota.text);

    if (novoTitulo !== null && novoTexto !== null) {
      nota.title = novoTitulo;
      nota.text  = novoTexto;
      h3.textContent = novoTitulo;
      p.textContent  = novoTexto;
      saveToStorage(STORAGE_NOTES_KEY, notas); // persiste a edição
    }
  }

  // ── Eventos (inalterados do código original) ──────────────────────────────

  btnExpand.addEventListener('click', () => {
    form.hidden = false;
    inputTitle.focus();
  });

  btnClose.addEventListener('click', () => {
    form.hidden = true;
    btnExpand.focus();
    limparFormulario();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = inputTitle.value;
    const text  = inputText.value;

    if (title.trim() === '' || text.trim() === '') {
      alert('Preencha todos os campos');
      return;
    }

    const novaNota = {
      id: Date.now(),
      title,
      text
    };

    notas.push(novaNota);
    saveToStorage(STORAGE_NOTES_KEY, notas); // persiste a criação
    criarNota(novaNota);

    form.hidden = true;
    limparFormulario();
    inputTitle.focus();
  });

  searchInput.addEventListener('input', () => {
    const termo = searchInput.value.toLowerCase();
    const notasDOM = notesContainer.querySelectorAll('article');
    notasDOM.forEach((notaEl) => {
      const texto = notaEl.textContent.toLowerCase();
      notaEl.style.display = texto.includes(termo) ? '' : 'none';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      form.hidden = true;
      limparFormulario();
    }
  });

  // ── Renderiza as notas salvas ao carregar a página ────────────────────────
  notas.forEach(nota => criarNota(nota));
}


// =============================================================================
// PONTO DE ENTRADA
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initListPage();
});