import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const state = {
  characters: [],
  relationships: new Map(),
  tick: 0,
};

const elements = {
  status: document.getElementById("status"),
  name: document.getElementById("name"),
  color: document.getElementById("color"),
  bodyType: document.getElementById("bodyType"),
  origin: document.getElementById("origin"),
  career: document.getElementById("career"),
  goal: document.getElementById("goal"),
  addCharacter: document.getElementById("addCharacter"),
  interactButton: document.getElementById("interactButton"),
  characterList: document.getElementById("characterList"),
  summaryList: document.getElementById("summaryList"),
  canvas: document.getElementById("sceneCanvas"),
};

const TRAITS = [
  "kindness",
  "confidence",
  "curiosity",
  "patience",
  "humor",
  "honesty",
];

const BODY_SCALES = {
  compact: 0.85,
  average: 1,
  tall: 1.15,
  athletic: 1.05,
};

let idCounter = 1;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pairKey(a, b) {
  return a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
}

function getRelationship(a, b) {
  const key = pairKey(a, b);
  if (!state.relationships.has(key)) {
    state.relationships.set(key, {
      affinity: 0,
      trust: 0,
      respect: 0,
      lastInteractionType: null,
      lastInteractionTick: 0,
    });
  }
  return state.relationships.get(key);
}

function getSharedTags(a, b) {
  const shared = [];
  if (a.backstory.origin === b.backstory.origin) {
    shared.push({
      type: "origin",
      value: a.backstory.origin,
      label: "they come from the same place",
    });
  }
  if (a.backstory.career === b.backstory.career) {
    shared.push({
      type: "career",
      value: a.backstory.career,
      label: "they do the same job",
    });
  }
  if (a.backstory.goal === b.backstory.goal) {
    shared.push({
      type: "goal",
      value: a.backstory.goal,
      label: "they want the same thing",
    });
  }
  return shared;
}

function traitVector(traits) {
  return TRAITS.map((key) => traits[key] / 100);
}

function dot(a, b) {
  return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
}

function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function traitSimilarity(a, b) {
  const va = traitVector(a.traits);
  const vb = traitVector(b.traits);
  const mag = magnitude(va) * magnitude(vb);
  if (mag === 0) {
    return 0;
  }
  return clamp(dot(va, vb) / mag, 0, 1);
}

function traitContrast(a, b) {
  const total = TRAITS.reduce((sum, key) => sum + Math.abs(a.traits[key] - b.traits[key]), 0);
  return clamp(total / (TRAITS.length * 100), 0, 1);
}

function buildTraitsFromInputs() {
  const traits = {};
  document.querySelectorAll("input[type='range'][data-trait]").forEach((input) => {
    traits[input.dataset.trait] = Number(input.value);
  });
  return traits;
}

function updateStatus() {
  if (state.characters.length < 2) {
    elements.status.textContent = "Add at least 2 characters.";
  } else {
    elements.status.textContent = "Ready. Press Interact to watch them respond.";
  }
}

function renderCharacterList() {
  elements.characterList.innerHTML = "";
  state.characters.forEach((char) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";

    const dot = document.createElement("span");
    dot.className = "card-dot";
    dot.style.background = char.color;

    const name = document.createElement("span");
    name.textContent = char.name;

    title.appendChild(dot);
    title.appendChild(name);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeCharacter(char.id));

    header.appendChild(title);
    header.appendChild(removeBtn);

    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = `${char.backstory.origin} | ${char.backstory.career} | ${char.backstory.goal}`;

    const traits = document.createElement("div");
    traits.className = "card-meta";
    traits.textContent = `Kind ${char.traits.kindness}, Conf ${char.traits.confidence}, Cur ${char.traits.curiosity}, Pat ${char.traits.patience}, Hum ${char.traits.humor}, Hon ${char.traits.honesty}`;

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(traits);

    elements.characterList.appendChild(card);
  });
  updateStatus();
}

function removeCharacter(id) {
  const index = state.characters.findIndex((char) => char.id === id);
  if (index === -1) return;
  const [removed] = state.characters.splice(index, 1);
  scene.remove(removed.mesh);
  state.relationships.forEach((_, key) => {
    if (key.includes(removed.id)) {
      state.relationships.delete(key);
    }
  });
  layoutCharacters();
  renderCharacterList();
}

function buildCharacter() {
  const nameInput = elements.name.value.trim();
  const character = {
    id: `c${idCounter++}`,
    name: nameInput || `Character ${idCounter - 1}`,
    color: elements.color.value,
    bodyType: elements.bodyType.value,
    traits: buildTraitsFromInputs(),
    backstory: {
      origin: elements.origin.value,
      career: elements.career.value,
      goal: elements.goal.value,
    },
    memory: [],
    mesh: null,
    basePosition: new THREE.Vector3(),
    focusPosition: null,
    focusUntil: 0,
  };
  return character;
}

function applyRelationshipDelta(rel, delta) {
  rel.affinity = clamp(rel.affinity + (delta.affinity || 0), -100, 100);
  rel.trust = clamp(rel.trust + (delta.trust || 0), 0, 100);
  rel.respect = clamp(rel.respect + (delta.respect || 0), 0, 100);
}

function formatDelta(delta) {
  const parts = [];
  if (delta.affinity) {
    parts.push(`Friendship ${delta.affinity > 0 ? "+" : ""}${delta.affinity}`);
  }
  if (delta.trust) {
    parts.push(`Trust ${delta.trust > 0 ? "+" : ""}${delta.trust}`);
  }
  if (delta.respect) {
    parts.push(`Respect ${delta.respect > 0 ? "+" : ""}${delta.respect}`);
  }
  if (parts.length === 0) return "";
  return `(${parts.join(", ")})`;
}

function addSummary(interactions) {
  elements.summaryList.innerHTML = "";
  if (interactions.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No one interacted. Try changing traits or tags.";
    elements.summaryList.appendChild(li);
    return;
  }
  interactions.forEach((item) => {
    const li = document.createElement("li");
    const deltaText = formatDelta(item.delta);
    const parts = [`${item.a.name} ${item.verb} ${item.b.name}.`];
    if (deltaText) {
      parts.push(deltaText);
    }
    if (item.reason) {
      parts.push(`Because ${item.reason}.`);
    }
    li.textContent = parts.join(" ");
    elements.summaryList.appendChild(li);
  });
}

function scoreInteraction(type, a, b, rel, sharedTags, similarity, contrast) {
  const sharedScore = sharedTags.length * 8;
  const kindness = (a.traits.kindness + b.traits.kindness) / 20;
  const humor = (a.traits.humor + b.traits.humor) / 25;
  const confidence = (a.traits.confidence + b.traits.confidence) / 20;
  const patience = (a.traits.patience + b.traits.patience) / 25;
  const trust = rel.trust / 15;
  const affinity = rel.affinity / 12;
  const respect = rel.respect / 20;

  const factors = [];
  let score = 0;

  if (type === "friendly") {
    score = 12 + similarity * 10 + sharedScore + affinity + kindness;
    factors.push({ label: "they get along well", value: similarity * 10 });
    if (sharedTags.length) {
      factors.push({ label: sharedTags[0].label, value: sharedScore });
    }
  }

  if (type === "compliment") {
    score = 10 + kindness + humor + sharedScore + trust;
    factors.push({ label: `${a.name} is kind`, value: a.traits.kindness / 10 });
    if (sharedTags.length) {
      factors.push({ label: sharedTags[0].label, value: sharedScore });
    }
  }

  if (type === "help") {
    score = 9 + trust + kindness + patience;
    factors.push({ label: "they trust each other", value: trust });
    factors.push({ label: `${a.name} is patient`, value: a.traits.patience / 12 });
  }

  if (type === "debate") {
    score = 8 + confidence + contrast * 12 - patience + respect;
    factors.push({ label: "they are both confident", value: confidence });
    factors.push({ label: "they think differently", value: contrast * 12 });
  }

  if (type === "avoid") {
    score = 6 + (100 - rel.affinity) / 15 + (100 - rel.trust) / 18 - sharedScore;
    factors.push({ label: "they do not know each other well", value: (100 - rel.affinity) / 15 });
  }

  const repetitionPenalty =
    rel.lastInteractionTick && state.tick - rel.lastInteractionTick <= 2 ? -8 : 0;
  const sameTypePenalty = rel.lastInteractionType === type ? -5 : 0;
  score += repetitionPenalty + sameTypePenalty;

  const best = factors
    .filter((factor) => factor.value > 0)
    .sort((a1, a2) => a2.value - a1.value)[0];
  const reason = best ? best.label.replace(":", " ") : "they felt comfortable";

  return { score, reason };
}

function selectInteractions() {
  if (state.characters.length < 2) {
    addSummary([]);
    return [];
  }

  const candidates = [];
  const types = ["friendly", "compliment", "help", "debate", "avoid"];

  for (let i = 0; i < state.characters.length; i += 1) {
    for (let j = i + 1; j < state.characters.length; j += 1) {
      const a = state.characters[i];
      const b = state.characters[j];
      const rel = getRelationship(a, b);
      const sharedTags = getSharedTags(a, b);
      const similarity = traitSimilarity(a, b);
      const contrast = traitContrast(a, b);

      types.forEach((type) => {
        const { score, reason } = scoreInteraction(type, a, b, rel, sharedTags, similarity, contrast);
        candidates.push({ a, b, type, score, reason });
      });
    }
  }

  candidates.sort((c1, c2) => c2.score - c1.score);

  const maxInteractions = Math.min(3, Math.floor(state.characters.length / 2));
  const chosen = [];
  const used = new Set();

  candidates.forEach((candidate) => {
    if (chosen.length >= maxInteractions) return;
    if (used.has(candidate.a.id) || used.has(candidate.b.id)) return;
    chosen.push(candidate);
    used.add(candidate.a.id);
    used.add(candidate.b.id);
  });

  return chosen;
}

function interactionVerb(type) {
  switch (type) {
    case "compliment":
      return "said something nice to";
    case "help":
      return "asked help from";
    case "debate":
      return "had a small disagreement with";
    case "avoid":
      return "felt shy around";
    default:
      return "said hi to";
  }
}

function interactionDelta(type) {
  switch (type) {
    case "compliment":
      return { affinity: 8, trust: 4, respect: 1 };
    case "help":
      return { affinity: 6, trust: 7 };
    case "debate":
      return { affinity: -2, respect: 2 };
    case "avoid":
      return { affinity: -3, trust: -2 };
    default:
      return { affinity: 4, trust: 2 };
  }
}

function focusPair(a, b, durationMs) {
  const midpoint = a.basePosition.clone().add(b.basePosition).multiplyScalar(0.5);
  const direction = b.basePosition.clone().sub(a.basePosition).normalize();
  const offset = 0.8;

  a.focusPosition = midpoint.clone().add(direction.clone().multiplyScalar(-offset));
  b.focusPosition = midpoint.clone().add(direction.clone().multiplyScalar(offset));
  const until = performance.now() + durationMs;
  a.focusUntil = until;
  b.focusUntil = until;
}

function runInteractionTick() {
  state.tick += 1;
  const chosen = selectInteractions();
  const summaries = [];

  chosen.forEach((candidate, index) => {
    const rel = getRelationship(candidate.a, candidate.b);
    const delta = interactionDelta(candidate.type);
    applyRelationshipDelta(rel, delta);
    rel.lastInteractionType = candidate.type;
    rel.lastInteractionTick = state.tick;

    summaries.push({
      a: candidate.a,
      b: candidate.b,
      verb: interactionVerb(candidate.type),
      delta,
      reason: candidate.reason,
    });

    focusPair(candidate.a, candidate.b, 2600 + index * 600);
  });

  addSummary(summaries);
}

function updateTraitLabels() {
  document.querySelectorAll("[data-value-for]").forEach((label) => {
    const input = document.getElementById(label.dataset.valueFor);
    if (input) {
      label.textContent = input.value;
    }
  });
}

document.querySelectorAll("input[type='range'][data-trait]").forEach((input) => {
  input.addEventListener("input", updateTraitLabels);
});
updateTraitLabels();

elements.addCharacter.addEventListener("click", () => {
  const character = buildCharacter();
  addCharacterToScene(character);
  state.characters.push(character);
  layoutCharacters();
  renderCharacterList();
});

elements.interactButton.addEventListener("click", () => {
  if (state.characters.length < 2) {
    elements.status.textContent = "Add at least 2 characters to interact.";
    return;
  }
  runInteractionTick();
});

// --- Three.js Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0b0e14");

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 6, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: elements.canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const floorGeometry = new THREE.CircleGeometry(6.5, 48);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x151923 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

function addCharacterToScene(character) {
  const geometry = new THREE.SphereGeometry(0.4, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: character.color });
  const mesh = new THREE.Mesh(geometry, material);
  const scale = BODY_SCALES[character.bodyType] || 1;
  mesh.scale.set(1, scale, 1);
  mesh.position.set(0, 0.4, 0);
  character.mesh = mesh;
  scene.add(mesh);
}

function layoutCharacters() {
  const count = state.characters.length;
  if (count === 0) return;
  const radius = 2.4 + count * 0.3;
  state.characters.forEach((char, index) => {
    const angle = (index / count) * Math.PI * 2;
    char.basePosition = new THREE.Vector3(
      Math.cos(angle) * radius,
      0.4,
      Math.sin(angle) * radius
    );
  });
}

function resizeRenderer() {
  const { clientWidth, clientHeight } = elements.canvas;
  if (clientWidth === 0 || clientHeight === 0) return;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  resizeRenderer();
  const now = performance.now();
  state.characters.forEach((char) => {
    const target =
      char.focusUntil && now < char.focusUntil ? char.focusPosition : char.basePosition;
    if (target) {
      char.mesh.position.lerp(target, 0.08);
    }
  });
  renderer.render(scene, camera);
}

updateStatus();
animate();
