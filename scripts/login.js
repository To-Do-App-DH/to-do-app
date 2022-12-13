function logar(token) {
  window.localStorage.setItem('token', token);
  window.location.href = '/tarefas.html';
}

function deslogar() {
  window.localStorage.removeItem('token');
  window.location.href = '/index.html';
}

function getToken() {
  const token = window.localStorage.getItem('token');
  if (!token) window.location.href = '/index.html';
  return token;
}

function estaLogado() {
  const token = window.localStorage.getItem('token');
  if (!token) return;
  window.location.href = '/tarefas.html';
}

export { logar, deslogar, getToken, estaLogado };
