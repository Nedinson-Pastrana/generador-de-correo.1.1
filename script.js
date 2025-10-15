const defaultDomains=['gmail.com'];
const STORAGE_KEYS={domains:'testgen_domains',format:'testgen_format',count:'testgen_count'};
let generatedByWord={};
let orderList=[];

// === NUEVO: listas de nombres y apellidos ===
const nombres = ["Carlos","María","Juan","Lucía","Pedro","Laura","Andrés","Camila","José","Valentina","David","Daniela","Felipe","Sara","Miguel","Paula"];
const apellidos = ["Gómez","Rodríguez","Martínez","López","García","Pérez","Sánchez","Ramírez","Torres","Flores","Díaz","Vargas","Castro","Moreno","Jiménez","Rojas"];

function generarNombreCompleto() {
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  return `${nombre} ${apellido}`;
}

function sanitizeDomain(d){
  if(!d) return '';
  d = d.trim();
  d = d.replace(/^@+/, '');
  if(!/\.[a-zA-Z]{2,}$/.test(d)) d += '.com';
  return d; 
}

function sanitizeWord(w){if(!w) return 'test'; return w.trim().replace(/[^a-zA-Z0-9._-]/g,'_');}

function formatDate(date, fmt) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  switch (fmt) {
    case 'DD-MM-YYYY':
      return `${d}-${m}-${y}`;
    case 'MM-DD-YYYY':
      return `${m}-${d}-${y}`;
    case 'YYYY-MM-DD':
      return `${y}-${m}-${d}`; // antes sin separadores
    default:
      return `${y}-${m}-${d}`;
  }
}

const domainSelect=document.getElementById('domainSelect');
const wordInput=document.getElementById('word');
const countryInput=document.getElementById('countryInput');
const phoneInput=document.getElementById('phoneInput');
const generateBtn=document.getElementById('generate');
const newDomainInput=document.getElementById('newDomain');
const addDomainBtn=document.getElementById('addDomain');
const resultList=document.getElementById('resultList');
const tbody=resultList.querySelector('tbody');
const formatSelect=document.getElementById('format');
const customDateInput=document.getElementById('customDate');
const exportExcelBtn=document.getElementById('exportExcel');
const clearListBtn=document.getElementById('clearList');
const countInput=document.getElementById('countInput');

function loadDomains(){
  const raw=localStorage.getItem(STORAGE_KEYS.domains);
  let list=raw?JSON.parse(raw):defaultDomains.slice();
  list=Array.from(new Set(list.map(d=>sanitizeDomain(d)).filter(Boolean)));
  if(list.length===0) list=defaultDomains.slice();
  domainSelect.innerHTML='';
  list.forEach(d=>{
    const opt=document.createElement('option');
    opt.value=d;
    opt.textContent=d;
    domainSelect.appendChild(opt);
  });
  localStorage.setItem(STORAGE_KEYS.domains,JSON.stringify(list));
}

function addDomain(){
  const raw=newDomainInput.value;
  const d=sanitizeDomain(raw);
  if(!d) return alert('Introduce un dominio válido.');
  const curr=JSON.parse(localStorage.getItem(STORAGE_KEYS.domains)||'[]');
  curr.unshift(d);
  localStorage.setItem(STORAGE_KEYS.domains,JSON.stringify(Array.from(new Set(curr))));
  newDomainInput.value='';
  loadDomains();
}

// === MODIFICADA: genera últimos dígitos aleatorios únicos ===
function makeEmail(word, domain, fmt, customDate, index = 0, country = '', phone = '', usedNumbers = new Set()) {
  const cleanWord = sanitizeWord(word);
  const date = customDate ? formatDate(new Date(customDate), fmt) : formatDate(new Date(), fmt);
  let phoneSuffix = '';

  if (phone) {
    const numStr = phone.replace(/\D/g, '');
    let lastTwo;

    // Generar número aleatorio único de 2 dígitos (00-99)
    do {
      lastTwo = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    } while (usedNumbers.has(lastTwo));
    usedNumbers.add(lastTwo);

    phoneSuffix = numStr.slice(0, -2) + lastTwo;
  }

  return { email: `${cleanWord}.${index + 1}-${date}@${domain}`, phone: phoneSuffix, country };
}

// === MODIFICADO: render incluye columna "Nombre" ===
function renderAll(){
  tbody.innerHTML='';
  if(orderList.length>0) resultList.style.display='table';
  orderList.forEach(word=>{
    const list=generatedByWord[word]||[];
    list.forEach(itemData=>{
      const tr=document.createElement('tr');
      const tdEmail=document.createElement('td');
      const tdNombre=document.createElement('td');
      const tdPhone=document.createElement('td');
      const tdCountry=document.createElement('td');

      tdEmail.textContent=itemData.email;
      tdNombre.textContent=itemData.name; // nuevo campo nombre
      tdPhone.textContent=itemData.phone;
      tdCountry.textContent=itemData.country;

      tr.appendChild(tdEmail);
      tr.appendChild(tdNombre);
      tr.appendChild(tdPhone);
      tr.appendChild(tdCountry);
      tbody.appendChild(tr);
    });
  });
}

// === GENERAR correos ===
generateBtn.addEventListener('click',()=>{
  const rawWord=wordInput.value||'test';
  const word=sanitizeWord(rawWord);
  const domain=domainSelect.value;
  const fmt=formatSelect.value;
  const customDate=customDateInput.value;
  const count=parseInt(countInput.value)||1;
  const country=countryInput.value.trim();
  const phone=phoneInput.value.trim();

  if(!generatedByWord[word]){
    const newEmails=[];
    const usedNumbers = new Set(); // <- evitar dígitos repetidos

    for(let i=0;i<count;i++){
      const emailObj=makeEmail(word,domain,fmt,customDate,i,country,phone,usedNumbers);
      emailObj.name = generarNombreCompleto();
      newEmails.push(emailObj);
    }

    generatedByWord[word]=newEmails;
    orderList.push(word);
  }
  renderAll();
});

clearListBtn.addEventListener('click',()=>{
  generatedByWord={};
  orderList=[];
  tbody.innerHTML='';
  resultList.style.display='none';
});

exportExcelBtn.addEventListener('click', () => {
  if (orderList.length === 0) return alert('No hay datos para exportar.');

  const data = [];
  orderList.forEach(word => {
    const list = generatedByWord[word] || [];
    list.forEach(item => {
      data.push({
        "Correo": item.email,
        "Nombre": item.name,
        "Celular": item.phone,
        "País": item.country
      });
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Correos Generados");
  XLSX.writeFile(wb, "correos_generados.xlsx");
});

loadDomains();
addDomainBtn.addEventListener('click',addDomain);
newDomainInput.addEventListener('keypress',(e)=>{if(e.key==='Enter') addDomain();});

function loadFormat(){
  const savedFormat=localStorage.getItem(STORAGE_KEYS.format);
  if(savedFormat) formatSelect.value=savedFormat;
}
formatSelect.addEventListener('change',()=>{localStorage.setItem(STORAGE_KEYS.format,formatSelect.value);});

window.addEventListener('DOMContentLoaded',()=>{wordInput.value='';});
loadFormat();

// === TOGGLE MODO OSCURO/CLARO ===
const themeSwitch = document.getElementById('switch');
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
  themeSwitch.checked = true;
}
themeSwitch.addEventListener('change', () => {
  if (themeSwitch.checked) {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  }
});


// ==== MODAL ====
const modal = document.getElementById("countryModal");
const btn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

btn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};



