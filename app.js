// Tableau pour stocker les PNJ
let pnjs = JSON.parse(localStorage.getItem('pnjs')) || [];
let currentTurnId = localStorage.getItem('currentTurnId') || null;
let currentRound = parseInt(localStorage.getItem('currentRound')) || 1;
let turnStarted = localStorage.getItem('turnStarted') === 'true';

// Éléments DOM
const pnjList = document.getElementById('pnjList');

const addPnjBtn = document.getElementById('addPnjBtn');
const pnjModal = document.getElementById('pnjModal');

const validatePnjBtn = document.getElementById('validatePnjBtn');
const cancelPnjBtn = document.getElementById('cancelPnjBtn');
const resetBtn = document.getElementById('resetBtn');
const addPcBtn = document.getElementById('addPcBtn');
const turnPanel = document.getElementById('turnPanel');
const nextTurnBtn = document.getElementById('nextTurnBtn');
const turnTitle = document.querySelector('.turn-title');
const turnName = document.getElementById('turnName');
const turnMeta = document.getElementById('turnMeta');

const pcModal = document.getElementById('pcModal');
const validatePcBtn = document.getElementById('validatePcBtn');
const cancelPcBtn = document.getElementById('cancelPcBtn');

// Modale dégâts
const damageModal = document.getElementById('damageModal');
const applyDamageBtn = document.getElementById('applyDamageBtn');
const cancelDamageBtn = document.getElementById('cancelDamageBtn');

let currentDamageIndex = null;
let currentEditIndex = null;

function createPnjId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ensurePnjIds() {
  let changed = false;

  pnjs.forEach((pnj) => {
    if (!pnj.id) {
      pnj.id = createPnjId();
      changed = true;
    }
  });

  if (changed) save();
}

function saveTurn() {
  if (currentTurnId) {
    localStorage.setItem('currentTurnId', currentTurnId);
  } else {
    localStorage.removeItem('currentTurnId');
  }

  localStorage.setItem('currentRound', currentRound);
  localStorage.setItem('turnStarted', turnStarted ? 'true' : 'false');
}

function normalizeTurnState() {
  if (pnjs.length === 0) {
    currentTurnId = null;
    currentRound = 1;
    turnStarted = false;
    saveTurn();
    return;
  }

  const currentExists = pnjs.some((pnj) => pnj.id === currentTurnId);

  if (!turnStarted || !currentExists) {
    currentTurnId = pnjs[0].id;
  }

  if (!currentRound || currentRound < 1) {
    currentRound = 1;
  }

  saveTurn();
}

function updateTurnPanel() {
  const currentIndex = pnjs.findIndex((pnj) => pnj.id === currentTurnId);

  if (currentIndex === -1) {
    turnPanel.style.borderColor = '#ffd400';
    turnName.style.color = '#f2f2f2';
    turnTitle.style.color = '#ffd400';
    nextTurnBtn.style.background = '#ffd400';
    nextTurnBtn.style.borderColor = '#ffd400';
    turnName.textContent = 'Aucun personnage';
    turnMeta.textContent = 'Ajoute des personnages pour démarrer le combat.';
    turnMeta.style.color = '#aaa';
    nextTurnBtn.disabled = true;
    return;
  }

  const currentPnj = pnjs[currentIndex];
  const accent = currentPnj.joueur ? '#ffd400' : '#ef2b1d';

  turnPanel.style.borderColor = accent;
  turnName.style.color = accent;
  turnTitle.style.color = accent;
  nextTurnBtn.style.background = accent;
  nextTurnBtn.style.borderColor = accent;

  turnName.textContent = currentPnj.nom;

  const injuryStatus = getInjuryStatus(currentPnj);
  let turnInfo = `Round ${currentRound} · ${currentIndex + 1}/${pnjs.length} · Initiative ${currentPnj.initiative}`;

  if (!currentPnj.joueur) {
    turnInfo += ` · PS ${currentPnj.ps.actuel}/${currentPnj.ps.max}`;
  }

  turnMeta.style.color = '#aaa';

  if (injuryStatus) {
    turnMeta.innerHTML = `${turnInfo} · <span style="color:${injuryStatus.color}; font-weight:bold;">${injuryStatus.text}</span>`;
  } else {
    turnMeta.textContent = turnInfo;
  }

  nextTurnBtn.disabled = false;
}

function getInjuryStatus(pnj) {
  if (pnj.joueur) return null;

  const halfHP = pnj.ps.max / 2;

  if (pnj.ps.actuel === 0) {
    return {
      color: 'purple',
      text: 'Mortellement blessé (-4 à tous les jets, -6 en MOUV)'
    };
  }

  if (pnj.ps.actuel <= halfHP) {
    return {
      color: 'red',
      text: 'Grièvement blessé (-2 à tous les jets)'
    };
  }

  return null;
}


// ----------------------------
// AFFICHAGE PNJ
// ----------------------------
function renderPnjs() {
  pnjList.innerHTML = '';

  pnjs.sort((a, b) => b.initiative - a.initiative);
  ensurePnjIds();
  normalizeTurnState();
  updateTurnPanel();

  pnjs.forEach((pnj, index) => {

    const pnjItem = document.createElement('div');
    pnjItem.className = 'pnj-item';

    if (pnj.id === currentTurnId) {
      pnjItem.classList.add('active-turn');
    }

    if (pnj.joueur) {
    pnjItem.style.borderColor = "#ffd400";
}

    const accent = pnj.joueur ? "#ffd400" : "#ef2b1d";

    if (pnj.joueur) {

    pnjItem.innerHTML = `
        <div style="display:flex; align-items:center; gap:20px;">

            <div style="
                width:80px;
                min-width:80px;
                height:80px;
                display:flex;
                align-items:center;
                justify-content:center;
                border:3px solid ${accent};
                color:${accent};
                font-size:32px;
                font-weight:bold;
            ">
                ${pnj.initiative}
            </div>

            <div style="flex:1;">
                <strong style="font-size:24px;">
                    ${pnj.nom}
                </strong>
            </div>

            <button class="delete-btn" data-index="${index}">
                −
            </button>

        </div>
    `;

    pnjList.appendChild(pnjItem);
    return;
}

    let statusHTML = '';
    const injuryStatus = getInjuryStatus(pnj);

    if (injuryStatus) {
      statusHTML = `
        <div style="margin-top:5px; font-weight:bold; color:${injuryStatus.color};">
          ${injuryStatus.text}
        </div>
      `;
    }

    pnjItem.innerHTML = `
      <div style="display:flex; gap:20px; align-items:flex-start;">

  <!-- Initiative -->
  <div style="
      width:80px;
      min-width:80px;
      height:80px;

      display:flex;
      align-items:center;
      justify-content:center;

      border:3px solid ${accent};

      color:${accent};

      font-size:32px;
      font-weight:bold;
  ">
    ${pnj.initiative}
  </div>

  <!-- Informations -->
  <div style="flex:1;">

    <div style="display:flex; justify-content:space-between; align-items:flex-start;">

      <div>

        <strong style="font-size:22px;">
          ${pnj.nom}
        </strong>

        ${statusHTML}

      </div>

      <div>

        <button class="damage-btn" data-index="${index}">
          Dégâts
        </button>

        <button class="edit-btn" data-index="${index}">
          Modifier
        </button>

        <button class="delete-btn" data-index="${index}">
          −
        </button>

      </div>

    </div>

    <div style="margin-top:15px; display:flex; align-items:center; gap:18px;">

    <div style="
        background:${accent};
        color:black;
        padding:6px 14px;
        font-size:24px;
        font-weight:bold;
        min-width:120px;
        text-align:center;
    ">
        PS ${pnj.ps.actuel}/${pnj.ps.max}
    </div>

    <div style="
        color:#777;
        font-size:18px;
    ">
        REF : ${pnj.ref} &nbsp;|&nbsp; DEX : ${pnj.dex || 0} &nbsp;|&nbsp; Esquive : ${pnj.esquive || 0}
    </div>

</div>

    <div style="margin-top:6px; color:#777; font-size:16px;">

      Armure Corps :
      ${pnj.armureCorps.actuel}/${pnj.armureCorps.max}

      &nbsp;&nbsp;|&nbsp;&nbsp;

      Armure Tête :
      ${pnj.armureTete.actuel}/${pnj.armureTete.max}

    </div>

  </div>

</div>
`;

    pnjList.appendChild(pnjItem);
  });

  // suppression
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      pnjs.splice(index, 1);
      save();
      renderPnjs();
    });
  });

  // dégâts
  document.querySelectorAll('.damage-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentDamageIndex = parseInt(e.target.dataset.index);
      document.getElementById("damageTitle").textContent = pnjs[currentDamageIndex].nom;
      resetDamageModal();
      damageModal.style.display = 'block';
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {

        currentEditIndex = parseInt(e.target.dataset.index);

        const pnj = pnjs[currentEditIndex];

        document.getElementById("pnjModalTitle").textContent = "Modifier un personnage";

        document.getElementById('pnjNom').value = pnj.nom;
        document.getElementById('pnjPS').value = pnj.ps.max;
        document.getElementById('pnjArmureCorps').value = pnj.armureCorps.max;
        document.getElementById('pnjArmureTete').value = pnj.armureTete.max;
        document.getElementById('pnjREF').value = pnj.ref;
        document.getElementById('pnjDEX').value = pnj.dex || 0;
        document.getElementById('pnjEsquive').value = pnj.esquive || 0;
        document.getElementById('pnjInitiative').value = pnj.initiative;
        document.getElementById('pnjCount').value = 1;

        pnjModal.style.display = 'block';
    });
  });
}


// ----------------------------
// SAUVEGARDE
// ----------------------------
function save() {
  localStorage.setItem('pnjs', JSON.stringify(pnjs));
}


// ----------------------------
// MODALE AJOUT PNJ
// ----------------------------
addPnjBtn.addEventListener('click', () => {

  document.getElementById("pnjModalTitle").textContent = "Ajouter un PNJ";
  document.getElementById('pnjNom').value = '';
  document.getElementById('pnjPS').value = '';
  document.getElementById('pnjArmureCorps').value = '';
  document.getElementById('pnjArmureTete').value = '';
  document.getElementById('pnjREF').value = '';
  document.getElementById('pnjDEX').value = '';
  document.getElementById('pnjEsquive').value = '';
  document.getElementById('pnjInitiative').value = '';
  document.getElementById('pnjCount').value = '1';

  pnjModal.style.display = 'block';
});

addPcBtn.addEventListener('click', () => {
    pcModal.style.display = 'block';
});

cancelPcBtn.addEventListener('click', () => {
    pcModal.style.display = 'none';
});

pcModal.addEventListener('click', (e) => {
    if (e.target === pcModal) {
        pcModal.style.display = 'none';
    }
});

cancelPnjBtn.addEventListener('click', () => {
    currentEditIndex = null;
    pnjModal.style.display = 'none';
});

validatePnjBtn.addEventListener('click', () => {

  const nomBase = document.getElementById('pnjNom').value;
  const psMax = parseInt(document.getElementById('pnjPS').value) || 0;
  const armureCorps = parseInt(document.getElementById('pnjArmureCorps').value) || 0;
  const armureTete = parseInt(document.getElementById('pnjArmureTete').value) || 0;
  const ref = parseInt(document.getElementById('pnjREF').value) || 0;
  const dex = parseInt(document.getElementById('pnjDEX').value) || 0;
  const esquive = parseInt(document.getElementById('pnjEsquive').value) || 0;
  const initiative = parseInt(document.getElementById('pnjInitiative').value) || 0;

  const nb = parseInt(document.getElementById('pnjCount')?.value || "1");

  if (
    nomBase) {

    if (currentEditIndex !== null) {

    pnjs[currentEditIndex].nom = nomBase;
    pnjs[currentEditIndex].ps.max = psMax;
    pnjs[currentEditIndex].ps.actuel = Math.min(
        pnjs[currentEditIndex].ps.actuel,
        psMax
    );

    pnjs[currentEditIndex].armureCorps.max = armureCorps;
    pnjs[currentEditIndex].armureCorps.actuel = Math.min(
        pnjs[currentEditIndex].armureCorps.actuel,
        armureCorps
    );

    pnjs[currentEditIndex].armureTete.max = armureTete;
    pnjs[currentEditIndex].armureTete.actuel = Math.min(
        pnjs[currentEditIndex].armureTete.actuel,
        armureTete
    );

    pnjs[currentEditIndex].ref = ref;
    pnjs[currentEditIndex].dex = dex;
    pnjs[currentEditIndex].esquive = esquive;
    pnjs[currentEditIndex].initiative = initiative;

    currentEditIndex = null;

} else {

    for (let i = 1; i <= nb; i++) {

        const nom = nb === 1 ? nomBase : `${nomBase} ${i}`;

        pnjs.push({
            id: createPnjId(),
            joueur:false,
            nom,
            ps: { actuel: psMax, max: psMax },
            armureCorps: { actuel: armureCorps, max: armureCorps },
            armureTete: { actuel: armureTete, max: armureTete },
            ref,
            dex,
            esquive,
            initiative
            
        });
    }
}

    save();
    renderPnjs();

    pnjModal.style.display = 'none';
  }
});

pnjModal.addEventListener('click', (e) => {
    if (e.target === pnjModal) {
        currentEditIndex = null;
        pnjModal.style.display = 'none';
    }
});


// ----------------------------
// MODALE DEGATS
// ----------------------------
function resetDamageModal() {

  document.getElementById('damageValue').value = '';

  document.getElementById('hitHead').checked = false;
  document.getElementById('hitBody').checked = true;

  document.getElementById('ignoreHalf').checked = false;
  document.getElementById('ignoreFull').checked = false;

  document.getElementById('damageArmor').checked = true;
}

function exclusive(a, b) {
  a.addEventListener('change', () => {
    if (a.checked) b.checked = false;
  });

  b.addEventListener('change', () => {
    if (b.checked) a.checked = false;
  });
}

exclusive(
  document.getElementById('hitHead'),
  document.getElementById('hitBody')
);

exclusive(
  document.getElementById('ignoreHalf'),
  document.getElementById('ignoreFull')
);

const ignoreFull = document.getElementById('ignoreFull');
const damageArmor = document.getElementById('damageArmor');


ignoreFull.addEventListener('change', () => {
    if (ignoreFull.checked) {
        damageArmor.checked = false;
    }
});


// application dégâts
applyDamageBtn.addEventListener('click', () => {

  const dmg = parseInt(document.getElementById('damageValue').value);
  if (isNaN(dmg)) return;

  const pnj = pnjs[currentDamageIndex];

  const head = document.getElementById('hitHead').checked;
  const half = document.getElementById('ignoreHalf').checked;
  const full = document.getElementById('ignoreFull').checked;
  const breakArmor = document.getElementById('damageArmor').checked;

  let armorValue = head
    ? pnj.armureTete.actuel
    : pnj.armureCorps.actuel;

  if (full) armorValue = 0;
  else if (half) armorValue = Math.floor(armorValue / 2);

  let damage = dmg - armorValue;
  if (damage < 0) damage = 0;

 const psAvant = pnj.ps.actuel;

pnj.ps.actuel -= damage;
if (pnj.ps.actuel < 0) pnj.ps.actuel = 0;

const psPerdus = psAvant > pnj.ps.actuel;

if (breakArmor && psPerdus) {
    if (head) {
        pnj.armureTete.actuel = Math.max(0, pnj.armureTete.actuel - 1);
    } else {
        pnj.armureCorps.actuel = Math.max(0, pnj.armureCorps.actuel - 1);
    }
}

  save();
  renderPnjs();
  damageModal.style.display = 'none';
});


cancelDamageBtn.addEventListener('click', () => {
  damageModal.style.display = 'none';
});

damageModal.addEventListener('click', (e) => {
  if (e.target === damageModal) {
    damageModal.style.display = 'none';
  }
});

validatePcBtn.addEventListener('click', () => {

    for (let i = 1; i <= 6; i++) {

        const nom = document.getElementById(`pcNom${i}`).value.trim();

        if (!nom) continue;

        const initiative =
            parseInt(document.getElementById(`pcInit${i}`).value) || 0;

        pnjs.push({
            id: createPnjId(),

            nom,

            joueur: true,

            ps: { actuel: 0, max: 0 },

            armureCorps: { actuel: 0, max: 0 },

            armureTete: { actuel: 0, max: 0 },

            ref: 0,

            initiative

        });

    }

    save();
    renderPnjs();

    pcModal.style.display = "none";

});

// ----------------------------
// INIT
// ----------------------------
renderPnjs();

nextTurnBtn.addEventListener('click', () => {
  if (pnjs.length === 0) return;

  pnjs.sort((a, b) => b.initiative - a.initiative);

  const currentIndex = pnjs.findIndex((pnj) => pnj.id === currentTurnId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % pnjs.length;

  turnStarted = true;

  if (currentIndex !== -1 && nextIndex === 0) {
    currentRound += 1;
  }

  currentTurnId = pnjs[nextIndex].id;
  saveTurn();
  renderPnjs();
});

resetBtn.addEventListener('click', () => {

  const confirmReset = confirm("Tout supprimer ? PNJ seront effacés.");

  if (!confirmReset) return;

  pnjs = [];
  currentTurnId = null;
  currentRound = 1;
  turnStarted = false;

  localStorage.removeItem('pnjs');
  localStorage.removeItem('currentTurnId');
  localStorage.removeItem('currentRound');
  localStorage.removeItem('turnStarted');

  renderPnjs();
});
