const notas = [];

const btnExpand = document.getElementById("btn-expand-note");
const btnClose = document.getElementById("btn-close-note");
const form = document.getElementById("note-form");
const searchInput = document.getElementById("search-input");

const inputTitle = document.getElementById("note-title");
const inputText = document.getElementById("note-text");

const notesContainer = document.getElementById("notes-container");

function limparFormulario() {
    inputTitle.value = "";
    inputText.value = "";
}

function criarNota(nota) {
    const article = document.createElement("article");

    const h3 = document.createElement("h3");
    h3.textContent = nota.title;

    const p = document.createElement("p");
    p.textContent = nota.text;

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Editar";

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Excluir";

    btnDelete.addEventListener("click", () => {
        deletarNota(article, nota);
    });

    btnEdit.addEventListener("click", () => {
        editarNota(nota, h3, p);
    });

    article.appendChild(h3);
    article.appendChild(p);
    article.appendChild(btnEdit);
    article.appendChild(btnDelete);

    notesContainer.appendChild(article);
}

btnExpand.addEventListener("click", () => {
    form.hidden = false;
    inputTitle.focus();
});

btnClose.addEventListener("click", () => {
    form.hidden = true;
    btnExpand.focus();
    limparFormulario();
});

function deletarNota(article, nota) {
    const index = notas.findIndex(n => n.id === nota.id);
    if (index !== -1) {
        notas.splice(index, 1);
    }
    article.remove();
}

function editarNota(nota, h3, p) {
    const novoTitulo = prompt("Editar título:", nota.title);
    const novoTexto = prompt("Editar conteúdo:", nota.text);

    if (novoTitulo !== null && novoTexto !== null) {
        nota.title = novoTitulo;
        nota.text = novoTexto;

        h3.textContent = novoTitulo;
        p.textContent = novoTexto;
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = inputTitle.value;
    const text = inputText.value;

    if (title.trim() === "" || text.trim() === "") {
        alert("Preencha todos os campos");
        return;
    }

    const novaNota = {
        id: Date.now(),
        title,
        text
    };

    notas.push(novaNota);

    criarNota(novaNota);

    form.hidden = true;
    limparFormulario();
    inputTitle.focus();
});

searchInput.addEventListener("input", () => {
    const termo = searchInput.value.toLowerCase();

    const notasDOM = notesContainer.querySelectorAll("article");

    notasDOM.forEach((notaEl) => {
        const texto = notaEl.textContent.toLowerCase();

        if (texto.includes(termo)) {
            notaEl.style.display = "";
        } else {
            notaEl.style.display = "none";
        }
    });
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        form.hidden = true;
        limparFormulario();
    }
});