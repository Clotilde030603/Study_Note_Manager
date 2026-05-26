// window.APP_CONFIG.API_BASE_URL은 컨테이너 환경변수로 생성되는 env.js에서 주입된다.
const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || '/api';

const elements = {
  noteForm: document.getElementById('noteForm'),
  title: document.getElementById('title'),
  content: document.getElementById('content'),
  category: document.getElementById('category'),
  isImportant: document.getElementById('isImportant'),
  importantToggle: document.getElementById('importantToggle'),
  searchInput: document.getElementById('searchInput'),
  filterCategory: document.getElementById('filterCategory'),
  filterImportant: document.getElementById('filterImportant'),
  filterImportantToggle: document.getElementById('filterImportantToggle'),
  refreshButton: document.getElementById('refreshButton'),
  notesContainer: document.getElementById('notesContainer'),
  noteCount: document.getElementById('noteCount'),
  message: document.getElementById('message'),
  formTitle: document.getElementById('formTitle'),
  submitButton: document.getElementById('submitButton'),
  cancelEditButton: document.getElementById('cancelEditButton')
};

let editingNoteId = null;

function syncStarToggle(button, checked, activeLabel = '★', inactiveLabel = '☆') {
  if (!button) return;

  button.classList.toggle('is-active', checked);
  button.setAttribute('aria-pressed', String(checked));

  const icon = button.querySelector('.star-icon');
  if (icon) {
    icon.textContent = checked ? activeLabel : inactiveLabel;
  }
}

function syncImportantToggles() {
  syncStarToggle(elements.importantToggle, elements.isImportant.checked);
  syncStarToggle(elements.filterImportantToggle, elements.filterImportant.checked);
}

function setMessage(text, isError = false) {
  elements.message.textContent = text;
  elements.message.classList.toggle('error', isError);
}

function setEditMode(note = null) {
  editingNoteId = note ? note.id : null;
  elements.formTitle.textContent = note ? '노트 수정' : '새 노트 작성';
  elements.submitButton.textContent = note ? '노트 수정' : '노트 추가';
  elements.cancelEditButton.classList.toggle('hidden', !note);
}

function ensureCategoryOption(category) {
  const value = category || 'General';
  const exists = Array.from(elements.category.options).some((option) => option.value === value);

  if (!exists) {
    const option = new Option(value, value);
    elements.category.add(option);
  }
}

function fillForm(note) {
  elements.title.value = note.title || '';
  elements.content.value = note.content || '';
  ensureCategoryOption(note.category);
  elements.category.value = note.category || 'General';
  elements.isImportant.checked = Boolean(note.isImportant);
  syncImportantToggles();
  setEditMode(note);
  elements.title.focus();
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetFormMode() {
  elements.noteForm.reset();
  syncImportantToggles();
  setEditMode(null);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `API request failed with status ${response.status}`);
  }

  return payload;
}

async function checkApiHealth() {
  // UI에는 상태 배지를 노출하지 않지만, 초기 로딩 시 API 연결 상태를 조용히 확인한다.
  try {
    await requestJson('/health');
  } catch (error) {
    console.warn('API health check failed:', error.message);
  }
}

function buildQuery() {
  const params = new URLSearchParams();
  const search = elements.searchInput.value.trim();
  const category = elements.filterCategory.value;

  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (elements.filterImportant.checked) params.set('important', 'true');

  return params.toString();
}

// 노트 목록 조회, 검색, 카테고리 필터, 중요 필터는 GET /api/notes 쿼리스트링으로 처리한다.
async function loadNotes() {
  try {
    setMessage('노트를 불러오는 중입니다.');
    const query = buildQuery();
    const result = await requestJson(`/notes${query ? `?${query}` : ''}`);
    renderNotes(result.data || []);
    setMessage('');
  } catch (error) {
    elements.notesContainer.innerHTML = '';
    elements.noteCount.textContent = '노트 목록 조회 실패';
    setMessage(error.message, true);
  }
}

function renderNotes(notes) {
  elements.noteCount.textContent = `${notes.length}개의 노트`;

  if (!notes.length) {
    elements.notesContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" aria-hidden="true">✦</span>
        <strong>아직 작성된 노트가 없습니다.</strong>
        <span>왼쪽에서 첫 노트를 작성해보세요.</span>
      </div>
    `;
    return;
  }

  elements.notesContainer.innerHTML = notes.map((note) => {
    const date = note.createdAt ? new Date(note.createdAt).toLocaleString('ko-KR') : '';
    return `
      <article class="note-card ${note.isImportant ? 'important' : ''}">
        <h3>${escapeHtml(note.title)}</h3>
        <div class="note-meta">
          <span class="badge">${escapeHtml(note.category || 'General')}</span>
          ${note.isImportant ? '<span class="badge important">중요</span>' : ''}
          <span>${escapeHtml(date)}</span>
        </div>
        <p class="note-content">${escapeHtml(note.content)}</p>
        <div class="note-actions">
          <button class="secondary-button" type="button" data-action="edit" data-id="${note.id}">수정</button>
          <button class="important-button star-action ${note.isImportant ? 'is-active' : ''}" type="button" data-action="important" data-id="${note.id}" data-important="${note.isImportant}" aria-pressed="${note.isImportant}">
            <span class="star-icon" aria-hidden="true">${note.isImportant ? '★' : '☆'}</span>
            <span>${note.isImportant ? '중요 해제' : '중요 표시'}</span>
          </button>
          <button class="delete-button" type="button" data-action="delete" data-id="${note.id}">삭제</button>
        </div>
      </article>
    `;
  }).join('');
}

// 노트 작성/수정 폼은 같은 입력 폼을 재사용하며 POST 또는 PUT JSON 요청을 전송한다.
async function handleSubmitNote(event) {
  event.preventDefault();

  const note = {
    title: elements.title.value.trim(),
    content: elements.content.value.trim(),
    category: elements.category.value,
    isImportant: elements.isImportant.checked
  };

  if (!note.title || !note.content) {
    setMessage('제목과 내용을 입력하세요.', true);
    return;
  }

  try {
    if (editingNoteId) {
      await requestJson(`/notes/${editingNoteId}`, {
        method: 'PUT',
        body: JSON.stringify(note)
      });
      setMessage('노트가 수정되었습니다.');
    } else {
      await requestJson('/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      });
      setMessage('노트가 추가되었습니다.');
    }

    resetFormMode();
    await loadNotes();
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function handleNoteAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  try {
    if (action === 'edit') {
      const result = await requestJson(`/notes/${id}`);
      fillForm(result.data);
      setMessage('수정할 내용을 입력한 뒤 노트 수정을 누르세요.');
      return;
    }

    if (action === 'delete') {
      await requestJson(`/notes/${id}`, { method: 'DELETE' });
      if (editingNoteId === Number(id)) {
        resetFormMode();
      }
      setMessage('노트가 삭제되었습니다.');
    }

    if (action === 'important') {
      const nextImportant = button.dataset.important !== 'true';
      await requestJson(`/notes/${id}/important`, {
        method: 'PATCH',
        body: JSON.stringify({ isImportant: nextImportant })
      });
      setMessage('중요 표시가 변경되었습니다.');
    }

    await loadNotes();
  } catch (error) {
    setMessage(error.message, true);
  }
}

function debounce(callback, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function bindEvents() {
  elements.noteForm.addEventListener('submit', handleSubmitNote);
  elements.notesContainer.addEventListener('click', handleNoteAction);
  elements.refreshButton.addEventListener('click', loadNotes);
  elements.cancelEditButton.addEventListener('click', () => {
    resetFormMode();
    setMessage('수정을 취소했습니다.');
  });
  elements.importantToggle.addEventListener('click', () => {
    elements.isImportant.checked = !elements.isImportant.checked;
    syncImportantToggles();
  });
  elements.filterImportantToggle.addEventListener('click', () => {
    elements.filterImportant.checked = !elements.filterImportant.checked;
    syncImportantToggles();
    loadNotes();
  });
  elements.searchInput.addEventListener('input', debounce(loadNotes));
  elements.filterCategory.addEventListener('change', loadNotes);
  elements.filterImportant.addEventListener('change', () => {
    syncImportantToggles();
    loadNotes();
  });
}

setEditMode();
bindEvents();
syncImportantToggles();
checkApiHealth();
loadNotes();
