import { estaLogado, logar } from './login.js';
import {
  adicionarValidacao,
  desabilitarBotao,
  formEstaValido,
} from './utils.js';

const form = document.querySelector('.form_cad');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const submit = document.getElementById('acessar');
const loginStatus = document.getElementById('loginStatus');

document.addEventListener('DOMContentLoaded', () => {
  estaLogado();

  const formValido = {
    email: false,
    senha: false,
  };

  adicionarValidacao(formValido, submit, inputEmail, 'email', {
    vazio: true,
    removerEspacos: true,
    email: true,
  });

  adicionarValidacao(formValido, submit, inputPassword, 'senha', {
    vazio: true,
  });

  desabilitarBotao(formValido, submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!formEstaValido(formValido)) return;

    const config = {
      method: 'POST',
      headers: {
        Accept: '*/* , application/json, text/plain',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: inputEmail.value,
        password: inputPassword.value,
      }),
    };

    submit.disabled = true;
    loginStatus.style.display = 'none';

    try {
      const login = await fetch(
        'http://todo-api.ctd.academy:3000/v1/users/login',
        config
      );

      if (!login.ok) throw new Error(login);

      const res = await login.json();

      logar(res.jwt);
    } catch (err) {
      const errors =
        err.status !== 500 ? 'Login e/ou Senha inválidos' : 'Erro interno';
      loginStatus.innerText = errors;
      loginStatus.style.display = 'block';
      submit.disabled = false;
    }
  });
});
