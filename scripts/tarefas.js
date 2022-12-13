import { deslogar, getToken } from './login.js';
import {
  adicionarValidacao,
  desabilitarBotao,
  formEstaValido,
  notificaoErro,
  renderizarSkeletons,
  removerSkeleton
} from './utils.js';

const token = getToken();
let tarefas = [];
const defaultHeader = {
  Accept: '/ , application/json',
  'Content-Type': 'application/json',
  Authorization: token,
};
window.addEventListener('load', () => {
  const formularioValido = {
    inputTarefa: false,
  };
  const inputTarefa = document.getElementById('inputTarefa');
  const btnCriar = document.getElementById('btnCriar');
  const form = document.getElementById('formularioTarefa');
  const btnSair = document.getElementById('closeApp');
  const nomeUser = document.getElementById("nomeUser");
  renderizarSkeletons(3,".tarefas-pendentes")

  async function perfilUser() {
    try {
      const resposta = await fetch("http://todo-api.ctd.academy:3000/v1/users/getme", {
        headers: defaultHeader,
      });
      if (!resposta.ok) {
        throw new Error()
      }
      const perfil = await resposta.json();
      nomeUser.innerText = `${perfil.firstName} ${perfil.lastName}`
    } catch {
      notificaoErro();
    }
  }

  perfilUser();
  btnSair.addEventListener('click', () => {
    Swal.fire({
      title: 'Deseja sair?',
      text: "Você tem certeza que deseja sair?",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sair',
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        deslogar()
      }
    })
  });

  adicionarValidacao(formularioValido, btnCriar, inputTarefa, 'inputTarefa', {
    vazio: true,
    trim: true,
    removerEspacosDuplicados: true,
    tamanhoMin: 6
  });

  desabilitarBotao(formularioValido, btnCriar);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!formEstaValido(formularioValido)) return;

    criarTarefa(inputTarefa.value, false, form);
  });

  const carregarTarefas = async () => {
    try {
      const res = await fetch('http://todo-api.ctd.academy:3000/v1/tasks', {
        headers: defaultHeader,
      });
      if (!res.ok) {
        throw new Error()
      }

      const data = await res.json();
      tarefas = data;
      renderizarTarefas();
    } catch {
      notificaoErro();
    }
  };

  carregarTarefas();
});

async function criarTarefa(description, completed, form) {
  try {
    const criarTarefa = await fetch('http://todo-api.ctd.academy:3000/v1/tasks', {
      method: 'POST',
      headers: defaultHeader,
      body: JSON.stringify({
        description,
        completed,
      }),
    });

    if (!criarTarefa.ok) {
      throw new Error()
    }

    const data = await criarTarefa.json();
    tarefas = [...tarefas, data];
    renderizarTarefas();
    form.reset();
  } catch {
    notificaoErro();
  }
}

async function deletarTarefa(id) {
  try {
    const deletarTarefa = await fetch(
      `http://todo-api.ctd.academy:3000/v1/tasks/${id}`,
      {
        method: 'DELETE',
        headers: defaultHeader,
      }
    );

    if (!deletarTarefa.ok) {
      throw new Error()
    }

    Swal.fire({
      icon: 'success',
      title: 'Apagado',
      showConfirmButton: false,
      timer: 1500
    })

    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    renderizarTarefas();
  } catch {
    notificaoErro();
  }
}

async function editarTarefa(id, dadosTarefa, mostrarSucesso) {
  try {
    const editarTarefa = await fetch(
      `http://todo-api.ctd.academy:3000/v1/tasks/${id}`,
      {
        method: 'PUT',
        headers: defaultHeader,
        body: JSON.stringify(dadosTarefa),
      }
    );

    if (!editarTarefa.ok) {
      throw new Error()
    }
    if (mostrarSucesso) {
      Swal.fire({
        icon: 'success',
        title: 'Salvo!',
        showConfirmButton: false,
        timer: 1500
      })  
    }

    tarefas = tarefas.map((tarefa) => {
      if (tarefa.id !== id) return tarefa;
      return { ...tarefa, ...dadosTarefa };
    });

    renderizarTarefas();
  } catch {
    notificaoErro();
  }
}

function renderizarTarefas() {
  const pendentes = tarefas.filter((tarefa) => !tarefa.completed);
  const concluidas = tarefas.filter((tarefa) => tarefa.completed);

  renderizarListaTarefas(
    pendentes,
    document.getElementById('tarefasPendentes')
  );
  renderizarListaTarefas(
    concluidas,
    document.getElementById('tarefasTerminadas')
  );
}

function renderizarListaTarefas(tarefas, lista) {
  const render = document.createDocumentFragment();

  for (const tarefa of tarefas) {
    const btnDone = document.createElement('button');
    const classeConcluida = tarefa.completed ? 'done' : 'not-done';
    btnDone.classList.add(classeConcluida);
    btnDone.addEventListener('click', () => {
      editarTarefa(tarefa.id, {
        description: tarefa.description,
        completed: !tarefa.completed,
      });
    });

    const descricao = document.createElement('div');
    descricao.classList.add('descricao');
    descricao.innerHTML = `<p class="nomeTarefa">${tarefa.description}</p><p class="timestamp">Criada em: ${tarefa.createdAt}</p>`;

    const btnDeletar = document.createElement('button');
    btnDeletar.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    btnDeletar.addEventListener('click', () => {
      Swal.fire({
        title: `Tem certeza que deseja apagar a tarefa: <u>${tarefa.description}</u>`,
        showCancelButton: true,
        confirmButtonText: 'Apagar',
      }).then((result) => {
        if (result.isConfirmed) {
          deletarTarefa(tarefa.id)
        }
      })
    });

    const btnEditar = document.createElement('button');
    btnEditar.innerHTML =
      '<i class="fa-regular fa-pen-to-square" id="editar"></i>';
    btnEditar.addEventListener('click', () => {
      Swal.fire({
        title: 'Editar tarefa',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        inputValue: tarefa.description,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: 'Salvar',
        preConfirm: (descricao) => {
          if (descricao.trim().length < 6) {
            Swal.showValidationMessage(
              `Obrigatório informar descrição da tarefa`)
          } else {
            return descricao;
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          editarTarefa(tarefa.id, {
            description: result.value
          }, true)

        }
      })
    });

    const acoesTask = document.createElement('div');
    acoesTask.classList.add('iconsTask');
    acoesTask.appendChild(btnDeletar);
    acoesTask.appendChild(btnEditar);

    const li = document.createElement('li');
    li.classList.add('tarefa');
    li.appendChild(btnDone);
    li.appendChild(descricao);
    li.appendChild(acoesTask);
    render.appendChild(li);
  }

  lista.innerHTML = '';
  lista.appendChild(render);
}
