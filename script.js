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

loadStyles();