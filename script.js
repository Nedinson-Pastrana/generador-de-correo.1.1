// Configuración de Notiflix
Notiflix.Report.init({
    className: 'notiflix-report',
    width: '320px',
    backgroundColor: '#f8f8f8',
    borderRadius: '25px',
    rtl: false,
    zindex: 4002,
    backOverlay: true,
    backOverlayColor: 'rgba(0,0,0,0.5)',
    backOverlayClickToClose: false,
    fontFamily: 'Quicksand',
    svgSize: '110px',
    plainText: true,
    titleFontSize: '16px',
    titleMaxLength: 34,
    messageFontSize: '13px',
    messageMaxLength: 400,
    buttonFontSize: '14px',
    buttonMaxLength: 34,
    cssAnimation: true,
    cssAnimationDuration: 360,
    cssAnimationStyle: 'fade',
    success: {
        svgColor: '#32c682',
        titleColor: '#1e1e1e',
        messageColor: '#242424',
        buttonBackground: '#32c682',
        buttonColor: '#fff',
        backOverlayColor: 'rgba(50,198,130,0.2)',
    },
    failure: {
        svgColor: '#3b14cac5',
        titleColor: '#1e1e1e',
        messageColor: '#242424',
        buttonBackground: '#3b14cac5',
        buttonColor: '#fff',
        backOverlayColor: 'rgba(0, 0, 0, 0.69)',
    },
    warning: {
        svgColor: '#eebf31',
        titleColor: '#1e1e1e',
        messageColor: '#242424',
        buttonBackground: '#eebf31',
        buttonColor: '#fff',
        backOverlayColor: 'rgba(238,191,49,0.2)',
    },
    info: {
        svgColor: '#3b14cac5',
        titleColor: '#1e1e1e',
        messageColor: '#242424',
        buttonBackground: '#3b14cac5',
        buttonColor: '#fff',
        backOverlayColor: 'rgba(0, 0, 0, 0.69)',
    },
});

const defaultDomains = ['gmail.com'];
const STORAGE_KEYS = { domains: 'testgen_domains', format: 'testgen_format', count: 'testgen_count', groups: 'testgen_groups' };
let generatedByWord = {};
let orderList = [];

// === LISTAS DE NOMBRES Y LÓGICA DE BARREDO ===
const nombres = ["Carlos","María","Juan","Lucía","Pedro","Laura","Andrés","Camila","José","Valentina","David","Daniela","Felipe","Sara","Miguel","Paula","Santiago","Isabela","Alejandro","Natalia","Julián","Fernanda","Ricardo","Adriana","Sebastián","Carolina","Manuel","Andrea","Tomás","Gabriela","Cristian","Juliana","Jorge","Verónica","Simón","Melissa","Diego","Rocío","Nicolás","Ángela","Samuel","Claudia","Esteban","Vanessa","Mauricio","Tatiana","Kevin","Diana","Emilio","Sofía","Mateo","Florencia","Elena","Pablo","Victoria","Martín","Mónica","Raúl","Patricia","Iván","Luciano","Olga","Leonardo","Teresa","Francisco","Elsa","Alan","Beatriz","Mario","Jimena","Rubén","Margarita","Óscar","Nadia","Cristóbal","Noelia","Rodrigo","Cecilia","Fabián","Lina","Germán","Gloria","Hugo","Susana","Eduardo","Clara","Bruno","Renata","Raquel","Omar","Álvaro","Milena","Lautaro","Nicole","Enrique","Eliana","Agustín","Carla","Joel","Tatiana"];
const apellidos = ["Gómez","Rodríguez","Martínez","López","García","Pérez","Sánchez","Ramírez","Torres","Flores","Díaz","Vargas","Castro","Moreno","Jiménez","Rojas","Hernández","Ortiz","Navarro","Cortés","Guerrero","Suárez","Mendoza","Reyes","Álvarez","Romero","Cabrera","Chávez","Salazar","Ortega","Mejía","Vega","Cardona","Campos","Peña","Pardo","Fuentes","Silva","León","Carrillo","Valencia","Camacho","Cárdenas","Mora","Rubio","Rincón","Bermúdez","Escobar","Blanco","Acosta","Herrera","Muñoz","Medina","Aguilar","Montoya","Calderón","Palacios","Nieto","Rivas","Zamora","Padilla","Cuellar","Delgado","Benítez","Maldonado","Ospina","Rivera","Serrano","Luna","Barrios","Reina","Ibáñez","Fajardo","Arango","Perdomo","Plata","Forero","Tovar","Giraldo","Osorio","Rosales","Bautista","Uribe","Rico","Murillo","Castaño","Pinto","Cruz","Quintero","Sandoval","Prieto","Núñez","Carvajal","Ruiz","Bonilla","Cifuentes","Patiño","Tapia","Camargo","Hoyos"];

function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
let nombresBarajados = shuffle([...nombres]);
let apellidosBarajados = shuffle([...apellidos]);
let indexNombre = 0;

function generarNombreCompleto() {
    if (indexNombre >= 100) { indexNombre = 0; nombresBarajados = shuffle([...nombres]); apellidosBarajados = shuffle([...apellidos]); }
    const res = `${nombresBarajados[indexNombre]} ${apellidosBarajados[indexNombre]}`;
    indexNombre++;
    return res;
}

// === SELECTORES ===
const domainSelect = document.getElementById('domainSelect');
const wordInput = document.getElementById('word');
const countryInput = document.getElementById('countryInput');
const phoneInput = document.getElementById('phoneInput');
const generateBtn = document.getElementById('generate');
const resultList = document.getElementById('resultList');
const tbody = resultList.querySelector('tbody');
const formatSelect = document.getElementById('format');
const countInput = document.getElementById('countInput');
const customDateInput = document.getElementById('customDate');

// === FUNCIONES DE APOYO ===
function sanitizeDomain(d) { if(!d) return ''; d = d.trim().replace(/^@+/, ''); if(!/\.[a-zA-Z]{2,}$/.test(d)) d += '.com'; return d; }
function sanitizeWord(w) { return w ? w.trim().replace(/[^a-zA-Z0-9._-]/g, '_') : 'test'; }

function formatDate(date, fmt) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    switch (fmt) {
        case 'DD-MM-YYYY': return `${d}-${m}-${y}`;
        case 'MM-DD-YYYY': return `${m}-${d}-${y}`;
        case 'YYYY-MM-DD': return `${y}-${m}-${d}`;
        default: return `${y}-${m}-${d}`;
    }
}

function renderAll() {
    tbody.innerHTML = '';
    let hasData = false;
    orderList.forEach(word => {
        (generatedByWord[word] || []).forEach(item => {
            hasData = true;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.email}</td><td>${item.name}</td><td>${item.phone}</td><td>${item.country}</td>`;
            tbody.appendChild(tr);
        });
    });
    resultList.style.display = hasData ? 'table' : 'none';
}

// === BOTÓN GENERAR (ACTUALIZADO CON FECHA DEL VIEJO) ===
generateBtn.addEventListener('click', () => {
    const rawWord = wordInput.value || 'test';
    const word = sanitizeWord(rawWord);
    
    if (generatedByWord[word]) return;

    const domain = domainSelect.value;
    const fmt = formatSelect.value;
    const customDate = customDateInput.value;
    const count = parseInt(countInput.value) || 1;
    const country = countryInput.value.trim();
    const phone = phoneInput.value.trim();

    const newEntries = [];
    const usedNumbers = new Set();

    for (let i = 0; i < count; i++) {
        const dateStr = customDate ? formatDate(new Date(customDate), fmt) : formatDate(new Date(), fmt);
        
        let phoneSuffix = '';
        if (phone) {
            const numStr = phone.replace(/\D/g, '');
            let lastTwo;
            do { lastTwo = Math.floor(Math.random() * 100).toString().padStart(2, '0'); } 
            while (usedNumbers.has(lastTwo));
            usedNumbers.add(lastTwo);
            phoneSuffix = numStr.slice(0, -2) + lastTwo;
        }

        newEntries.push({
            email: `${word}.${i + 1}-${dateStr}@${domain}`,
            name: generarNombreCompleto(),
            phone: phoneSuffix,
            country: country
        });
    }

    generatedByWord[word] = newEntries;
    orderList.push(word);
    renderAll();
    Notiflix.Notify.success(`Generados ${count} registros`);
});

// === FUNCIONALIDAD DE GRUPOS ===
const groupsModal = document.getElementById('groupsModal');
const groupsContainer = document.getElementById('groupsContainer');

document.getElementById('openGroups').onclick = () => { renderGroups(); groupsModal.style.display = "flex"; };
document.getElementById('closeGroups').onclick = () => { groupsModal.style.display = "none"; };

document.getElementById('saveCurrentGroup').onclick = () => {
    const name = document.getElementById('groupName').value.trim();
    if (!name) return Notiflix.Notify.warning('Escribe un nombre');
    
    const allData = [];
    orderList.forEach(w => allData.push(...generatedByWord[w]));
    if (allData.length === 0) return Notiflix.Notify.failure('No hay datos');

    const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.groups) || '[]');
    groups.push({ id: Date.now(), name, data: allData });
    localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups));
    
    document.getElementById('groupName').value = '';
    renderGroups();
    Notiflix.Notify.success('Guardado');
};

function renderGroups() {
    const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.groups) || '[]');
    groupsContainer.innerHTML = groups.length ? '' : '<p style="text-align:center">Vacío</p>';
    groups.forEach(g => {
        const div = document.createElement('div');
        div.style = "display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:10px; margin-bottom:8px; border-radius:8px; align-items:center;";
        div.innerHTML = `<div><strong>${g.name}</strong><br><small>${g.data.length} registros</small></div>
            <div>
                <button onclick="loadAsRegister(${g.id})" style="background:#6366f1; color:white; padding:5px; font-size:12px;">Registro</button>
                <button onclick="loadGroup(${g.id})" style="background:#22c55e; color:white; padding:5px; font-size:12px;">Cargar</button>
                <button onclick="deleteGroup(${g.id})" style="background:#ef4444; color:white; padding:5px; font-size:12px;">X</button>
            </div>`;
        groupsContainer.appendChild(div);
    });
}

// carga los grupos sin cambios
window.loadAsRegister = (id) => {
    const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.groups) || '[]');
    const group = groups.find(g => g.id === id);
    
    if (group) {
        // Asignamos la data directamente sin aplicar lógica de aleatoriedad
        generatedByWord = { [group.name]: [...group.data] };
        orderList = [group.name];
        
        renderAll(); // Refresca la tabla principal
        groupsModal.style.display = 'none'; // Cierra el modal
        Notiflix.Notify.info(`Registro "${group.name}" cargado sin cambios`);
    }
};

window.loadGroup = (id) => {
    const groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.groups) || '[]');
    const group = groups.find(g => g.id === id);
    
    if (group) {
        const usedNumbersLoad = new Set();
        const hoy = new Date();
        const fmt = formatSelect.value; // Usa el formato seleccionado actualmente
        const nuevaFechaStr = formatDate(hoy, fmt);

        const updatedLeads = group.data.map(item => {
            // 1. Actualizar Teléfono
            let newPhone = item.phone;
            if (item.phone && item.phone.length > 2) {
                let lastTwo;
                do { 
                    lastTwo = Math.floor(Math.random() * 100).toString().padStart(2, '0'); 
                } while (usedNumbersLoad.has(lastTwo));
                usedNumbersLoad.add(lastTwo);
                newPhone = item.phone.slice(0, -2) + lastTwo;
            }
            
            let newEmail = item.email;
            if (newEmail.includes('-') && newEmail.includes('@')) {
                const partes = newEmail.split('@');
                const prefijo = partes[0].split('-'); 
                // prefijo[0] suele ser "palabra.numero", prefijo[1] la fecha vieja
                newEmail = `${prefijo[0]}-${nuevaFechaStr}@${partes[1]}`;
            }

            return { 
                ...item, 
                email: newEmail,
                name: generarNombreCompleto(), 
                phone: newPhone 
            };
        });

        generatedByWord = { [group.name]: updatedLeads };
        orderList = [group.name];
        renderAll();
        groupsModal.style.display = 'none';
        Notiflix.Notify.success(`Cargado: ${group.name} con fecha y datos actualizados`);
    }
};

window.deleteGroup = (id) => {
    let groups = JSON.parse(localStorage.getItem(STORAGE_KEYS.groups) || '[]');
    groups = groups.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups));
    renderGroups();
};

// === EXPORTAR Y LIMPIAR ===
document.getElementById('clearList').onclick = () => { generatedByWord = {}; orderList = []; renderAll(); };

document.getElementById('exportExcel').onclick = () => {
    if (orderList.length === 0) return Notiflix.Report.failure('No hay datos','','OK');
    const data = [];
    orderList.forEach(word => { (generatedByWord[word] || []).forEach(item => data.push({ "Correo": item.email, "Nombre": item.name, "Celular": item.phone, "País": item.country })); });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Correos");
    XLSX.writeFile(wb, "correos_generados.xlsx");
};

// === INICIALIZACIÓN Y PERSISTENCIA ===
function loadDomains(){
    const raw = localStorage.getItem(STORAGE_KEYS.domains);
    let list = raw ? JSON.parse(raw) : defaultDomains;
    domainSelect.innerHTML = '';
    list.forEach(d => { const opt = document.createElement('option'); opt.value = d; opt.textContent = d; domainSelect.appendChild(opt); });
}

function loadFormat(){
    const savedFormat = localStorage.getItem(STORAGE_KEYS.format);
    if(savedFormat) formatSelect.value = savedFormat;
}

formatSelect.addEventListener('change', () => { localStorage.setItem(STORAGE_KEYS.format, formatSelect.value); });

const themeSwitch = document.getElementById('switch');
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('light-mode', themeSwitch.checked);
    localStorage.setItem('theme', themeSwitch.checked ? 'light' : 'dark');
});

// Modales y Carga Inicial
const modalOriginal = document.getElementById("countryModal");
document.getElementById("openModal").onclick = () => modalOriginal.style.display = "flex";
document.getElementById("closeModal").onclick = () => modalOriginal.style.display = "none";

window.addEventListener('DOMContentLoaded', () => {
    loadDomains();
    loadFormat();
    if (localStorage.getItem('theme') === 'light') { document.body.classList.add('light-mode'); themeSwitch.checked = true; }

});
