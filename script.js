const els = {};

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
loadStyles();
buildLayout();
els.logo.append(createCat());