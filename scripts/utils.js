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
    el.addEventListener('change', (event) => {
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

function notificaoErro() {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: 'Alguma coisa deu errado. Tente novamente',
    timer: 1500,
    showConfirmButton: false
  })
}


function renderizarSkeletons(quantidade, conteiner) {
  // Selecionamos o conteiner
  const conteinerTarefas = document.querySelector(conteiner);

  // Criamos um array que terá um lenght igual ao número de
  //skeletons que queremos renderizar
  const skeletons = Array.from({ length: quantidade });

  // Iteramos sobre o array acessando cada elemento
  skeletons.forEach(() => {
    // Guardamos o HTML de cada skeleton. Adicionamos uma classe com o seletor do conteiner
    // Isso nos permitirá posteriormente eliminar os skeletons do referido conteiner
    const template = `
   <li class="skeleton-conteiner ${conteiner.replace(".", "")}-child">
     <div class="skeleton-card">
       <p class="skeleton-text"></p>
       <p class="skeleton-text"></p>
     </div>
   </li>
 `;

    // Inserimos o HTML dentro do conteiner
    conteinerTarefas.innerHTML += template;
  });
}


function removerSkeleton(conteiner) {
  // Selecionamos o conteiner
  const conteinerTarefas = document.querySelector(conteiner);

  // Selecionamos todos os skeletons dentro deste conteiner
  const skeletons = document.querySelectorAll(`${conteiner}-child`);

  // Iteramos sobre a lista de skeletons e removemos cada um deles
  // do referido conteiner
  skeletons.forEach((skeleton) => conteinerTarefas.removeChild(skeleton));
}

export { adicionarValidacao, desabilitarBotao, formEstaValido, mostrarErro, notificaoErro, renderizarSkeletons, removerSkeleton };
