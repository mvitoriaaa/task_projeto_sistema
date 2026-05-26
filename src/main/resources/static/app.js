// ── Proteção de rota ──────────────────────────────────────────────────────────
if (!sessionStorage.getItem('logado')) window.location.href = 'login.html';

function sair() {
  sessionStorage.removeItem('logado');
  window.location.href = 'login.html';
}

// ── Navegação ─────────────────────────────────────────────────────────────────
function mostrarSecao(id, btn) {
  document.querySelectorAll('.secao').forEach(s => s.classList.add('oculto'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('ativo'));
  document.getElementById(id).classList.remove('oculto');
  btn.classList.add('ativo');

  if (id === 'setores')      listarSetores();
  if (id === 'fabricas')     listarFabricas();
  if (id === 'funcionarios') { carregarSetores(); listarFuncionarios(); }
}

// ── Modal de confirmação ──────────────────────────────────────────────────────
function confirmar(mensagem) {
  return new Promise(resolve => {
    document.getElementById('modal-texto').textContent = mensagem;
    document.getElementById('modal').classList.remove('oculto');

    document.getElementById('modal-sim').onclick = () => {
      document.getElementById('modal').classList.add('oculto');
      resolve(true);
    };
    document.getElementById('modal-nao').onclick = () => {
      document.getElementById('modal').classList.add('oculto');
      resolve(false);
    };
  });
}

// ── Requisições com log de erro ───────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const metodo = options.method || 'GET';
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const texto = await res.text().catch(() => '');
      console.error(`[API] ${metodo} ${url} → ${res.status} ${res.statusText}`, texto || '(sem body)');
      return null;
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.error(`[API] Erro de rede: ${metodo} ${url}`, err.message);
    return null;
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const _SVG_ALERTA = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const _SVG_OK     = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

function mostrarToast(mensagem, tipo = 'erro') {
  const icone = tipo === 'ok' ? _SVG_OK : _SVG_ALERTA;
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span class="toast-icone">${icone}</span>${mensagem}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('saindo');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}

// ── Utilitários ───────────────────────────────────────────────────────────────
const json = () => ({ 'Content-Type': 'application/json' });

function limpar(...ids) {
  ids.forEach(id => document.getElementById(id).value = '');
}

function marcarErro(id, condicao) {
  document.getElementById(id).classList.toggle('erro', condicao);
  return condicao;
}

// Rola suavemente até o formulário
function irParaForm(formId) {
  document.getElementById(formId).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Salva posição antes de recarregar a tabela e restaura depois
async function recarregarComPosicao(fn) {
  const y = window.scrollY;
  await fn();
  window.scrollTo({ top: y, behavior: 'instant' });
}

// ── SETORES ───────────────────────────────────────────────────────────────────
async function listarSetores() {
  console.log('[Setores] Carregando...');
  const data = await apiFetch('/setores');
  if (data === null) {
    console.error('[Setores] Falha ao carregar — verifique se o servidor está rodando');
    return;
  }
  console.log(`[Setores] ${data.length} registro(s) recebido(s)`);

  const tbody = document.getElementById('tabela-setores');
  const msg   = document.getElementById('msg-setores');

  if (data.length === 0) {
    tbody.innerHTML = '';
    msg.classList.remove('oculto');
    return;
  }
  msg.classList.add('oculto');
  tbody.innerHTML = data.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.nome}</td>
      <td class="acoes">
        <button class="btn-editar"  onclick="editarSetor(${s.id},'${s.nome}')">Editar</button>
        <button class="btn-deletar" onclick="deletarSetor(${s.id},'${s.nome}')">Deletar</button>
      </td>
    </tr>`).join('');
}

document.getElementById('form-setor').addEventListener('submit', async e => {
  e.preventDefault();
  const nome = document.getElementById('setor-nome').value.trim();

  if (marcarErro('setor-nome', !nome)) {
    mostrarToast('Informe o nome do setor.');
    return;
  }

  const id = document.getElementById('setor-id').value;
  if (id) {
    await apiFetch(`/setores/${id}`, { method: 'PUT', headers: json(), body: JSON.stringify({ nome }) });
  } else {
    await apiFetch('/setores', { method: 'POST', headers: json(), body: JSON.stringify({ nome }) });
  }
  limpar('setor-id', 'setor-nome');
  await recarregarComPosicao(listarSetores);
});

function editarSetor(id, nome) {
  document.getElementById('setor-id').value   = id;
  document.getElementById('setor-nome').value = nome;
  irParaForm('form-setor');
}

async function deletarSetor(id, nome) {
  const ok = await confirmar(`Deletar o setor "${nome}"?`);
  if (!ok) return;
  await apiFetch(`/setores/${id}`, { method: 'DELETE' });
  listarSetores();
}

// ── TIPOS DE FÁBRICA ──────────────────────────────────────────────────────────
async function listarFabricas() {
  console.log('[Fábricas] Carregando...');
  const data = await apiFetch('/tipos-fabrica');
  if (data === null) {
    console.error('[Fábricas] Falha ao carregar — verifique se o servidor está rodando');
    return;
  }
  console.log(`[Fábricas] ${data.length} registro(s) recebido(s)`);

  const tbody = document.getElementById('tabela-fabricas');
  const msg   = document.getElementById('msg-fabricas');

  if (data.length === 0) {
    tbody.innerHTML = '';
    msg.classList.remove('oculto');
    return;
  }
  msg.classList.add('oculto');
  tbody.innerHTML = data.map(f => `
    <tr>
      <td>${f.id}</td>
      <td>${f.nome}</td>
      <td>${f.descricao ?? '—'}</td>
      <td class="acoes">
        <button class="btn-editar"  onclick="editarFabrica(${f.id},'${f.nome}','${f.descricao ?? ''}')">Editar</button>
        <button class="btn-deletar" onclick="deletarFabrica(${f.id},'${f.nome}')">Deletar</button>
      </td>
    </tr>`).join('');
}

document.getElementById('form-fabrica').addEventListener('submit', async e => {
  e.preventDefault();
  const nome      = document.getElementById('fabrica-nome').value.trim();
  const descricao = document.getElementById('fabrica-descricao').value.trim();

  if (marcarErro('fabrica-nome', !nome)) {
    mostrarToast('Informe o nome da fábrica.');
    return;
  }

  const id = document.getElementById('fabrica-id').value;
  if (id) {
    await apiFetch(`/tipos-fabrica/${id}`, { method: 'PUT', headers: json(), body: JSON.stringify({ nome, descricao }) });
  } else {
    await apiFetch('/tipos-fabrica', { method: 'POST', headers: json(), body: JSON.stringify({ nome, descricao }) });
  }
  limpar('fabrica-id', 'fabrica-nome', 'fabrica-descricao');
  await recarregarComPosicao(listarFabricas);
});

function editarFabrica(id, nome, descricao) {
  document.getElementById('fabrica-id').value        = id;
  document.getElementById('fabrica-nome').value      = nome;
  document.getElementById('fabrica-descricao').value = descricao;
  irParaForm('form-fabrica');
}

async function deletarFabrica(id, nome) {
  const ok = await confirmar(`Deletar o tipo de fábrica "${nome}"?`);
  if (!ok) return;
  await apiFetch(`/tipos-fabrica/${id}`, { method: 'DELETE' });
  listarFabricas();
}

// ── FUNCIONÁRIOS ──────────────────────────────────────────────────────────────
async function carregarSetores() {
  const data = await apiFetch('/setores');
  if (data === null) {
    console.error('[Funcionários] Falha ao carregar setores para os dropdowns');
    return;
  }

  const selectForm = document.getElementById('func-setor');
  selectForm.innerHTML = '<option value="">-- Setor --</option>' +
    data.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');

  const selectFiltro = document.getElementById('filtro-func-setor');
  selectFiltro.innerHTML = '<option value="">Todos os setores</option>' +
    data.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
}

async function listarFuncionarios() {
  console.log('[Funcionários] Carregando...');
  const status  = document.getElementById('filtro-func-status').value;
  const setorId = document.getElementById('filtro-func-setor').value;

  let url  = '/funcionarios';
  const qs = [];
  if (status) qs.push(`status=${status}`);
  if (qs.length) url += '?' + qs.join('&');

  let data = await apiFetch(url);
  if (data === null) {
    console.error('[Funcionários] Falha ao carregar — verifique se o servidor está rodando');
    return;
  }
  console.log(`[Funcionários] ${data.length} registro(s) recebido(s)`);

  if (setorId) data = data.filter(f => f.setor && f.setor.id == setorId);

  const tbody = document.getElementById('tabela-funcionarios');
  const msg   = document.getElementById('msg-funcionarios');

  if (data.length === 0) {
    tbody.innerHTML = '';
    msg.classList.remove('oculto');
    return;
  }
  msg.classList.add('oculto');
  tbody.innerHTML = data.map(f => `
    <tr>
      <td>${f.id}</td>
      <td>${f.nome}</td>
      <td>${f.cargo}</td>
      <td><span class="badge ${f.status}">${f.status}</span></td>
      <td>${f.setor ? f.setor.nome : '—'}</td>
      <td>${f.dataAdmissao ?? '—'}</td>
      <td class="acoes">
        <button class="btn-editar"  onclick="editarFuncionario(${f.id})">Editar</button>
        <button class="btn-deletar" onclick="deletarFuncionario(${f.id},'${f.nome}')">Deletar</button>
      </td>
    </tr>`).join('');
}

function toggleDemissao() {
  const isDemitido = document.getElementById('func-status').value === 'DEMITIDO';
  document.getElementById('func-demissao').classList.toggle('oculto', !isDemitido);
}

document.getElementById('form-funcionario').addEventListener('submit', async e => {
  e.preventDefault();
  const nome     = document.getElementById('func-nome').value.trim();
  const cargo    = document.getElementById('func-cargo').value.trim();
  const status   = document.getElementById('func-status').value;
  const admissao = document.getElementById('func-admissao').value;
  const demissao = document.getElementById('func-demissao').value;
  const setorId  = document.getElementById('func-setor').value;

  let invalido = false;
  const erros = [];

  if (marcarErro('func-nome', !nome))   { invalido = true; erros.push('Nome'); }
  if (marcarErro('func-cargo', !cargo)) { invalido = true; erros.push('Cargo'); }
  if (status === 'DEMITIDO' && marcarErro('func-demissao', !demissao)) {
    invalido = true;
    erros.push('Data de demissão');
  }

  if (invalido) {
    mostrarToast(`Preencha os campos obrigatórios: ${erros.join(', ')}.`);
    return;
  }

  const body = {
    nome, cargo, status,
    dataAdmissao: admissao || null,
    dataDemissao: demissao || null,
    setor: setorId ? { id: Number(setorId) } : null
  };

  const id = document.getElementById('func-id').value;
  if (id) {
    await apiFetch(`/funcionarios/${id}`, { method: 'PUT', headers: json(), body: JSON.stringify(body) });
  } else {
    await apiFetch('/funcionarios', { method: 'POST', headers: json(), body: JSON.stringify(body) });
  }

  limpar('func-id', 'func-nome', 'func-cargo', 'func-admissao', 'func-demissao');
  document.getElementById('func-status').value = 'ADMITIDO';
  document.getElementById('func-setor').value  = '';
  document.getElementById('func-demissao').classList.add('oculto');
  await recarregarComPosicao(listarFuncionarios);
});

async function editarFuncionario(id) {
  const f = await apiFetch(`/funcionarios/${id}`);
  if (!f) {
    console.error(`[Funcionários] Falha ao buscar funcionário id=${id}`);
    return;
  }
  document.getElementById('func-id').value       = f.id;
  document.getElementById('func-nome').value     = f.nome;
  document.getElementById('func-cargo').value    = f.cargo;
  document.getElementById('func-status').value   = f.status;
  document.getElementById('func-admissao').value = f.dataAdmissao ?? '';
  document.getElementById('func-demissao').value = f.dataDemissao ?? '';
  document.getElementById('func-setor').value    = f.setor ? f.setor.id : '';
  toggleDemissao();
  irParaForm('form-funcionario');
}

async function deletarFuncionario(id, nome) {
  const ok = await confirmar(`Deletar o funcionário "${nome}"?`);
  if (!ok) return;
  await apiFetch(`/funcionarios/${id}`, { method: 'DELETE' });
  listarFuncionarios();
}

// Carrega a primeira aba ao abrir
listarSetores();
