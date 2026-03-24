const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));
app.get('/ping', (req, res) => res.send('ok'));

// ========== CARD DEFINITIONS ==========
function buildDeck() {
  const deck = [];
  let id = 1;

  // GK (30)
  for (let i = 0; i < 30; i++) deck.push({ id: id++, type: 'player', zone: 'GK', number: 1, star: false, captain: false });

  // DEF (140)
  const defNums = [{ n: 2, c: 18 }, { n: 3, c: 18 }, { n: 4, c: 17 }, { n: 5, c: 17 }];
  defNums.forEach(({ n, c }) => { for (let i = 0; i < c; i++) deck.push({ id: id++, type: 'player', zone: 'DEF', number: n, star: false, captain: false }); });
  const defStarCapNums = [2,2,2,2,2, 3,3,3,3,3, 4,4,4,4,4, 5,5,5,5,5];
  defStarCapNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'DEF', number: n, star: true, captain: true }));
  const defStarNums = [2,2,2,2, 3,3,3,3, 4,4,4,4, 5,5,5];
  defStarNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'DEF', number: n, star: true, captain: false }));
  const defNormalNums = [2,2,2,2,2,2,2,2,2, 3,3,3,3,3,3,3,3,3, 4,4,4,4,4,4,4,4,4, 5,5,5,5,5,5,5,5];
  defNormalNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'DEF', number: n, star: false, captain: false }));

  // MID (100)
  const midNums = [{ n: 6, c: 17 }, { n: 7, c: 17 }, { n: 8, c: 16 }];
  midNums.forEach(({ n, c }) => { for (let i = 0; i < c; i++) deck.push({ id: id++, type: 'player', zone: 'MID', number: n, star: false, captain: false }); });
  const midStarCapNums = [6,6,6,6, 7,7,7,7, 8,8,8,8];
  midStarCapNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'MID', number: n, star: true, captain: true }));
  const midStarNums = [6,6,6,6,6, 7,7,7,7, 8,8,8,8];
  midStarNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'MID', number: n, star: true, captain: false }));
  const midNormalNums = [6,6,6,6,6,6,6,6,6, 7,7,7,7,7,7,7,7, 8,8,8,8,8,8,8,8];
  midNormalNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'MID', number: n, star: false, captain: false }));

  // ATK (80)
  const atkNums = [{ n: 9, c: 14 }, { n: 10, c: 13 }, { n: 11, c: 13 }];
  atkNums.forEach(({ n, c }) => { for (let i = 0; i < c; i++) deck.push({ id: id++, type: 'player', zone: 'ATK', number: n, star: false, captain: false }); });
  const atkStarCapNums = [9,9, 10,10, 11];
  atkStarCapNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'ATK', number: n, star: true, captain: true }));
  const atkStarNums = [9,9,9,9, 10,10,10, 11,11,11];
  atkStarNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'ATK', number: n, star: true, captain: false }));
  const atkNormalNums = [9,9,9,9,9,9,9,9,9, 10,10,10,10,10,10,10,10, 11,11,11,11,11,11,11,11];
  atkNormalNums.forEach(n => deck.push({ id: id++, type: 'player', zone: 'ATK', number: n, star: false, captain: false }));

  // JOKER (10)
  for (let i = 0; i < 6; i++) deck.push({ id: id++, type: 'player', zone: 'JOKER', number: null, star: true, captain: false, joker: true });
  for (let i = 0; i < 4; i++) deck.push({ id: id++, type: 'player', zone: 'JOKER', number: null, star: true, captain: true, joker: true });

  // SPECIALS
  const specials = [
    { name: 'Red Card', count: 8 }, { name: 'Yellow Card', count: 15 },
    { name: 'Offside', count: 8 }, { name: 'Swap', count: 10 },
    { name: 'Contract', count: 10 }, { name: 'Loan', count: 10 },
    { name: 'Cancel Order', count: 10 }, { name: 'Trash Player', count: 20 }
  ];
  specials.forEach(({ name, count }) => { for (let i = 0; i < count; i++) deck.push({ id: id++, type: 'special', name }); });

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
  return { code, players: [], state: 'waiting', deck: [], turn: 0, firstTurn: true, pendingSpecial: null, discardPile: [] };
}

function createPlayerState(socketId, name) {
  return { socketId, name, hand: [], field: { GK: [], DEF: [], MID: [], ATK: [] }, yellows: {}, loanedCards: [], skipped: false };
}

function getFieldCount(player) { return Object.values(player.field).reduce((s, z) => s + z.length, 0); }

function dealCards(room) {
  room.deck = buildDeck();
  room.players.forEach(p => { p.hand = room.deck.splice(0, 5); });
}

const FORMATIONS = [{ DEF: 4, MID: 3, ATK: 3 }, { DEF: 4, MID: 4, ATK: 2 }, { DEF: 5, MID: 3, ATK: 2 }];

function checkWin(player) {
  const field = player.field;
  const validFormation = FORMATIONS.some(f => field.GK.length >= 1 && field.DEF.length === f.DEF && field.MID.length === f.MID && field.ATK.length === f.ATK);
  if (!validFormation) return false;
  const hasCaptain = Object.values(field).flat().some(c => c.captain);
  if (!hasCaptain) return false;
  const starDEF = field.DEF.some(c => c.star), starMID = field.MID.some(c => c.star), starATK = field.ATK.some(c => c.star);
  if (starDEF && starMID && starATK) return true;
  const hasJoker = (zone) => field[zone].some(c => c.joker);
  const consecWithJoker = (nums, joker, sets) => sets.some(s => {
    const missing = s.filter(n => !nums.includes(n));
    return (missing.length === 0 || (joker && missing.length === 1));
  });
  const defNums = field.DEF.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const midNums = field.MID.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const atkNums = field.ATK.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  if (consecWithJoker(defNums, hasJoker('DEF'), [[2,3,4],[3,4,5]])) return true;
  if (consecWithJoker(midNums, hasJoker('MID'), [[6,7,8]])) return true;
  if (consecWithJoker(atkNums, hasJoker('ATK'), [[9,10,11]])) return true;
  return false;
}

function broadcastState(room) {
  room.players.forEach((player, idx) => {
    const socket = io.sockets.sockets.get(player.socketId);
    if (!socket) return;
    const others = room.players.filter((_, i) => i !== idx).map(p => ({
      name: p.name, handCount: p.hand.length, field: p.field, yellows: p.yellows, skipped: p.skipped
    }));
    socket.emit('game_state', {
      myHand: player.hand, myField: player.field, myYellows: player.yellows, opponents: others,
      currentTurn: room.turn % room.players.length, myIndex: idx, deckCount: room.deck.length,
      firstTurn: room.firstTurn, discardPile: room.discardPile.slice(-3) || []
    });
  });
}

// ========== SOCKET HANDLERS ==========
io.on('connection', (socket) => {
  socket.on('create_room', ({ playerName }) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const room = createRoom(code);
    room.players.push(createPlayerState(socket.id, playerName));
    rooms[code] = room;
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.name = playerName;
    socket.emit('room_created', { code });
    io.to(code).emit('players_update', { players: room.players.map(p => p.name) });
  });

  socket.on('join_room', ({ code, playerName }) => {
    const room = rooms[code];
    if (!room || room.state !== 'waiting' || room.players.length >= 4) return socket.emit('error', { msg: 'الغرفة ممتلئة أو غير موجودة' });
    room.players.push(createPlayerState(socket.id, playerName));
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.name = playerName;
    socket.emit('room_joined', { code });
    io.to(code).emit('players_update', { players: room.players.map(p => p.name) });
  });

  socket.on('start_game', () => {
    const room = rooms[socket.data.roomCode];
    if (room && room.players[0].socketId === socket.id && room.players.length >= 2) {
      room.state = 'playing'; dealCards(room);
      io.to(room.code).emit('game_started'); broadcastState(room);
    }
  });

  socket.on('place_card', ({ cardId, zone }) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.state !== 'playing' || (room.turn % room.players.length) !== room.players.findIndex(p => p.socketId === socket.id)) return;
    const player = room.players.find(p => p.socketId === socket.id);
    const cardIdx = player.hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;
    const card = player.hand[cardIdx];
    if ((player._placedThisTurn || 0) >= 2) return socket.emit('error', { msg: 'ممكن تلعب كارتين بس في الدور!' });
    
    player.hand.splice(cardIdx, 1);
    const targetZone = card.joker ? zone : card.zone;
    player.field[targetZone].push(card);
    player._placedThisTurn = (player._placedThisTurn || 0) + 1;

    if (checkWin(player)) { io.to(room.code).emit('game_over', { winner: player.name }); room.state = 'finished'; }
    broadcastState(room);
  });

  socket.on('end_turn', () => {
    const room = rooms[socket.data.roomCode];
    if (!room) return;
    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return;
    const player = room.players[pIdx];

    player._placedThisTurn = 0; player._drawnThisTurn = 0;

    // إصلاح منطق الكروت المعارة
    player.loanedCards.forEach(l => {
      l.turns--;
      if (l.turns === 0) {
        for (const z of Object.keys(player.field)) {
          const idx = player.field[z].findIndex(c => c.id === l.card.id);
          if (idx !== -1) {
            player.field[z].splice(idx, 1);
            const owner = room.players.find(p => p.socketId === l.ownerSocketId);
            if (owner) owner.field[l.card.zone === 'JOKER' ? 'ATK' : l.card.zone].push(l.card);
            break;
          }
        }
      }
    });
    player.loanedCards = player.loanedCards.filter(l => l.turns > 0);
    while (player.hand.length > 7) { room.discardPile.push(player.hand.splice(Math.floor(Math.random()*player.hand.length), 1)[0]); }

    room.turn++;
    let nextIdx = room.turn % room.players.length;
    if (room.players[nextIdx].skipped) { room.players[nextIdx].skipped = false; room.turn++; }
    broadcastState(room);
  });

  socket.on('draw_card', () => {
    const room = rooms[socket.data.roomCode];
    const player = room?.players.find(p => p.socketId === socket.id);
    if (player && (room.turn % room.players.length) === room.players.indexOf(player) && (player._drawnThisTurn || 0) < 2) {
      if (room.deck.length > 0) {
        player.hand.push(room.deck.shift());
        player._drawnThisTurn = (player._drawnThisTurn || 0) + 1;
        broadcastState(room);
      }
    }
  });

  socket.on('play_special', (data) => {
    const room = rooms[socket.data.roomCode];
    const player = room?.players.find(p => p.socketId === socket.id);
    if (!player || (player._placedThisTurn || 0) >= 2) return;
    const cardIdx = player.hand.findIndex(c => c.id === data.cardId);
    if (cardIdx === -1) return;
    const card = player.hand[cardIdx];

    room.pendingSpecial = { card, fromIdx: room.players.indexOf(player), ...data, cancelled: false };
    
    room.players.forEach((p, i) => {
      io.sockets.sockets.get(p.socketId)?.emit('special_pending', { cardName: card.name, fromPlayer: player.name, targetPlayer: room.players[data.targetPlayerIdx]?.name, targetIsMe: i === data.targetPlayerIdx });
    });

    setTimeout(() => {
      if (!room.pendingSpecial || room.pendingSpecial.cancelled) { room.pendingSpecial = null; return; }
      const sp = room.pendingSpecial; room.pendingSpecial = null;
      const cIdx = player.hand.findIndex(c => c.id === sp.card.id);
      if (cIdx !== -1) player.hand.splice(cIdx, 1);
      room.discardPile.push(sp.card);
      applySpecial(room, sp);
      if (checkWin(player)) io.to(room.code).emit('game_over', { winner: player.name });
      broadcastState(room);
    }, 7000); // 7 ثواني
  });

  socket.on('cancel_order', ({ cardId }) => {
    const room = rooms[socket.data.roomCode];
    if (room && room.pendingSpecial) {
      const player = room.players.find(p => p.socketId === socket.id);
      const cIdx = player.hand.findIndex(c => c.id === cardId && c.name === 'Cancel Order');
      if (cIdx !== -1) {
        player.hand.splice(cIdx, 1); room.pendingSpecial.cancelled = true;
        io.to(room.code).emit('special_cancelled', { by: player.name });
        broadcastState(room);
      }
    }
  });

  socket.on('disconnect', () => {
    const room = rooms[socket.data.roomCode];
    if (room) {
      room.players = room.players.filter(p => p.socketId !== socket.id);
      if (room.players.length === 0) delete rooms[room.code];
      else broadcastState(room);
    }
  });
});

function applySpecial(room, { card, fromIdx, targetPlayerIdx, targetCardId, targetZone, myCardId }) {
  const attacker = room.players[fromIdx], defender = room.players[targetPlayerIdx];
  if (!defender && card.name !== 'Trash Player') return;
  switch (card.name) {
    case 'Red Card':
      for (let z in defender.field) { let i = defender.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){defender.field[z].splice(i,1); break;} }
      break;
    case 'Yellow Card':
      defender.yellows[targetCardId] = (defender.yellows[targetCardId] || 0) + 1;
      if (defender.yellows[targetCardId] >= 2) { 
        delete defender.yellows[targetCardId];
        for (let z in defender.field) { let i = defender.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){defender.field[z].splice(i,1); break;} }
      }
      break;
    case 'Offside': defender.skipped = true; break;
    case 'Swap':
      let myC, myZ, thC, thZ;
      for(let z in attacker.field){ let i=attacker.field[z].findIndex(c=>c.id===myCardId); if(i!==-1){myC=attacker.field[z].splice(i,1)[0]; myZ=z; break;}}
      for(let z in defender.field){ let i=defender.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){thC=defender.field[z].splice(i,1)[0]; thZ=z; break;}}
      if(myC && thC) { attacker.field[thC.joker?myZ:thC.zone].push(thC); defender.field[myC.joker?thZ:myC.zone].push(myC); }
      break;
    case 'Contract':
      for(let z in defender.field){ let i=defender.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ let [s]=defender.field[z].splice(i,1); attacker.field[s.joker?(targetZone||'ATK'):s.zone].push(s); break; }}
      break;
    case 'Loan':
      for(let z in defender.field){ let i=defender.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ let [l]=defender.field[z].splice(i,1); attacker.field[l.joker?(targetZone||'ATK'):l.zone].push(l); attacker.loanedCards.push({card:l, turns:2, ownerSocketId:defender.socketId}); break; }}
      break;
    case 'Trash Player':
      for(let z in attacker.field){ let i=attacker.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ attacker.field[z].splice(i,1); break; }}
      break;
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));