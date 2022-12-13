
import { adicionarValidacao, desabilitarBotao, formEstaValido, mostrarErro } from "./utils.js";
import { mostrarSpinner, ocultarSpinner } from "./loaders.js";
import { logar } from "./login.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector(".form_cad");
  const nome = document.getElementById("nome");
  const sobrenome = document.getElementById("sobrenome");
  const email = document.getElementById("email");
  const password = document.getElementById("senha");
  const confirmPassword = document.getElementById("confirmSenha");
  const submit = document.getElementById("submit");
  const status = document.getElementById("creationstatus");

  const formularioValido = {
    nome: false,
    sobrenome: false,
    email: false,
    senha: false,
    confirmSenha: false,
  }

  adicionarValidacao(formularioValido, submit, nome, 'nome', {
    removerEspacosDuplicados: true,
    vazio: true
  });

  adicionarValidacao(formularioValido, submit, sobrenome, 'sobrenome', {
    removerEspacosDuplicados: true,
    vazio: true
  });

  adicionarValidacao(formularioValido, submit, email, 'email', {
    removerEspacosDuplicados: true,
    vazio: true,
    email: true
  });

  adicionarValidacao(formularioValido, submit, password, 'senha', {
    vazio: true
  }, () => {
    if (!password.value || !confirmPassword.value) {
      return false;
    }
    const passwordValido = password.value === confirmPassword.value;
    formularioValido.senha = passwordValido;
    formularioValido.confirmSenha = passwordValido;
    mostrarErro(formularioValido, password, 'senha');
    mostrarErro(formularioValido, confirmPassword, 'confirmSenha');
    return passwordValido;
  });

  adicionarValidacao(formularioValido, submit, confirmPassword, 'confirmSenha', {
    vazio: true
  }, () => {
    if (!password.value || !confirmPassword.value) {
      return false;
    }
    const passwordValido = password.value === confirmPassword.value;
    formularioValido.senha = passwordValido;
    formularioValido.confirmSenha = passwordValido;
    mostrarErro(formularioValido, password, 'senha');
    mostrarErro(formularioValido, confirmPassword, 'confirmSenha');
    return passwordValido;
  });

  desabilitarBotao(formularioValido, submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    mostrarSpinner();

    if (!formEstaValido(formularioValido)) return;

    status.style.display = "none";

    const body = {
      firstName: nome.value,
      lastName: sobrenome.value,
      email: email.value,
      password: password.value
    }
    const reqConfig = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(body)
    };
    try {
      const cadastrado = await fetch("http://todo-api.ctd.academy:3000/v1/users", reqConfig);
      if (!cadastrado.ok) throw new Error(cadastrado.status);

      const resposta = await cadastrado.json();
      logar(resposta.jwt);
      ocultarSpinner();

    } catch (error) {
      if (error.message === "400") {
        status.innerText = "Usuário já cadastrado.";
        status.style.display = "block";
        ocultarSpinner();
        return;
      }
      status.innerText = "Erro ao tentar criar o usuário, tente novamente.";
      status.style.display = "block";
      ocultarSpinner();
    } 
  })
})
