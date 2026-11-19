const locations = {
  Cafe: { x: 18, y: 29 }, Library: { x: 71, y: 25 },
  Park: { x: 73, y: 78 }, Market: { x: 18, y: 80 },
  Plaza: { x: 49, y: 54 }
};

const agents = [
  { id: 'mona', name: 'Mona', letter: 'M', color: '#ef7668', location: 'Cafe', activity: 'Writing in a notebook', mood: 'Curious', energy: 82, memory: 'The morning coffee was excellent.', relationships: { karim: 68, laila: 74 } },
  { id: 'karim', name: 'Karim', letter: 'K', color: '#668bd3', location: 'Library', activity: 'Reading about architecture', mood: 'Focused', energy: 76, memory: 'He found a beautiful map of the old city.', relationships: { mona: 68, laila: 55 } },
  { id: 'laila', name: 'Laila', letter: 'L', color: '#64b39a', location: 'Park', activity: 'Sketching the fountain', mood: 'Cheerful', energy: 91, memory: 'The park was quiet after the rain.', relationships: { mona: 74, karim: 55 } }
];

let selectedId = 'mona';
let paused = false;
let speed = 1;
let minute = 8 * 60;
let day = 1;
let tick = 0;

const agentList = document.querySelector('#agentList');
const agentLayer = document.querySelector('#agentLayer');
const detailPanel = document.querySelector('#detailPanel');
const eventLog = document.querySelector('#eventLog');
const relationshipList = document.querySelector('#relationshipList');

function renderAgents() {
  agentList.innerHTML = agents.map(a => `
    <button class="agent-card ${a.id === selectedId ? 'active' : ''}" data-agent="${a.id}">
      <span class="avatar" style="background:${a.color}">${a.letter}</span>
      <span><strong>${a.name}</strong><small>${a.activity}</small></span>
      <span class="chevron">›</span>
    </button>`).join('');

  agentLayer.innerHTML = agents.map(a => {
    const pos = locations[a.location];
    return `<button class="city-agent ${a.id === selectedId ? 'active' : ''}" data-agent="${a.id}" style="left:${pos.x}%;top:${pos.y}%">
      <span class="avatar" style="background:${a.color}">${a.letter}</span><small>${a.name}</small>
    </button>`;
  }).join('');
}

function renderDetails() {
  const a = agents.find(item => item.id === selectedId);
  detailPanel.innerHTML = `
    <div class="profile-head">
      <span class="avatar" style="background:${a.color}">${a.letter}</span>
      <div><strong>${a.name}</strong><small>${a.location} · ${a.mood}</small></div>
    </div>
    <div class="stat">
      <div class="stat-row"><span>Energy</span><b>${a.energy}%</b></div>
      <div class="stat-bar"><i style="width:${a.energy}%;background:${a.color}"></i></div>
    </div>
    <div class="memory"><b>Latest memory</b>${a.memory}</div>
    <div class="memory"><b>Current plan</b>${a.activity}</div>`;
}

function renderRelationships() {
  relationshipList.innerHTML = `
    ${relationshipRow('mona', 'karim', 'Mona', 'Karim', agents[0].relationships.karim)}
    ${relationshipRow('mona', 'laila', 'Mona', 'Laila', agents[0].relationships.laila)}
    ${relationshipRow('karim', 'laila', 'Karim', 'Laila', agents[2].relationships.karim)}`;
}

function relationshipRow(leftId, rightId, left, right, value) {
  const leftAgent = agents.find(a => a.id === leftId);
  const rightAgent = agents.find(a => a.id === rightId);
  return `<div class="relationship-row">
    <span class="avatar small" style="background:${leftAgent.color}">${leftAgent.letter}</span>
    <div class="names">${left} & ${right}<div class="relationship-bar"><i style="width:${value}%"></i></div></div>
    <span class="avatar small" style="background:${rightAgent.color}">${rightAgent.letter}</span>
  </div>`;
}

function selectAgent(id) {
  selectedId = id;
  renderAgents(); renderDetails();
}

function addEvent(text) {
  const time = formatTime(minute);
  eventLog.insertAdjacentHTML('afterbegin', `<div class="event-item"><time>${time}</time><p>${text}</p></div>`);
  while (eventLog.children.length > 30) eventLog.lastElementChild.remove();
}

function formatTime(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function updateClock() {
  minute += 5 * speed;
  if (minute >= 24 * 60) { minute -= 24 * 60; day++; }
  document.querySelector('#dayLabel').textContent = `Day ${day}`;
  document.querySelector('#timeLabel').textContent = formatTime(minute);
}

const plans = [
  { location: 'Cafe', activity: 'Having coffee and chatting' },
  { location: 'Library', activity: 'Reading a new book' },
  { location: 'Market', activity: 'Shopping for fresh groceries' },
  { location: 'Park', activity: 'Enjoying a walk in the sun' },
  { location: 'Plaza', activity: 'Watching the city go by' }
];

function moveAgents() {
  for (const a of agents) {
    if (Math.random() < .38) {
      const next = plans[Math.floor(Math.random() * plans.length)];
      a.location = next.location;
      a.activity = next.activity;
      a.energy = Math.max(18, a.energy - Math.floor(Math.random() * 4));
      a.memory = `${a.name} moved to the ${next.location.toLowerCase()} at ${formatTime(minute)}.`;
      addEvent(`<strong>${a.name}</strong> went to the ${next.location}.`);
    }
  }
  renderAgents(); renderDetails();
}

function interactions() {
  if (Math.random() > .28) return;
  const pair = [[0,1],[0,2],[1,2]][Math.floor(Math.random() * 3)];
  const a = agents[pair[0]], b = agents[pair[1]];
  if (a.location === b.location || (a.location === 'Plaza' || b.location === 'Plaza')) {
    a.energy = Math.min(100, a.energy + 2);
    b.energy = Math.min(100, b.energy + 2);
    a.memory = `Spent a moment talking with ${b.name}.`;
    b.memory = `Shared a friendly conversation with ${a.name}.`;
    a.relationships[b.id] = Math.min(100, (a.relationships[b.id] || 50) + 1);
    b.relationships[a.id] = a.relationships[b.id];
    addEvent(`<strong>${a.name}</strong> and <strong>${b.name}</strong> talked nearby.`);
    renderRelationships(); renderDetails();
  }
}

document.addEventListener('click', event => {
  const agentButton = event.target.closest('[data-agent]');
  if (agentButton) selectAgent(agentButton.dataset.agent);
});

document.querySelectorAll('.speed-btn').forEach(button => {
  button.addEventListener('click', () => {
    speed = Number(button.dataset.speed);
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
  });
});

document.querySelector('#pauseBtn').addEventListener('click', () => {
  paused = !paused;
  document.querySelector('#pauseIcon').textContent = paused ? '▶' : 'Ⅱ';
  document.querySelector('.status-dot').style.background = paused ? '#ef7668' : '#6ba98d';
});

addEvent('<strong>The simulation</strong> has begun in the city center.');
renderAgents(); renderDetails(); renderRelationships();

setInterval(() => {
  if (paused) return;
  tick++;
  updateClock();
  if (tick % 3 === 0) moveAgents();
  if (tick % 2 === 0) interactions();
}, 900);
