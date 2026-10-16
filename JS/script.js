function carregarTarefas() {
    try {
        const dados = localStorage.getItem("taskflow-tarefas");

        if (!dados) {
            return [];
        }

        const tarefas = JSON.parse(dados);

        if (!Array.isArray(tarefas)) {
            return [];
        }

        return tarefas.filter((tarefa) =>
            tarefa &&
            typeof tarefa.id === "string" &&
            typeof tarefa.disciplina === "string" &&
            typeof tarefa.descricao === "string" &&
            ["baixa", "media", "alta"].includes(tarefa.prioridade) &&
            typeof tarefa.concluida === "boolean"
        );
    } catch (erro) {
        console.error("Não foi possível recuperar as tarefas:", erro);
        return [];
    }
}


let tarefas = carregarTarefas();

const taskForm = document.getElementById("taskForm");
const disciplineInput = document.getElementById("discipline");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");
const emptyMessage = document.getElementById("emptyMessage");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");


function salvarTarefas() {
    try {
        localStorage.setItem("taskflow-tarefas", JSON.stringify(tarefas));
    } catch (erro) {
        console.error("Não foi possível salvar as tarefas:", erro);
        alert("Não foi possível salvar os dados no navegador.");
    }
}


function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

function atualizarIndicadores() {
    const concluidas = tarefas.filter(
        (tarefa) => tarefa.concluida
    ).length;

    totalTasks.textContent = tarefas.length;
    completedTasks.textContent = concluidas;
    pendingTasks.textContent = tarefas.length - concluidas;
}


function criarCartao(tarefa) {
    const cartao = criarElemento(
        "article",
        `task-card${tarefa.concluida ? " is-completed" : ""}`
    );

    const checkbox = criarElemento("input", "task-checkbox");
    checkbox.type = "checkbox";
    checkbox.checked = tarefa.concluida;
    checkbox.setAttribute(
        "aria-label",
        `Marcar ${tarefa.disciplina} como concluída`
    );

    checkbox.addEventListener("change", () => {
        alternarConclusao(tarefa.id);
    });

    const conteudo = criarElemento("div", "task-content");
    const linhaSuperior = criarElemento("div", "task-topline");

    const disciplina = criarElemento(
        "span",
        "task-discipline",
        tarefa.disciplina
    );

    const prioridades = {
        alta: "Alta",
        media: "Média",
        baixa: "Baixa"
    };

    const prioridade = criarElemento(
        "span",
        `priority priority-${tarefa.prioridade}`,
        prioridades[tarefa.prioridade]
    );

    const descricao = criarElemento(
        "p",
        "task-description",
        tarefa.descricao
    );

    const status = criarElemento(
        "span",
        "task-status",
        tarefa.concluida ? " Tarefa concluída" : " Tarefa pendente"
    );

    linhaSuperior.append(disciplina, prioridade);
    conteudo.append(linhaSuperior, descricao, status);

    const botaoExcluir = criarElemento(
        "button",
        "delete-button",
        "Excluir"
    );

    botaoExcluir.type = "button";
    botaoExcluir.setAttribute(
        "aria-label",
        `Excluir tarefa de ${tarefa.disciplina}`
    );
    botaoExcluir.title = "Excluir tarefa";

    
    botaoExcluir.addEventListener("click", () => {
        excluirTarefa(tarefa.id);
    });

    cartao.append(checkbox, conteudo, botaoExcluir);

    return cartao;
}

function renderizarTarefas() {
    taskList.replaceChildren();

    const filtro = taskFilter.value;


    const tarefasFiltradas = tarefas.filter((tarefa) => {
        if (filtro === "pendentes") {
            return !tarefa.concluida;
        }

        if (filtro === "concluidas") {
            return tarefa.concluida;
        }

        return true;
    });


    tarefasFiltradas.forEach((tarefa) => {
        taskList.appendChild(criarCartao(tarefa));
    });

   
    emptyMessage.hidden = tarefasFiltradas.length > 0;

    if (tarefas.length === 0) {
        emptyMessage.querySelector("strong").textContent =
            "Nenhuma tarefa por aqui";

        emptyMessage.querySelector("span:last-child").textContent =
            "Adicione sua primeira tarefa para começar!";
    } else if (tarefasFiltradas.length === 0) {
        emptyMessage.querySelector("strong").textContent =
            "Nenhuma tarefa encontrada";

        emptyMessage.querySelector("span:last-child").textContent =
            "Experimente selecionar outro filtro.";
    }

    atualizarIndicadores();
}


function adicionarTarefa(evento) {
    evento.preventDefault();

    const disciplina = disciplineInput.value.trim();
    const descricao = descriptionInput.value.trim();
    const prioridade = priorityInput.value;

    if (!disciplina || !descricao) {
        alert("Preencha a disciplina e a descrição da tarefa.");
        return;
    }

    const novaTarefa = {
        id: crypto.randomUUID(),
        disciplina: disciplina,
        descricao: descricao,
        prioridade: prioridade,
        concluida: false,
        criadaEm: new Date().toISOString()
    };

    tarefas.push(novaTarefa);

    salvarTarefas();

    
    taskFilter.value = "todas";

    renderizarTarefas();

    taskForm.reset();
    disciplineInput.focus();
}

function alternarConclusao(id) {
    tarefas = tarefas.map((tarefa) => {
        if (tarefa.id === id) {
            return {
                ...tarefa,
                concluida: !tarefa.concluida
            };
        }

        return tarefa;
    });

    salvarTarefas();
    renderizarTarefas();
}


function excluirTarefa(id) {
    const confirmar = window.confirm(
        "Deseja realmente excluir esta tarefa?"
    );

    if (!confirmar) {
        return;
    }

    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);

    salvarTarefas();
    renderizarTarefas();
}


taskForm.addEventListener("submit", adicionarTarefa);
taskFilter.addEventListener("change", renderizarTarefas);

renderizarTarefas();