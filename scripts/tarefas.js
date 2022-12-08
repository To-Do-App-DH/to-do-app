import { deslogar, getToken } from './login.js';
import {
  adicionarValidacao,
  desabilitarBotao,
  formEstaValido,
} from './utils.js';

const token = getToken();
let tarefas = [];
const defaultHeader = {
  Accept: '/ , application/json',
  'Content-Type': 'application/json',
  Authorization: token,
};
document.addEventListener('DOMContentLoaded', () => {
  const formularioValido = {
    inputTarefa: false,
  };
  const inputTarefa = document.getElementById('inputTarefa');
  const btnCriar = document.getElementById('btnCriar');
  const form = document.getElementById('formularioTarefa');
  const btnSair = document.getElementById('closeApp');
  const nomeUser = document.getElementById("nomeUser");

  async function perfilUser() {
    const resposta = await fetch("http://todo-api.ctd.academy:3000/v1/users/getme", {
      headers: defaultHeader,
    }); 
    if (!resposta.ok) {
      console.log('erro');
      return;  
    }
    const perfil = await resposta.json();
    nomeUser.innerText = `${perfil.firstName} ${perfil.lastName}`
  }

  perfilUser();
  btnSair.addEventListener('click', () => deslogar());

  adicionarValidacao(formularioValido, btnCriar, inputTarefa, 'inputTarefa', {
    vazio: true,
  });

  desabilitarBotao(formularioValido, btnCriar);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!formEstaValido(formularioValido)) return;

    criarTarefa(inputTarefa.value, false, form);
  });

  const carregarTarefas = async () => {
    const res = await fetch('http://todo-api.ctd.academy:3000/v1/tasks', {
      headers: defaultHeader,
    });
    if (!res.ok) {
      console.log('erro');
      return;
    }

    const data = await res.json();
    tarefas = data;
    renderizarTarefas();
  };

  carregarTarefas();
});

async function criarTarefa(description, completed, form) {
  const criarTarefa = await fetch('http://todo-api.ctd.academy:3000/v1/tasks', {
    method: 'POST',
    headers: defaultHeader,
    body: JSON.stringify({
      description,
      completed,
    }),
  });

  if (!criarTarefa.ok) {
    console.log('erro');
    return;
  }

  const data = await criarTarefa.json();
  tarefas = [...tarefas, data];
  renderizarTarefas();
  form.reset();
}

async function deletarTarefa(id) {
  const deletarTarefa = await fetch(
    `http://todo-api.ctd.academy:3000/v1/tasks/${id}`,
    {
      method: 'DELETE',
      headers: defaultHeader,
    }
  );

  if (!deletarTarefa.ok) {
    console.log('Erro ao deletar');
    return;
  }

  tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
  renderizarTarefas();
}

async function editarTarefa(id, dadosTarefa) {
  const editarTarefa = await fetch(
    `http://todo-api.ctd.academy:3000/v1/tasks/${id}`,
    {
      method: 'PUT',
      headers: defaultHeader,
      body: JSON.stringify(dadosTarefa),
    }
  );

  if (!editarTarefa.ok) {
    console.log('erro');
    return;
  }

  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id !== id) return tarefa;
    return { ...tarefa, ...dadosTarefa };
  });

  renderizarTarefas();
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
    btnDeletar.addEventListener('click', () => deletarTarefa(tarefa.id));

    const btnEditar = document.createElement('button');
    btnEditar.innerHTML =
      '<i class="fa-regular fa-pen-to-square" id="editar"></i>';
    btnEditar.addEventListener('click', () => console.log('editar'));

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

// let gerarListaTarefas = (params) => {
//   tarefasPendentes.innerHTML += `
//     <li class="tarefa">
//         <div id="btnFeito" class="not-done"></div>
//         <div class="descricao">
//             <p class="nomeTarefa">${params}</p>
//             <p class="timestamp">Criada em: ${time}</p>
//         </div>
//         <div class="iconsTask">
//         <i class="fa-solid fa-trash-can" id="trash"></i>
//         <i class="fa-regular fa-pen-to-square" id="editar"></i>
//         </div>
//     </li>`;
// };

// // ______ codigos API ________
// const getTasksAll = () => {
//   fetch('http://todo-api.ctd.academy:3000/v1/tasks', {
//     method: 'GET',
//     headers: {
//       Accept: '/ , application/json',
//       'Content-Type': 'application/json',
//       authorization: `${token}`,
//     },
//   }).then((res) => {
//     if (res.status == 200) {
//       res.json().then((data) => {
//         console.log(data);
//         for (let i = 0; i < data.length; i++) {
//           gerarListaTarefas(data[i].description);
//         }
//         trash = document.querySelectorAll('#trash');
//         trash.forEach((ele, i) => {
//           ele.addEventListener('click', () => {
//             delTasks(data[i].id);
//           });
//         });
//         // adicionar funcionalidade ao botão editar e conclusao da tarefa
//         pen = document.querySelectorAll('#editar');
//         pen.forEach((ele, i) => {
//           ele.addEventListener('click', () => {
//             editTasks(data[i].id);
//           });
//         });
//         check = document.querySelectorAll('#btnFeito');
//         let nomeTarefa = document.querySelectorAll('.nomeTarefa');
//         check.forEach((ele) => {
//           ele.addEventListener('click', () => {
//             nomeTarefa.forEach((ele) => {
//               ele.classList.toggle('feito');
//             });
//           });
//         });
//       });
//     }
//   });
// };

// getTasksAll();

// const getTasksOne = () => {
//   fetch(`http://todo-api.ctd.academy:3000/v1/tasks/${getIdTasks}`, {
//     method: 'GET',
//     headers: {
//       Accept: '/ , application/json',
//       'Content-Type': 'application/json',
//       authorization: `${token}`,
//     },
//   }).then((res) => {
//     if (res.status == 200) {
//       res.json().then((data) => {
//         console.log(data);
//       });
//     }
//   });
// };

// const postTasks = () => {
//   fetch('http://todo-api.ctd.academy:3000/v1/tasks', {
//     method: 'POST',
//     headers: {
//       Accept: '/ , application/json',
//       'Content-Type': 'application/json',
//       authorization: `${token}`,
//     },
//     body: JSON.stringify({
//       description: `${inputTarefa.value}`,
//       completed: false,
//     }),
//   }).then((res) => {
//     console.log(res.status);
//     if (res.status == 201) {
//       getTasksAll();
//       window.location.href = 'tarefas.html';
//     }
//   });
// };

// const delTasks = (params) => {
//   fetch(`http://todo-api.ctd.academy:3000/v1/tasks/${params}`, {
//     method: 'DELETE',
//     headers: {
//       Accept: '/ , application/json',
//       'Content-Type': 'application/json',
//       authorization: `${token}`,
//     },
//   }).then((res) => {
//     console.log(res.status);
//     if (res.status == 200) {
//       getTasksAll();
//       window.location.href = 'tarefas.html';
//     }
//   });
// };

// const editTasks = (params) => {
//   fetch(`http://todo-api.ctd.academy:3000/v1/tasks/${params}`, {
//     method: 'PUT',
//     headers: {
//       Accept: '/ , application/json',
//       'Content-Type': 'application/json',
//       authorization: `${token}`,
//     },
//     body: JSON.stringify({
//       description: `${inputTarefa.value}`,
//       completed: false,
//     }),
//   }).then((res) => {
//     if (res.status == 200) {
//       getTasksAll();
//       window.location.href = 'tarefas.html';
//     }
//   });
// };
