/**
 * Pruebas de RF-01 — Interfaz gráfica de chat y bienvenida.
 * Cada test corresponde a una condición de aprobación de REQ-1785771199977.
 * Corre con: npm test  (node --test tests/)
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function until(predicate, timeout = 2500, step = 25) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
        if (predicate()) return Date.now() - startedAt;
        await sleep(step);
    }
    return predicate() ? Date.now() - startedAt : null;
}

// Carga el HTML y evalúa app.js en la misma ventana. jsdom no trae red, así que
// app.js se evalúa acá en vez de pedirlo por <script src>; el resto del ciclo de
// vida del documento (DOMContentLoaded) lo dispara jsdom.
function loadApp() {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const dom = new JSDOM(html, {
        runScripts: 'dangerously',
        url: 'http://localhost/',
        pretendToBeVisual: true,
    });
    dom.window.eval(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'));
    if (dom.window.document.readyState !== 'loading') {
        dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true }));
    }
    return dom;
}

function submit(dom, text) {
    const { window } = dom;
    const form = window.document.getElementById('chat-form');
    const input = window.document.getElementById('chat-input');
    input.value = text;
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

function messages(dom) {
    return [...dom.window.document.querySelectorAll('.chat-message')];
}

function lastMessage(dom) {
    const all = messages(dom);
    return all[all.length - 1];
}

function botReplies(dom) {
    return messages(dom)
        .filter((m) => m.classList.contains('bot'))
        .map((m) => m.querySelector('.message-bubble').textContent.trim());
}

function userMessages(dom) {
    return messages(dom)
        .filter((m) => m.classList.contains('user'))
        .map((m) => m.querySelector('.message-bubble').textContent.trim());
}

function optionButtons(dom) {
    return [...dom.window.document.querySelectorAll('#options-container button')];
}

test('criterio 1: al cargar la raiz se renderiza la interfaz de chat completa', async () => {
    const dom = await loadApp();
    const doc = dom.window.document;

    assert.match(doc.querySelector('.brand-title').textContent.trim(), /Profesionales/);
    assert.match(doc.querySelector('.status-text').textContent.trim(), /Asistente en línea/);
    assert.ok(doc.getElementById('messages-list'), 'falta #messages-list');
    assert.ok(doc.getElementById('options-container'), 'falta #options-container');
    assert.ok(doc.getElementById('chat-input'), 'falta #chat-input');
    assert.ok(doc.getElementById('chat-form'), 'falta #chat-form');
    dom.window.close();
});

test('criterio 2: la bienvenida aparece dentro de los 3000 ms', async () => {
    const dom = await loadApp();
    const elapsed = await until(() =>
        botReplies(dom).some((t) => t.includes('¡Hola! Bienvenid@ a Profesionales'))
    );

    assert.ok(elapsed !== null, 'no aparecio la bienvenida');
    assert.ok(elapsed < 3000, `tardo ${elapsed} ms (maximo 3000)`);
    dom.window.close();
});

test('criterio 3: exactamente dos botones de tipo button, sin numero de opcion ni texto obligatorio', async () => {
    const dom = await loadApp();
    await until(() => optionButtons(dom).length > 0);
    const doc = dom.window.document;

    const buttons = optionButtons(dom);
    assert.equal(buttons.length, 2, `se esperaban 2 botones, hay ${buttons.length}`);

    const login = doc.getElementById('btn-login');
    const register = doc.getElementById('btn-register');
    assert.ok(login, 'falta #btn-login');
    assert.ok(register, 'falta #btn-register');
    assert.equal(login.type, 'button');
    assert.equal(register.type, 'button');

    // Ningun control exija numero de opcion ni texto para elegir.
    assert.equal(doc.querySelectorAll('input[type="number"]').length, 0);
    assert.equal(doc.querySelectorAll('select').length, 0);
    assert.equal(doc.querySelectorAll('#options-container input').length, 0);
    dom.window.close();
});

test('criterio 4: presionar Iniciar Sesion responde en menos de 2000 ms y retira los botones', async () => {
    const dom = await loadApp();
    await until(() => optionButtons(dom).length > 0);

    const startedAt = Date.now();
    dom.window.document.getElementById('btn-login').click();

    const elapsed = await until(() =>
        botReplies(dom).some((t) => t.includes('correo electrónico y contraseña'))
    );
    const total = Date.now() - startedAt;

    assert.ok(elapsed !== null, 'el asistente no respondio al inicio de sesion');
    assert.ok(total < 2000, `tardo ${total} ms (maximo 2000)`);
    assert.ok(userMessages(dom).includes('Quiero iniciar sesión'));
    assert.equal(optionButtons(dom).length, 0, 'los botones debian retirarse');
    dom.window.close();
});

test('criterio 5: presionar Registrarse responde en menos de 2000 ms y retira los botones', async () => {
    const dom = await loadApp();
    await until(() => optionButtons(dom).length > 0);

    const startedAt = Date.now();
    dom.window.document.getElementById('btn-register').click();

    const elapsed = await until(() =>
        botReplies(dom).some((t) => t.includes('Para registrarte'))
    );
    const total = Date.now() - startedAt;

    assert.ok(elapsed !== null, 'el asistente no respondio al registro');
    assert.ok(total < 2000, `tardo ${total} ms (maximo 2000)`);
    assert.ok(userMessages(dom).includes('Quiero registrarme'));
    assert.equal(optionButtons(dom).length, 0, 'los botones debian retirarse');
    dom.window.close();
});

test('criterio 6: el texto libre enruta los cuatro casos y siempre vacia el campo', async () => {
    const dom = await loadApp();
    await until(() => optionButtons(dom).length > 0);
    const doc = dom.window.document;

    // (a) saludo -> repone los dos botones
    submit(dom, 'hola');
    await until(() => botReplies(dom).some((t) => t.includes('Recuerda que puedes utilizar los botones')));
    assert.equal(doc.getElementById('chat-input').value, '', 'el campo debia quedar vacio (a)');
    assert.equal(optionButtons(dom).length, 2, 'debian volver los dos botones (a)');

    // (b) login -> dispara el flujo de inicio de sesion
    submit(dom, 'quiero hacer login');
    await until(() => botReplies(dom).some((t) => t.includes('correo electrónico y contraseña')));
    assert.equal(doc.getElementById('chat-input').value, '', 'el campo debia quedar vacio (b)');
    assert.equal(optionButtons(dom).length, 0, 'los botones se retiran en (b)');

    // (c) registro -> dispara el flujo de registro
    submit(dom, 'registro');
    await until(() => botReplies(dom).some((t) => t.includes('Para registrarte')));
    assert.equal(doc.getElementById('chat-input').value, '', 'el campo debia quedar vacio (c)');

    // (d) cualquier otro texto -> mensaje generico y repone los botones
    submit(dom, 'quiero sacar un turno');
    await until(() => botReplies(dom).some((t) => t.includes('Por favor selecciona una de las opciones')));
    assert.equal(doc.getElementById('chat-input').value, '', 'el campo debia quedar vacio (d)');
    assert.equal(optionButtons(dom).length, 2, 'debian volver los dos botones (d)');
    dom.window.close();
});

test('criterio 7: el texto del usuario se muestra literal y no ejecuta HTML', async () => {
    const dom = await loadApp();
    await until(() => optionButtons(dom).length > 0);
    const doc = dom.window.document;
    const payload = '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>';

    submit(dom, payload);
    await until(() => userMessages(dom).length > 0);

    const bubble = lastMessage(dom).querySelector('.message-bubble');
    assert.equal(bubble.textContent, payload, 'el texto debe quedar literal');
    assert.equal(bubble.querySelector('img'), null, 'no debe interpretarse como elemento');
    assert.equal(bubble.querySelector('script'), null, 'no debe insertarse un script');
    assert.equal(doc.querySelectorAll('img[src="x"]').length, 0, 'ninguna imagen inyectada en la pagina');
    assert.notEqual(dom.window.__pwned, 1, 'no debe ejecutarse el script inyectado');
    dom.window.close();
});

test('criterio 8: aplica docs/style.md (Inter, acento #2563eb, 48px, transiciones 0.15s/0.22s)', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');

    assert.match(html, /fonts\.googleapis\.com\/css2\?family=Inter/);

    assert.match(css, /--primary:\s*#2563eb/);
    assert.match(css, /--font-family:\s*'Inter'/);
    assert.match(css, /--transition-fast:\s*0\.15s/);
    assert.match(css, /--transition-normal:\s*0\.22s/);

    const pill = css.match(/\.action-btn-pill\s*\{[^}]*\}/);
    assert.ok(pill, 'falta la regla .action-btn-pill');
    assert.match(pill[0], /height:\s*48px/, '.action-btn-pill debe medir 48px (>= 44px tactil)');
    assert.match(pill[0], /transition:\s*var\(--transition-normal\)/);
});
