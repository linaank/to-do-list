const els = {};
let tasks = [];
const view = { filter: 'all', sort: 'manual', search: '' };
let editingId = null;
let dragId = null;
const STORAGE_KEY = 'cat-todo-tasks';

function el(tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function loadStyles() {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1';

    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'style.css';

    document.head.append(viewport, font, css);
}
function createSelect(options) {
    const select = el('select', 'input');
    options.forEach(([value, label]) => {
        const option = el('option', '', label);
        option.value = value;
        select.append(option);
    });
    return select;
}

function buildLayout() {
    const header = el('header', 'header');
    els.logo = el('div', 'logo');
    const heading = el('div', 'heading');
    heading.append(
        el('h1', 'title', 'To-Do лист'),
        el('p', 'subtitle', 'задачи под кошачьим присмотром')
    );
    header.append(els.logo, heading);

    const main = el('main', 'main');

    // Форма добавления
    els.form = el('form', 'form');
    els.titleInput = el('input', 'input');
    els.titleInput.type = 'text';
    els.titleInput.placeholder = 'Что нужно сделать?';
    els.titleInput.required = true;
    els.titleInput.maxLength = 80;
    els.titleInput.setAttribute('aria-label', 'Название задачи');

    els.dateInput = el('input', 'input');
    els.dateInput.type = 'date';
    els.dateInput.setAttribute('aria-label', 'Дата задачи');

    const addBtn = el('button', 'btn btn-primary', 'Добавить');
    addBtn.type = 'submit';
    els.form.append(els.titleInput, els.dateInput, addBtn);

    // Панель поиска, фильтра, сортировки
    const toolbar = el('section', 'toolbar');
    els.searchInput = el('input', 'input');
    els.searchInput.type = 'search';
    els.searchInput.placeholder = 'Поиск по названию';
    els.searchInput.setAttribute('aria-label', 'Поиск по названию');

    els.filterSelect = createSelect([
        ['all', 'Все'],
        ['active', 'Не выполнены'],
        ['done', 'Выполнены'],
    ]);
    els.sortSelect = createSelect([
        ['manual', 'Мой порядок'],
        ['asc', 'Дата: сначала старые'],
        ['desc', 'Дата: сначала новые'],
    ]);
    toolbar.append(els.searchInput, els.filterSelect, els.sortSelect);

    els.counter = el('p', 'counter');
    els.list = el('ul', 'task-list');
    els.empty = el('p', 'empty');

    main.append(els.form, toolbar, els.counter, els.list, els.empty);

    const footer = el('footer', 'footer', '=^.^= с любовью к пушистым');

    const app = el('div', 'app');
    app.append(header, main, footer);
    document.body.append(app);
}
const CAT_PIXELS = [
    '#..........#',
    '##........##',
    '############',
    '############',
    '##ee####ee##',
    '##ee####ee##',
    '############',
    '#####pp#####',
    '############',
    '.##########.',
    '..########..',
];
const CAT_CLASSES = { '#': 'cat-body', e: 'cat-eye', p: 'cat-nose' };

function createCat() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${CAT_PIXELS[0].length} ${CAT_PIXELS.length}`);
    svg.setAttribute('class', 'cat');
    svg.setAttribute('aria-hidden', 'true');

    CAT_PIXELS.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            if (ch === '.') return;
            const rect = document.createElementNS(NS, 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', 1);
            rect.setAttribute('height', 1);
            rect.setAttribute('class', CAT_CLASSES[ch]);
            svg.append(rect);
        });
    });
    return svg;
}
function formatDate(value) {
    if (!value) return 'без даты';
    const [y, m, d] = value.split('-');
    return `${d}.${m}.${y}`;
}

function addTask(title, date) {
    tasks.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title,
        date,
        done: false,
    });
}

function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    update();
}

function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    update();
}

function getVisibleTasks() {
    let list = [...tasks];
    if (view.filter === 'done') list = list.filter((t) => t.done);
    if (view.filter === 'active') list = list.filter((t) => !t.done);
    if (view.sort !== 'manual') {
        list.sort((a, b) => compareDates(a, b, view.sort));
    }
    return list;
}

function createEditForm(task) {
    const li = el('li', 'task editing');
    li.dataset.id = task.id;

    const form = el('form', 'edit-form');
    const titleInput = el('input', 'input');
    titleInput.type = 'text';
    titleInput.value = task.title;
    titleInput.required = true;
    titleInput.maxLength = 80;

    const dateInput = el('input', 'input');
    dateInput.type = 'date';
    dateInput.value = task.date;

    const saveBtn = el('button', 'btn btn-primary', 'Сохранить');
    saveBtn.type = 'submit';
    const cancelBtn = el('button', 'btn', 'Отмена');
    cancelBtn.type = 'button';

    form.append(titleInput, dateInput, saveBtn, cancelBtn);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        if (!title) return;
        task.title = title;
        task.date = dateInput.value;
        editingId = null;
        update();
    });
    cancelBtn.addEventListener('click', () => {
        editingId = null;
        render();
    });

    li.append(form);
    setTimeout(() => titleInput.focus());
    return li;
}

function createTaskElement(task) {
    const li = el('li', 'task');
    li.dataset.id = task.id;
    if (task.id === editingId) return createEditForm(task);

    const body = el('div', 'task-body');
    const title = el('span', 'task-title', task.title);
    const date = el('time', 'task-date', formatDate(task.date));
    if (task.date) date.dateTime = task.date;
    body.append(title, date);

    const actions = el('div', 'task-actions');

    li.append(body, actions);
    const delBtn = el('button', 'btn btn-danger', 'Удалить');
    delBtn.type = 'button';
    delBtn.addEventListener('click', () => deleteTask(task.id));
    actions.append(delBtn);
    li.classList.toggle('done', task.done);
    const check = el('button', 'check');
    check.type = 'button';
    check.setAttribute('aria-pressed', String(task.done));
    check.setAttribute('aria-label', 'Отметить выполненной');
    check.addEventListener('click', () => toggleTask(task.id));
    li.prepend(check);
    const editBtn = el('button', 'btn', 'Править');
    editBtn.type = 'button';
    editBtn.addEventListener('click', () => {
        editingId = task.id;
        render();
    });
    actions.prepend(editBtn);
    return li;
}

function render() {
    const visible = getVisibleTasks();
    els.list.replaceChildren(...visible.map(createTaskElement));

    els.empty.hidden = visible.length > 0;
    els.empty.textContent = tasks.length
        ? 'Ничего не найдено =^.^='
        : 'Задач пока нет. Котик скучает =^-.-^=';

    const doneCount = tasks.filter((t) => t.done).length;
    els.counter.textContent = `Выполнено: ${doneCount} из ${tasks.length}`;
}

function update() {
    saveTasks();
    render();
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function bindEvents() {
    els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = els.titleInput.value.trim();
        if (!title) return;
        addTask(title, els.dateInput.value);
        els.form.reset();
        els.titleInput.focus();
        update();
    });
    els.sortSelect.addEventListener('change', () => {
        view.sort = els.sortSelect.value;
        render();
    });
    els.filterSelect.addEventListener('change', () => {
        view.filter = els.filterSelect.value;
        render();
    });
}

function compareDates(a, b, direction) {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return direction === 'asc'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
}
loadStyles();
buildLayout();
els.logo.append(createCat());
bindEvents();
tasks = loadTasks();
render();