    const defaultDomains=['gmail.com'];
    const STORAGE_KEYS={domains:'testgen_domains',format:'testgen_format',count:'testgen_count'};
    let generatedByWord={};
    let orderList=[];

function sanitizeDomain(d){
    if(!d) return '';
    d = d.trim();
    d = d.replace(/^@+/, '');
    if(!/\.[a-zA-Z]{2,}$/.test(d)) d += '.com';
    return d; 
}

    function sanitizeWord(w){if(!w) return 'test'; return w.trim().replace(/[^a-zA-Z0-9._-]/g,'_');}
    function formatDate(date,fmt){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0'); switch(fmt){case 'YYYY-MM-DD':return `${y}-${m}-${d}`; case 'DD-MM-YYYY':return `${d}-${m}-${y}`; case 'YYYYMMDD':return `${y}${m}${d}`; case 'DDMMYYYY':return `${d}${m}${y}`; default:return `${y}-${m}-${d}`;}}

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

    function loadDomains(){const raw=localStorage.getItem(STORAGE_KEYS.domains); let list=raw?JSON.parse(raw):defaultDomains.slice(); list=Array.from(new Set(list.map(d=>sanitizeDomain(d)).filter(Boolean))); if(list.length===0) list=defaultDomains.slice(); domainSelect.innerHTML=''; list.forEach(d=>{const opt=document.createElement('option'); opt.value=d; opt.textContent=d; domainSelect.appendChild(opt);}); localStorage.setItem(STORAGE_KEYS.domains,JSON.stringify(list));}
    function addDomain(){const raw=newDomainInput.value; const d=sanitizeDomain(raw); if(!d) return alert('Introduce un dominio válido.'); const curr=JSON.parse(localStorage.getItem(STORAGE_KEYS.domains)||'[]'); curr.unshift(d); localStorage.setItem(STORAGE_KEYS.domains,JSON.stringify(Array.from(new Set(curr)))); newDomainInput.value=''; loadDomains();}

    function makeEmail(word,domain,fmt,customDate,index=0,country='',phone=''){const cleanWord=sanitizeWord(word); const date=customDate?formatDate(new Date(customDate),fmt):formatDate(new Date(),fmt); let phoneSuffix=''; if(phone){ const numStr=phone.replace(/\D/g,''); const lastTwo=(index%100).toString().padStart(2,'0'); phoneSuffix=numStr.slice(0,-2)+lastTwo;} return {email:`${cleanWord}.${index+1}-${date}@${domain}`,phone:phoneSuffix,country};}

    function renderAll(){tbody.innerHTML=''; if(orderList.length>0) resultList.style.display='table'; orderList.forEach(word=>{const list=generatedByWord[word]||[]; list.forEach(itemData=>{const tr=document.createElement('tr'); const tdEmail=document.createElement('td'); tdEmail.textContent=itemData.email; const tdPhone=document.createElement('td'); tdPhone.textContent=itemData.phone; const tdCountry=document.createElement('td'); tdCountry.textContent=itemData.country; tr.appendChild(tdEmail); tr.appendChild(tdPhone); tr.appendChild(tdCountry); tbody.appendChild(tr);});});}

    generateBtn.addEventListener('click',()=>{
      const rawWord=wordInput.value||'test'; const word=sanitizeWord(rawWord);
      const domain=domainSelect.value;
      const fmt=formatSelect.value;
      const customDate=customDateInput.value;
      const count=parseInt(countInput.value)||1;
      const country=countryInput.value.trim();
      const phone=phoneInput.value.trim();

      const newEmails=[];
      for(let i=0;i<count;i++){ const emailObj=makeEmail(word,domain,fmt,customDate,i,country,phone); newEmails.push(emailObj);}

      if(!orderList.includes(word)) orderList.push(word);
      generatedByWord[word]=newEmails;
      renderAll();
    });

    clearListBtn.addEventListener('click',()=>{generatedByWord={}; orderList=[]; tbody.innerHTML=''; resultList.style.display='none';});
exportExcelBtn.addEventListener('click', () => {
  if(orderList.length === 0) return alert('No hay datos para exportar.');

  // Encabezados del CSV usando ; como separador
  let csv = '\uFEFFCorreo;Celular;País\n'; 

  orderList.forEach(word => {
    const list = generatedByWord[word] || [];
    list.forEach(item => {
      const email = `"${item.email.replace(/"/g, '""')}"`;
      const phone = `"${item.phone.replace(/"/g, '""')}"`;
      const country = `"${item.country.replace(/"/g, '""')}"`;
      csv += `${email};${phone};${country}\n`;
    });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'correos_generados.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
loadDomains();

// permite agregar dominio con el boton y con el boton enter
addDomainBtn.addEventListener('click', addDomain);
newDomainInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') addDomain();
});

// guarda el formato de fecha selecionado
function loadFormat() {
    const savedFormat = localStorage.getItem(STORAGE_KEYS.format);
    if(savedFormat) formatSelect.value = savedFormat;
}

formatSelect.addEventListener('change', () => {
    localStorage.setItem(STORAGE_KEYS.format, formatSelect.value);
});

// limpia el input de palabra al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  wordInput.value = '';
});

loadFormat();