const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// ========== CARD DEFINITIONS ==========
function buildDeck() {
  const deck = [];
  let id = 1;

  // GOALKEEPERS (30)
  for (let i = 0; i < 30; i++) {
    deck.push({ id: id++, type: 'player', zone: 'GK', number: 1, star: false, captain: false });
  }

  // DEFENSE (70)
  const defNums = [{ n: 2, c: 18 }, { n: 3, c: 18 }, { n: 4, c: 17 }, { n: 5, c: 17 }];
  defNums.forEach(({ n, c }) => {
    for (let i = 0; i < c; i++) {
      deck.push({ id: id++, type: 'player', zone: 'DEF', number: n, star: false, captain: false });
    }
  });
  for (let i = 0; i < 20; i++) deck.push({ id: id++, type: 'player', zone: 'DEF', number: null, star: true, captain: true });
  for (let i = 0; i < 15; i++) deck.push({ id: id++, type: 'player', zone: 'DEF', number: null, star: true, captain: false });
  for (let i = 0; i < 35; i++) deck.push({ id: id++, type: 'player', zone: 'DEF', number: null, star: false, captain: false });

  // MIDFIELD (50)
  const midNums = [{ n: 6, c: 17 }, { n: 7, c: 17 }, { n: 8, c: 16 }];
  midNums.forEach(({ n, c }) => {
    for (let i = 0; i < c; i++) {
      deck.push({ id: id++, type: 'player', zone: 'MID', number: n, star: false, captain: false });
    }
  });
  for (let i = 0; i < 12; i++) deck.push({ id: id++, type: 'player', zone: 'MID', number: null, star: true, captain: true });
  for (let i = 0; i < 13; i++) deck.push({ id: id++, type: 'player', zone: 'MID', number: null, star: true, captain: false });
  for (let i = 0; i < 25; i++) deck.push({ id: id++, type: 'player', zone: 'MID', number: null, star: false, captain: false });

  // ATTACK (40)
  const atkNums = [{ n: 9, c: 14 }, { n: 10, c: 13 }, { n: 11, c: 13 }];
  atkNums.forEach(({ n, c }) => {
    for (let i = 0; i < c; i++) {
      deck.push({ id: id++, type: 'player', zone: 'ATK', number: n, star: false, captain: false });
    }
  });
  for (let i = 0; i < 5; i++)  deck.push({ id: id++, type: 'player', zone: 'ATK', number: null, star: true, captain: true });
  for (let i = 0; i < 10; i++) deck.push({ id: id++, type: 'player', zone: 'ATK', number: null, star: true, captain: false });
  for (let i = 0; i < 25; i++) deck.push({ id: id++, type: 'player', zone: 'ATK', number: null, star: false, captain: false });

  // JOKER (10)
  for (let i = 0; i < 6; i++) deck.push({ id: id++, type: 'player', zone: 'JOKER', number: null, star: true, captain: false, joker: true });
  for (let i = 0; i < 4; i++) deck.push({ id: id++, type: 'player', zone: 'JOKER', number: null, star: true, captain: true, joker: true });

  // SPECIAL CARDS
  const specials = [
    { name: 'Red Card', count: 8 },
    { name: 'Yellow Card', count: 15 },
    { name: 'Offside', count: 8 },
    { name: 'Swap', count: 10 },
    { name: 'Contract', count: 10 },
    { name: 'Loan', count: 10 },
    { name: 'Cancel Order', count: 10 },
    { name: 'Trash Player', count: 20 }
  ];
  specials.forEach(({ name, count }) => {
    for (let i = 0; i < count; i++) {
      deck.push({ id: id++, type: 'special', name });
    }
  });

  return shuffle(deck);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ========== GAME STATE ==========
const rooms = {};

function createRoom(code) {
  return {
    code,
    players: [],
    state: 'waiting',
    deck: [],
    turn: 0,
    firstTurn: true,
    pendingSpecial: null,
    discardPile: []
  };
}

function createPlayerState(socketId, name) {
  return {
    socketId,
    name,
    hand: [],
    field: { GK: [], DEF: [], MID: [], ATK: [] },
    yellows: {},
    loanedCards: [],
    skipped: false
  };
}

function getFieldCount(player) {
  return Object.values(player.field).reduce((s, z) => s + z.length, 0);
}

function dealCards(room) {
  room.deck = buildDeck();
  room.players.forEach(p => {
    p.hand = room.deck.splice(0, 5);
  });
}

function enforceHandLimit(player, deck) {
  const burned = [];
  while (player.hand.length > 7) {
    const idx = Math.floor(Math.random() * player.hand.length);
    burned.push(...player.hand.splice(idx, 1));
  }
  return burned;
}

// ========== WIN CHECK ==========
const FORMATIONS = [
  { DEF: 4, MID: 3, ATK: 3 }, // 4-3-3
  { DEF: 4, MID: 4, ATK: 2 }, // 4-4-2
  { DEF: 5, MID: 3, ATK: 2 }  // 5-3-2
];

function checkWin(player) {
  const field = player.field;

  // Check formation
  const validFormation = FORMATIONS.some(f =>
    field.GK.length >= 1 &&
    field.DEF.length === f.DEF &&
    field.MID.length === f.MID &&
    field.ATK.length === f.ATK
  );
  if (!validFormation) return false;

  // Check captain
  const hasCaptain = Object.values(field).flat().some(c => c.captain);
  if (!hasCaptain) return false;

  // Option A: star in DEF + MID + ATK
  const starDEF = field.DEF.some(c => c.star);
  const starMID = field.MID.some(c => c.star);
  const starATK = field.ATK.some(c => c.star);
  if (starDEF && starMID && starATK) return true;

  // Option B: consecutive numbers in same zone
  const defNums = field.DEF.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const midNums = field.MID.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const atkNums = field.ATK.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);

  const consec = (nums, sets) => sets.some(s => s.every(n => nums.includes(n)));
  if (consec(defNums, [[2,3,4],[3,4,5]])) return true;
  if (consec(midNums, [[6,7,8]])) return true;
  if (consec(atkNums, [[9,10,11]])) return true;

  return false;
}

// ========== BROADCAST ==========
function broadcastState(room) {
  room.players.forEach((player, idx) => {
    const socket = io.sockets.sockets.get(player.socketId);
    if (!socket) return;

    const others = room.players
      .filter((_, i) => i !== idx)
      .map(p => ({
        name: p.name,
        handCount: p.hand.length,
        field: p.field,
        yellows: p.yellows,
        skipped: p.skipped
      }));

    socket.emit('game_state', {
      myHand: player.hand,
      myField: player.field,
      myYellows: player.yellows,
      opponents: others,
      currentTurn: room.turn % room.players.length,
      myIndex: idx,
      deckCount: room.deck.length,
      firstTurn: room.firstTurn,
      playerCount: room.players.length,
      discardPile: room.discardPile || [],
      discardTop: (room.discardPile && room.discardPile.length > 0) ? room.discardPile[room.discardPile.length - 1] : null
    });
  });
}

// ========== SOCKET EVENTS ==========
io.on('connection', (socket) => {

  // CREATE ROOM
  socket.on('create_room', ({ name }) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    rooms[code] = createRoom(code);
    const player = createPlayerState(socket.id, name || 'Player 1');
    rooms[code].players.push(player);
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.name = name;
    socket.emit('room_created', { code });
    io.to(code).emit('room_update', {
      players: rooms[code].players.map(p => p.name),
      code
    });
  });

  // JOIN ROOM
  socket.on('join_room', ({ code, name }) => {
    const room = rooms[code];
    if (!room) return socket.emit('error', { msg: 'الأوضة مش موجودة!' });
    if (room.state !== 'waiting') return socket.emit('error', { msg: 'اللعبة بدأت!' });
    if (room.players.length >= 4) return socket.emit('error', { msg: 'الأوضة ممتلئة!' });

    const player = createPlayerState(socket.id, name || `Player ${room.players.length + 1}`);
    room.players.push(player);
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.name = name;

    io.to(code).emit('room_update', {
      players: room.players.map(p => p.name),
      code
    });

    // Auto start when 2+ players
    if (room.players.length >= 2) {
      room.state = 'playing';
      dealCards(room);
      room.firstTurn = true;
      room.turn = 0;
      io.to(code).emit('game_start', { playerNames: room.players.map(p => p.name) });
      broadcastState(room);
    }
  });

  // PLACE CARD ON FIELD
  socket.on('place_card', ({ cardId, zone }) => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return socket.emit('error', { msg: 'مش دورك!' });

    const player = room.players[pIdx];
    const cardIdx = player.hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return socket.emit('error', { msg: 'الكارت مش في إيدك!' });

    const card = player.hand[cardIdx];

    // Field limit check
    if (getFieldCount(player) >= 11) return socket.emit('error', { msg: 'الملعب ممتلئ (11 لاعب)!' });

    // Zone validation
    const validZones = {
      GK: ['GK'],
      DEF: ['DEF'],
      MID: ['MID'],
      ATK: ['ATK'],
      JOKER: ['GK', 'DEF', 'MID', 'ATK']
    };
    if (!validZones[card.zone]?.includes(zone)) {
      return socket.emit('error', { msg: 'المنطقة غلط لهذا اللاعب!' });
    }

    // Max 2 cards per turn
    player._placedThisTurn = (player._placedThisTurn || 0) + 1;
    if (player._placedThisTurn > 2) {
      player._placedThisTurn--;
      return socket.emit('error', { msg: 'ممكن تحط 2 كروت بس في الدور الواحد!' });
    }

    player.hand.splice(cardIdx, 1);
    player.field[zone].push(card);

    // Check win
    if (checkWin(player)) {
      room.state = 'ended';
      io.to(code).emit('game_over', { winner: player.name });
      return;
    }

    broadcastState(room);
  });

  // END TURN
  socket.on('end_turn', () => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return;

    const player = room.players[pIdx];
    player._placedThisTurn = 0;
    player._drawnThisTurn = 0;

    // Handle loan returns
    player.loanedCards = player.loanedCards.map(l => ({ ...l, turns: l.turns - 1 }));
    const returned = player.loanedCards.filter(l => l.turns <= 0);
    returned.forEach(l => {
      const owner = room.players.find(p => p.socketId === l.ownerSocketId);
      if (owner) {
        const zone = l.card.zone === 'JOKER' ? 'ATK' : l.card.zone;
        owner.field[zone].push(l.card);
      }
    });
    player.loanedCards = player.loanedCards.filter(l => l.turns > 0);

    // حرق الكروت الزيادة عن 7 وإضافتها للـ discard pile
    while (player.hand.length > 7) {
      const idx = Math.floor(Math.random() * player.hand.length);
      const burned = player.hand.splice(idx, 1)[0];
      room.discardPile = room.discardPile || [];
      room.discardPile.push(burned);
    }

    // Next turn
    room.turn++;
    room.firstTurn = false;

    // Skip check
    let nextIdx = room.turn % room.players.length;
    if (room.players[nextIdx].skipped) {
      room.players[nextIdx].skipped = false;
      room.turn++;
      nextIdx = room.turn % room.players.length;
    }

    broadcastState(room);
  });

  // DRAW CARD (يدوي - أقصى كارتين في الدور)
  socket.on('draw_card', () => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return socket.emit('error', { msg: 'مش دورك!' });

    const player = room.players[pIdx];
    player._drawnThisTurn = (player._drawnThisTurn || 0);

    if (player._drawnThisTurn >= 2) return socket.emit('error', { msg: 'اسحبت الحد الأقصى (2 كروت)!' });
    if (room.deck.length === 0) return socket.emit('error', { msg: 'البنك خلص!' });

    player.hand.push(room.deck.shift());
    player._drawnThisTurn++;

    // Enforce hand limit (7 كروت)
    enforceHandLimit(player, room.deck);

    broadcastState(room);
  });

  // PLAY SPECIAL CARD
  socket.on('play_special', ({ cardId, targetPlayerIdx, targetCardId, targetZone }) => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return socket.emit('error', { msg: 'مش دورك!' });

    const player = room.players[pIdx];
    const cardIdx = player.hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const card = player.hand[cardIdx];
    if (card.type !== 'special') return;

    const target = room.players[targetPlayerIdx];

    // Notify targets to allow Cancel Order reaction
    room.pendingSpecial = { card, fromIdx: pIdx, targetPlayerIdx, targetCardId, targetZone, cancelled: false };

    io.to(code).emit('special_pending', {
      cardName: card.name,
      fromPlayer: player.name,
      targetPlayer: target?.name
    });

    // Give 3s for Cancel Order reaction
    setTimeout(() => {
      if (!room.pendingSpecial || room.pendingSpecial.cancelled) {
        room.pendingSpecial = null;
        return;
      }
      const sp = room.pendingSpecial;
      room.pendingSpecial = null;
      player.hand.splice(cardIdx, 1);
      room.discardPile = room.discardPile || [];
      room.discardPile.push(sp.card);
      applySpecial(room, sp);
      broadcastState(room);
    }, 3000);
  });

  // CANCEL ORDER REACTION
  socket.on('cancel_order', ({ cardId }) => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || !room.pendingSpecial) return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    const player = room.players[pIdx];
    const cIdx = player.hand.findIndex(c => c.id === cardId && c.name === 'Cancel Order');
    if (cIdx === -1) return;

    player.hand.splice(cIdx, 1);
    room.pendingSpecial.cancelled = true;
    io.to(code).emit('special_cancelled', { by: player.name });
    broadcastState(room);
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code || !rooms[code]) return;
    const room = rooms[code];
    room.players = room.players.filter(p => p.socketId !== socket.id);
    if (room.players.length === 0) {
      delete rooms[code];
    } else {
      io.to(code).emit('player_left', { msg: `${socket.data.name} غادر اللعبة` });
      broadcastState(room);
    }
  });
});

// ========== APPLY SPECIAL ==========
function applySpecial(room, { card, fromIdx, targetPlayerIdx, targetCardId, targetZone }) {
  const attacker = room.players[fromIdx];
  const defender = room.players[targetPlayerIdx];

  switch (card.name) {
    case 'Red Card': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) { defender.field[zone].splice(idx, 1); break; }
      }
      break;
    }
    case 'Yellow Card': {
      if (!defender) break;
      defender.yellows[targetCardId] = (defender.yellows[targetCardId] || 0) + 1;
      if (defender.yellows[targetCardId] >= 2) {
        delete defender.yellows[targetCardId];
        for (const zone of Object.keys(defender.field)) {
          const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
          if (idx !== -1) { defender.field[zone].splice(idx, 1); break; }
        }
      }
      break;
    }
    case 'Offside': {
      if (defender) defender.skipped = true;
      break;
    }
    case 'Swap': {
      if (!defender) break;
      let myCard = null, myZone = null, myIdx = -1;
      let theirCard = null, theirZone = null, theirIdx = -1;

      for (const z of Object.keys(attacker.field)) {
        const i = attacker.field[z].findIndex(c => c.id === targetCardId);
        if (i !== -1) { myCard = attacker.field[z][i]; myZone = z; myIdx = i; break; }
      }
      for (const z of Object.keys(defender.field)) {
        const i = defender.field[z].findIndex(c => c.id === targetCardId);
        if (i !== -1) { theirCard = defender.field[z][i]; theirZone = z; theirIdx = i; break; }
      }
      if (myCard && theirCard) {
        attacker.field[myZone][myIdx] = theirCard;
        defender.field[theirZone][theirIdx] = myCard;
      }
      break;
    }
    case 'Contract': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) {
          const [stolen] = defender.field[zone].splice(idx, 1);
          const z = stolen.zone === 'JOKER' ? targetZone : stolen.zone;
          attacker.field[z] = attacker.field[z] || [];
          attacker.field[z].push(stolen);
          break;
        }
      }
      break;
    }
    case 'Loan': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) {
          const [loaned] = defender.field[zone].splice(idx, 1);
          const z = loaned.zone === 'JOKER' ? targetZone : loaned.zone;
          attacker.field[z] = attacker.field[z] || [];
          attacker.field[z].push(loaned);
          attacker.loanedCards.push({ card: loaned, turns: 2, ownerSocketId: defender.socketId });
          break;
        }
      }
      break;
    }
    case 'Trash Player': {
      for (const zone of Object.keys(attacker.field)) {
        const idx = attacker.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) { attacker.field[zone].splice(idx, 1); break; }
      }
      break;
    }
  }
}

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => console.log(`Action Almala3b Server running on ${HOST}:${PORT}`));
