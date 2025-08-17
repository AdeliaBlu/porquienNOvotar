// Carga de datos y renderizado
const state = {
  data: [],
  filtered: [],
};

const q = document.getElementById('q');
const selPartido = document.getElementById('filter-partido');
const selRegion = document.getElementById('filter-region');
const selEstado = document.getElementById('filter-estado');
const results = document.getElementById('results');
const stats = document.getElementById('stats');

function riesgoDe(antecedentes) {
  const tieneCondena = antecedentes.some(a => a.estado === 'condena_firme');
  const enCurso = antecedentes.some(a => ['investigacion_preliminar','investigacion_formalizada','acusacion','juicio','sentencia_1ra_instancia'].includes(a.estado));
  if (tieneCondena) return {nivel:'Alto', clase:'red', key:'condena_firme'};
  if (enCurso) return {nivel:'Medio', clase:'yellow', key:'proceso_en_curso'};
  return {nivel:'Bajo', clase:'green', key:'sin_procesos'};
}

function llenarFiltros(data) {
  const partidos = Array.from(new Set(data.map(d => d.partido).filter(Boolean))).sort();
  const regiones = Array.from(new Set(data.map(d => d.region).filter(Boolean))).sort();
  for (const p of partidos) selPartido.insertAdjacentHTML('beforeend', `<option value="${p}">${p}</option>`);
  for (const r of regiones) selRegion.insertAdjacentHTML('beforeend', `<option value="${r}">${r}</option>`);
}

function filtrar() {
  const term = (q.value || '').trim().toLowerCase();
  const p = selPartido.value;
  const r = selRegion.value;
  const e = selEstado.value;

  state.filtered = state.data.filter(c => {
    const okTerm = !term || (c.nombre.toLowerCase().includes(term) || (c.partido||'').toLowerCase().includes(term));
    const okP = !p || c.partido === p;
    const okR = !r || c.region === r;
    const risk = riesgoDe(c.antecedentes || []);
    const okE = !e || (e === risk.key);
    return okTerm && okP && okR && okE;
  });

  render();
}

function render() {
  results.innerHTML = '';
  const total = state.filtered.length;
  const conCondena = state.filtered.filter(c => riesgoDe(c.antecedentes).key === 'condena_firme').length;
  const enCurso = state.filtered.filter(c => riesgoDe(c.antecedentes).key === 'proceso_en_curso').length;
  const sinProc = total - conCondena - enCurso;
  stats.textContent = `Resultados: ${total} | Condena firme: ${conCondena} · En curso: ${enCurso} · Sin procesos: ${sinProc}`;

  for (const c of state.filtered) {
    const risk = riesgoDe(c.antecedentes || []);
    const count = (c.antecedentes || []).length;
    const tipos = Array.from(new Set((c.antecedentes || []).map(a => a.tipo)));
    const tagTipos = tipos.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join(' ');

    const card = document.createElement('article');
    card.className = 'card-candidato';

    card.innerHTML = `
      <div class="header">
        <img class="avatar" src="${c.foto || 'https://via.placeholder.com/128x128.png?text=Candidato'}" alt="Foto de ${c.nombre}"/>
        <div>
          <div class="row between center">
            <h3 style="margin:0">${c.nombre}</h3>
            <span class="badge ${risk.clase}" title="Nivel de riesgo según estado de procesos">${risk.nivel}</span>
          </div>
          <div class="meta">${c.partido || 'Partido no registrado'} · ${c.region || 'Región no indicada'}</div>
          <div class="tags">${tagTipos}</div>
        </div>
      </div>
      <div class="body">
        ${count ? `${count} antecedente(s) registrado(s).` : `Sin antecedentes registrados en esta base.`}
      </div>
      <div class="footer">
        <button class="ver">Ver ficha</button>
        <button class="ghost compartir">Compartir</button>
      </div>
    `;

    card.querySelector('.ver').addEventListener('click', () => abrirModal(c));
    card.querySelector('.compartir').addEventListener('click', async () => {
      const url = `${location.origin}${location.pathname}#${encodeURIComponent(c.id)}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
      } else {
        prompt('Copia este enlace:', url);
      }
    });

    results.appendChild(card);
  }
}

function abrirModal(c) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  title.textContent = c.nombre;
  const risk = riesgoDe(c.antecedentes || []);

  const filas = (c.antecedentes || []).map(a => `
    <tr>
      <td>${a.tipo}</td>
      <td>${a.estado.replaceAll('_',' ')}</td>
      <td>${a.fecha || '-'}</td>
      <td>${a.expediente || '-'}</td>
      <td>${a.descripcion || '-'}</td>
      <td><a class="fuente" target="_blank" rel="noopener noreferrer" href="${a.fuente_url}">Ver fuente</a></td>
    </tr>
  `).join('');

  body.innerHTML = `
    <div class="row gap">
      <img class="avatar" src="${c.foto || 'https://via.placeholder.com/128x128.png?text=Candidato'}" alt="Foto de ${c.nombre}" />
      <div>
        <div class="meta">${c.partido || 'Partido no registrado'} · ${c.region || 'Región no indicada'}</div>
        <div class="badge ${risk.clase}" style="margin-top:.4rem">${risk.nivel}</div>
      </div>
    </div>
    <h4>Antecedentes</h4>
    ${filas ? `
      <div style="overflow:auto">
        <table>
          <thead>
            <tr>
              <th>Tipo</th><th>Estado</th><th>Fecha</th><th>Expediente</th><th>Resumen</th><th>Fuente</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>` : `<p>No se registran antecedentes en esta base.</p>`}
    <p class="meta">Nota: Los procesos en curso no implican culpabilidad. Se muestran con fines informativos.</p>
  `;

  const closeBtn = document.getElementById('modal-close');
  closeBtn.onclick = () => modal.close();
  modal.showModal();
}

async function init() {
  const res = await fetch('data/candidatos.json', { cache: 'no-store' });
  const data = await res.json();
  state.data = data;
  llenarFiltros(data);
  filtrar();

  // Soporta compartir por hash #id
  if (location.hash) {
    const id = decodeURIComponent(location.hash.slice(1));
    const c = data.find(x => String(x.id) === id);
    if (c) abrirModal(c);
  }
}

['input','change'].forEach(evt => {
  [q, selPartido, selRegion, selEstado].forEach(el => el.addEventListener(evt, filtrar));
});

init().catch(err => {
  console.error(err);
  results.innerHTML = '<p>Error cargando datos. Revisa "data/candidatos.json".</p>';
});
