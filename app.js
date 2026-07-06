// Tableau pour stocker les PNJ
let pnjs = JSON.parse(localStorage.getItem('pnjs')) || [];

// Éléments DOM
const pnjList = document.getElementById('pnjList');

const addPnjBtn = document.getElementById('addPnjBtn');
const pnjModal = document.getElementById('pnjModal');

const validatePnjBtn = document.getElementById('validatePnjBtn');
const cancelPnjBtn = document.getElementById('cancelPnjBtn');
const resetBtn = document.getElementById('resetBtn');
const addPcBtn = document.getElementById('addPcBtn');

const pcModal = document.getElementById('pcModal');
const validatePcBtn = document.getElementById('validatePcBtn');
const cancelPcBtn = document.getElementById('cancelPcBtn');

// Modale dégâts
const damageModal = document.getElementById('damageModal');
const applyDamageBtn = document.getElementById('applyDamageBtn');
const cancelDamageBtn = document.getElementById('cancelDamageBtn');

let currentDamageIndex = null;
let currentEditIndex = null;


// ----------------------------
// AFFICHAGE PNJ
// ----------------------------
function renderPnjs() {
  pnjList.innerHTML = '';

  pnjs.sort((a, b) => b.initiative - a.initiative);

  pnjs.forEach((pnj, index) => {

    const pnjItem = document.createElement('div');
    pnjItem.className = 'pnj-item';

    const halfHP = pnj.ps.max / 2;

    const accent = pnj.joueur ? "#ffd400" : "#ff3b67";

    let statusHTML = '';

    if (pnj.ps.actuel === 0) {
      statusHTML = `
        <div style="margin-top:5px; font-weight:bold; color:purple;">
          ☠ Mortellement blessé (-4 à tous les jets, -6 en MOUV)
        </div>
      `;
    }
    else if (pnj.ps.actuel <= halfHP) {
      statusHTML = `
        <div style="margin-top:5px; font-weight:bold; color:red;">
          Grièvement blessé (-2 à tous les jets)
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
        REF : ${pnj.ref}
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
      resetDamageModal();
      damageModal.style.display = 'block';
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {

        currentEditIndex = parseInt(e.target.dataset.index);

        const pnj = pnjs[currentEditIndex];

        document.getElementById('pnjNom').value = pnj.nom;
        document.getElementById('pnjPS').value = pnj.ps.max;
        document.getElementById('pnjArmureCorps').value = pnj.armureCorps.max;
        document.getElementById('pnjArmureTete').value = pnj.armureTete.max;
        document.getElementById('pnjREF').value = pnj.ref;
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

  document.getElementById('pnjNom').value = '';
  document.getElementById('pnjPS').value = '';
  document.getElementById('pnjArmureCorps').value = '';
  document.getElementById('pnjArmureTete').value = '';
  document.getElementById('pnjREF').value = '';
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
    pnjs[currentEditIndex].initiative = initiative;

    currentEditIndex = null;

} else {

    for (let i = 1; i <= nb; i++) {

        const nom = nb === 1 ? nomBase : `${nomBase} ${i}`;

        pnjs.push({
            joueur:false,
            nom,
            ps: { actuel: psMax, max: psMax },
            armureCorps: { actuel: armureCorps, max: armureCorps },
            armureTete: { actuel: armureTete, max: armureTete },
            ref,
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

  pnj.ps.actuel -= damage;
  if (pnj.ps.actuel < 0) pnj.ps.actuel = 0;

  if (breakArmor) {
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

resetBtn.addEventListener('click', () => {

  const confirmReset = confirm("Tout supprimer ? PNJ seront effacés.");

  if (!confirmReset) return;

  pnjs = [];

  localStorage.removeItem('pnjs');

  renderPnjs();
});