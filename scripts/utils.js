const estaPreenchido = (value) => !!value && value !== '';

const emailValido = (value) =>
  /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(value);

const semEspacos = (value, substituir = '') =>
  value.replace(/\s+/g, substituir);

const formEstaValido = (formularioValido) =>
  Object.keys(formularioValido).every((pos) => formularioValido[pos]);

function adicionarValidacao(
  formularioValido,
  btnSubmit,
  el,
  campoValidacao,
  validacoes,
  callback
) {
  const validacao = (event) => {
    if (validacoes.removerEspacos)
      el.value = semEspacos(event.target.value, '');
    if (validacoes.removerEspacosDuplicados)
      el.value = semEspacos(event.target.value, ' ');
    const email = validacoes.email ? emailValido(event.target.value) : true;
    const tamanhoMin = validacoes.tamanhoMin ? event.target.value.length >= validacoes.tamanhoMin : true;
    const naoVazio = validacoes.vazio
      ? estaPreenchido(event.target.value)
      : true;
    const callbackPersonalizada = callback ? callback() : true;

    formularioValido[campoValidacao] = email && naoVazio && callbackPersonalizada && tamanhoMin;

    desabilitarBotao(formularioValido, btnSubmit);
    mostrarErro(formularioValido, el, campoValidacao);
  };

  if (validacoes.trim) {
    el.addEventListener('change', (event)=>{
      event.target.value = event.target.value.trim();
      desabilitarBotao(formularioValido, btnSubmit);
      mostrarErro(formularioValido, el, campoValidacao);
    });
  }

  el.addEventListener('keyup', validacao);
  el.addEventListener('change', validacao);

}


function desabilitarBotao(formularioValido, btnSubmit) {
  btnSubmit.disabled = !formEstaValido(formularioValido);
}

function mostrarErro(formularioValido, el, campoValidacao) {
  const valid = !!formularioValido[campoValidacao];
  const visibility = valid ? 'hidden' : 'visible';
  const addOrRemError = valid ? 'remove' : 'add';
  const addOrRemSucesso = valid ? 'add' : 'remove';
  el.classList[addOrRemError]('input_fail');
  el.parentElement.querySelector('.errorMsg').style.visibility = visibility;
  el.classList[addOrRemSucesso]('input_ok');

}

export { adicionarValidacao, desabilitarBotao, formEstaValido, mostrarErro };
