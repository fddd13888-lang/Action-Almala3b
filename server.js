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
app.get('/ping', (req, res) => res.send('ok'));

// ========== CARD DEFINITIONS ==========
function buildDeck() {
  const deck = [];
  let id = 1;

  // GOALKEEPERS (30) — كلهم رقم 1
  for (let i = 0; i < 30; i++) {
    deck.push({ id: id++, type: 'player', zone: 'GK', number: 1, star: false, captain: false });
  }

  // ===================================================
  // DEFENSE — 70 كارت — 4 أرقام (2,3,4,5)
  // كل رقم 17-18 كارت، موزعة: عادي + نجمة + نجمة+كابتن
  // رقم 2: كافو + لام  | رقم 3: مالديني + روبيرتو كارلوس
  // رقم 4: بيكنباور + راموس | رقم 5: بويول + كانافارو
  // ===================================================
  // رقم 2 — 18 كارت: 10 عادي + 5 نجمة + 3 نجمة+كابتن
  for(let i=0;i<10;i++) deck.push({id:id++,type:'player',zone:'DEF',number:2,star:false,captain:false,player:'كافو/لام'});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:2,star:true,captain:false,player:'كافو/لام'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:2,star:true,captain:true,player:'كافو/لام'});
  // رقم 3 — 18 كارت: 10 عادي + 5 نجمة + 3 نجمة+كابتن
  for(let i=0;i<10;i++) deck.push({id:id++,type:'player',zone:'DEF',number:3,star:false,captain:false,player:'مالديني/كارلوس'});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:3,star:true,captain:false,player:'مالديني/كارلوس'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:3,star:true,captain:true,player:'مالديني/كارلوس'});
  // رقم 4 — 17 كارت: 9 عادي + 5 نجمة + 3 نجمة+كابتن
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'DEF',number:4,star:false,captain:false,player:'بيكنباور/راموس'});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:4,star:true,captain:false,player:'بيكنباور/راموس'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:4,star:true,captain:true,player:'بيكنباور/راموس'});
  // رقم 5 — 17 كارت: 9 عادي + 5 نجمة + 3 نجمة+كابتن
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'DEF',number:5,star:false,captain:false,player:'بويول/كانافارو'});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:5,star:true,captain:false,player:'بويول/كانافارو'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:5,star:true,captain:true,player:'بويول/كانافارو'});

  // ===================================================
  // MIDFIELD — 50 كارت — 3 أرقام (6,7,8)
  // رقم 6: تشافي + بوغبا | رقم 7: بيكهام + دي بروين
  // رقم 8: إنييستا + كروس
  // ===================================================
  // رقم 6 — 17 كارت: 9 عادي + 5 نجمة + 3 نجمة+كابتن
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'MID',number:6,star:false,captain:false,player:'تشافي/بوغبا'});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'MID',number:6,star:true,captain:false,player:'تشافي/بوغبا'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'MID',number:6,star:true,captain:true,player:'تشافي/بوغبا'});
  // رقم 7 — 17 كارت: 9 عادي + 5 نجمة + 3 نجمة+كابتن
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'MID',number:7,star:false,captain:false,player:'بيكهام/دي برويين'});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'MID',number:7,star:true,captain:false,player:'بيكهام/دي برويين'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'MID',number:7,star:true,captain:true,player:'بيكهام/دي برويين'});
  // رقم 8 — 16 كارت: 9 عادي + 4 نجمة + 3 نجمة+كابتن
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'MID',number:8,star:false,captain:false,player:'إنييستا/كروس'});
  for(let i=0;i<4;i++) deck.push({id:id++,type:'player',zone:'MID',number:8,star:true,captain:false,player:'إنييستا/كروس'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'MID',number:8,star:true,captain:true,player:'إنييستا/كروس'});

  // ===================================================
  // ATTACK — 30 كارت — 3 أرقام (9,10,11) — 10 كارت لكل رقم
  // رقم 9: رونالدو + رونالدو البرازيلي | رقم 10: ميسي + بيليه
  // رقم 11: نيمار + صلاح
  // ===================================================
  // رقم 9 — 10 كارت: 5 عادي + 3 نجمة + 2 نجمة+كابتن
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'ATK',number:9,star:false,captain:false,player:'رونالدو/رونالدو البرازيلي'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'ATK',number:9,star:true,captain:false,player:'رونالدو/رونالدو البرازيلي'});
  for(let i=0;i<2;i++) deck.push({id:id++,type:'player',zone:'ATK',number:9,star:true,captain:true,player:'رونالدو/رونالدو البرازيلي'});
  // رقم 10 — 10 كارت: 5 عادي + 3 نجمة + 2 نجمة+كابتن
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'ATK',number:10,star:false,captain:false,player:'ميسي/بيليه'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'ATK',number:10,star:true,captain:false,player:'ميسي/بيليه'});
  for(let i=0;i<2;i++) deck.push({id:id++,type:'player',zone:'ATK',number:10,star:true,captain:true,player:'ميسي/بيليه'});
  // رقم 11 — 10 كارت: 5 عادي + 3 نجمة + 2 نجمة+كابتن
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'ATK',number:11,star:false,captain:false,player:'نيمار/صلاح'});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'ATK',number:11,star:true,captain:false,player:'نيمار/صلاح'});
  for(let i=0;i<2;i++) deck.push({id:id++,type:'player',zone:'ATK',number:11,star:true,captain:true,player:'نيمار/صلاح'});

  // JOKER (10) — كارت خوليت — كلهم نجمة+كابتن — بدون رقم
  for (let i = 0; i < 10; i++) deck.push({ id: id++, type: 'player', zone: 'JOKER', number: null, star: true, captain: true, joker: true });

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
    discardPile: [],
    burnedPile: []  // كروت اللاعبين المطرودين والمنذرين بانذارين
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

  // Option B: consecutive numbers (الجوكر يكمل رقم ناقص واحد)
  const hasJoker = (zone) => field[zone].some(c => c.joker);
  const defNums = field.DEF.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const midNums = field.MID.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const atkNums = field.ATK.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);

  const consecWithJoker = (nums, joker, sets) => sets.some(s => {
    const missing = s.filter(n => !nums.includes(n));
    if (missing.length === 0) return true;
    if (joker && missing.length === 1) return true;
    return false;
  });

  if (consecWithJoker(defNums, hasJoker('DEF'), [[2,3,4],[3,4,5]])) return true;
  if (consecWithJoker(midNums, hasJoker('MID'), [[6,7,8]])) return true;
  if (consecWithJoker(atkNums, hasJoker('ATK'), [[9,10,11]])) return true;

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
      discardPile: room.discardPile.slice(-3) || [],
      burnedPile: room.burnedPile || []
    });
  });
}

// ========== SOCKET HANDLERS ==========
io.on('connection', (socket) => {
  // CREATE ROOM
  socket.on('create_room', ({ playerName }) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const room = createRoom(code);
    const player = createPlayerState(socket.id, playerName);
    room.players.push(player);
    rooms[code] = room;
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.name = playerName;
    socket.emit('room_created', { code });
    io.to(code).emit('players_update', { players: room.players.map(p => p.name) });
  });

  // JOIN ROOM
  socket.on('join_room', ({ code, playerName }) => {
    const room = rooms[code];
    if (!room) return socket.emit('error', { msg: 'الغرفة مش موجودة' });
    if (room.state !== 'waiting') return socket.emit('error', { msg: 'اللعبة بدأت فعلاً' });
    if (room.players.length >= 4) return socket.emit('error', { msg: 'الغرفة ممتلئة (4 لاعبين بحد أقصى)' });

    const player = createPlayerState(socket.id, playerName);
    room.players.push(player);
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.name = playerName;
    socket.emit('room_joined', { code });
    io.to(code).emit('players_update', { players: room.players.map(p => p.name) });
  });

  // ========== التعديل 3: إضافة زر START GAME ==========
  socket.on('start_game', () => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room) return;
    if (room.state !== 'waiting') return socket.emit('error', { msg: 'اللعبة بدأت فعلاً!' });
    if (room.players.length < 2) return socket.emit('error', { msg: 'محتاج لاعبين على الأقل!' });

    // تأكد أن اللي بيبدأ هو أول لاعب في الغرفة
    if (room.players[0].socketId !== socket.id) {
      return socket.emit('error', { msg: 'صاحب الغرفة بس اللي يقدر يبدأ اللعبة!' });
    }

    room.state = 'playing';
    dealCards(room);
    io.to(code).emit('game_started');
    broadcastState(room);
  });

  // PLACE CARD
  socket.on('place_card', ({ cardId, zone }) => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return socket.emit('error', { msg: 'مش دورك!' });

    const player = room.players[pIdx];
    const cardIdx = player.hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const card = player.hand[cardIdx];
    if (card.type !== 'player') return;

    const fieldCount = getFieldCount(player);
    if (fieldCount >= 11) return socket.emit('error', { msg: 'الملعب ممتلئ (11 لاعب)!' });
    const ZONE_LIMITS = { GK: 1, DEF: 5, MID: 4, ATK: 3 };
    const tz = card.zone === 'JOKER' ? zone : card.zone;
    if (ZONE_LIMITS[tz] && player.field[tz].length >= ZONE_LIMITS[tz])
      return socket.emit('error', { msg: 'الحد الاقصى في ' + tz + ' (' + ZONE_LIMITS[tz] + ' لاعبين)!' });

    player._placedThisTurn = (player._placedThisTurn || 0) + 1;
    if (player._placedThisTurn > 2) {
      player._placedThisTurn--;
      return socket.emit('error', { msg: 'ممكن تلعب 2 كروت بس في الدور الواحد!' });
    }

    player.hand.splice(cardIdx, 1);
    const targetZone = card.zone === 'JOKER' ? zone : card.zone;
    player.field[targetZone].push(card);

    // ========== التعديل 1: فحص الفوز بعد كل Place ==========
    if (checkWin(player)) {
      io.to(code).emit('game_over', { winner: player.name, winnerField: player.field, burnedPile: room.burnedPile || [] });
      room.state = 'finished';
      return;
    }

    broadcastState(room);
  });

  // MOVE JOKER
  socket.on('move_joker', ({ cardId, newZone }) => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return socket.emit('error', { msg: 'مش دورك!' });

    const player = room.players[pIdx];
    for (const zone of Object.keys(player.field)) {
      const idx = player.field[zone].findIndex(c => c.id === cardId && c.joker);
      if (idx !== -1) {
        const [joker] = player.field[zone].splice(idx, 1);
        player.field[newZone].push(joker);
        
        // ========== التعديل 1: فحص الفوز بعد نقل الجوكر ==========
        if (checkWin(player)) {
          io.to(code).emit('game_over', { winner: player.name, winnerField: player.field, burnedPile: room.burnedPile || [] });
          room.state = 'finished';
          return;
        }
        
        broadcastState(room);
        return;
      }
    }
  });

  // END TURN
  socket.on('end_turn', () => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx !== room.turn % room.players.length) return socket.emit('error', { msg: 'مش دورك!' });

    const player = room.players[pIdx];
    player._placedThisTurn = 0;
    player._drawnThisTurn = 0;

    // إرجاع الكروت المعارة
    player.loanedCards.forEach(l => {
      l.turns--;
    });
    // إرجاع الكروت اللي خلصت إعارتها لأصحابها
    player.loanedCards.forEach(l => {
      if (l.turns === 0) {
        // نشيل الكارت من ملعب المستعير
        for (const z of Object.keys(player.field)) {
          const idx = player.field[z].findIndex(c => c.id === l.card.id);
          if (idx !== -1) {
            player.field[z].splice(idx, 1);
            break;
          }
        }
        // نرجع الكارت لصاحبه
        const owner = room.players.find(p => p.socketId === l.ownerSocketId);
        if (owner) {
          const zone = l.card.zone === 'JOKER' ? 'ATK' : l.card.zone;
          owner.field[zone].push(l.card);
        }
      }
    });
    player.loanedCards = player.loanedCards.filter(l => l.turns > 0);

    // حرق الكروت الزيادة عن 7 وإضافتها للـ burnedPile
    while (player.hand.length > 7) {
      const idx = Math.floor(Math.random() * player.hand.length);
      const burned = player.hand.splice(idx, 1)[0];
      room.burnedPile = room.burnedPile || [];
      room.burnedPile.push({ ...burned, burnedBy: 'overflow', burnedFrom: player.name });
    }

    // Next turn
    room.turn++;
    room.firstTurn = false;

    // Offside: لو اللاعب الجاي عنده skipped، ابعتله رسالة وتخطاه
    let nextIdx = room.turn % room.players.length;
    if (room.players[nextIdx].skipped) {
      room.players[nextIdx].skipped = false;
      // ابعت رسالة للاعب اللي اتخطى
      const skippedSocket = io.sockets.sockets.get(room.players[nextIdx].socketId);
      if (skippedSocket) {
        skippedSocket.emit('turn_skipped');
      }
      // تخطاه وكمل للاعب التاني
      room.turn++;
    }

    // ابعت new_turn event للاعب اللي دوره جاي عشان يعمل reset صح
    const newTurnIdx = room.turn % room.players.length;
    const newTurnSocket = io.sockets.sockets.get(room.players[newTurnIdx].socketId);
    if (newTurnSocket) {
      newTurnSocket.emit('your_turn_start');
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

    broadcastState(room);
  });

  // PLAY SPECIAL CARD
  socket.on('play_special', ({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId }) => {
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

    // تحسب الكارت الخاص كلعبة في الدور
    player._placedThisTurn = (player._placedThisTurn || 0) + 1;
    if (player._placedThisTurn > 2) {
      player._placedThisTurn--;
      return socket.emit('error', { msg: 'ممكن تلعب 2 كروت بس في الدور الواحد!' });
    }

    // ========== التعديل 2: فحص الحد الأقصى للملعب وللمراكز قبل Contract/Loan ==========
    const target = room.players[targetPlayerIdx];
    if (card.name === 'Contract' || card.name === 'Loan') {
      // 1. فحص العدد الكلي في الملعب
      const currentFieldCount = getFieldCount(player);
      const MAX_FIELD_SIZE = 11;
      
      if (currentFieldCount >= MAX_FIELD_SIZE) {
        return socket.emit('error', { 
          msg: `مينفعش! عندك ${currentFieldCount} لاعب في الملعب، الحد الأقصى ${MAX_FIELD_SIZE} لاعب!` 
        });
      }
      
      // 2. فحص الحد الأقصى للمركز اللي هيروح فيه اللاعب
      let finalZone = targetZone;
      if (!finalZone) {
        // نجد الكارت المستهدف لتحديد المركز
        for (const z of Object.keys(target.field)) {
          const foundCard = target.field[z].find(c => c.id === targetCardId);
          if (foundCard) {
            finalZone = foundCard.zone === 'JOKER' ? 'ATK' : foundCard.zone;
            break;
          }
        }
      }

      // الحد الأقصى لكل مركز
      const MAX_LIMITS = { GK: 1, DEF: 5, MID: 4, ATK: 3 };
      
      // نحسب عدد اللاعبين الحاليين في المركز
      const currentCount = player.field[finalZone].length;
      
      if (currentCount >= MAX_LIMITS[finalZone]) {
        return socket.emit('error', { 
          msg: `مينفعش! عندك ${currentCount} لاعب في ${finalZone}، الحد الأقصى ${MAX_LIMITS[finalZone]} لاعبين!` 
        });
      }
    }

    // هل الـ target عنده Cancel Order في إيده؟
    // لو Trash Player على نفسك — مفيش Cancel Order
    const isSelfTarget = (targetPlayerIdx === pIdx);
    const targetHasCancelOrder = !isSelfTarget && target && target.hand.some(c => c.name === 'Cancel Order');

    // لو الـ target معندوش Cancel Order → نفذ فوراً بدون انتظار
    if (!targetHasCancelOrder) {
      player.hand.splice(cardIdx, 1);
      room.discardPile = room.discardPile || [];
      room.discardPile.push(card);
      applySpecial(room, { card, fromIdx: pIdx, targetPlayerIdx, targetCardId, targetZone, myCardId });
      if (checkWin(player)) {
        io.to(code).emit('game_over', { winner: player.name, winnerField: player.field, burnedPile: room.burnedPile || [] });
        room.state = 'finished';
        return;
      }
      broadcastState(room);
      return;
    }

    // لو عنده Cancel Order → انتظر 7 ثواني وبعت للـ target popup
    room.pendingSpecial = { card, fromIdx: pIdx, targetPlayerIdx, targetCardId, targetZone, myCardId, cancelled: false };

    room.players.forEach((p, i) => {
      const s = io.sockets.sockets.get(p.socketId);
      if (!s) return;
      s.emit('special_pending', {
        cardName: card.name,
        fromPlayer: player.name,
        targetPlayer: target?.name,
        targetIsMe: i === targetPlayerIdx
      });
    });

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
      applySpecial(room, { ...sp, myCardId: sp.myCardId });
      if (checkWin(player)) {
        io.to(code).emit('game_over', { winner: player.name, winnerField: player.field, burnedPile: room.burnedPile || [] });
        room.state = 'finished';
        return;
      }
      broadcastState(room);
    }, 7000);
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

    // حرق كارت الـ Cancel Order من المدافع
    player.hand.splice(cIdx, 1);

    // حرق الكارت الخاص من إيد المهاجم
    const attacker = room.players[room.pendingSpecial.fromIdx];
    if (attacker) {
      const attackCardIdx = attacker.hand.findIndex(c => c.id === room.pendingSpecial.card.id);
      if (attackCardIdx !== -1) {
        const burned = attacker.hand.splice(attackCardIdx, 1)[0];
        room.discardPile = room.discardPile || [];
        room.discardPile.push(burned);
      }
    }

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
function applySpecial(room, { card, fromIdx, targetPlayerIdx, targetCardId, targetZone, myCardId }) {
  const attacker = room.players[fromIdx];
  const defender = room.players[targetPlayerIdx];

  switch (card.name) {
    case 'Red Card': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) { 
          const [burned] = defender.field[zone].splice(idx, 1);
          room.burnedPile = room.burnedPile || [];
          room.burnedPile.push({ ...burned, burnedBy: 'red', burnedFrom: defender.name });
          break; 
        }
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
          if (idx !== -1) { 
            const [burned] = defender.field[zone].splice(idx, 1);
            room.burnedPile = room.burnedPile || [];
            room.burnedPile.push({ ...burned, burnedBy: 'yellow2', burnedFrom: defender.name });
            break; 
          }
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
        const i = attacker.field[z].findIndex(c => c.id === myCardId);
        if (i !== -1) { myCard = attacker.field[z][i]; myZone = z; myIdx = i; break; }
      }
      for (const z of Object.keys(defender.field)) {
        const i = defender.field[z].findIndex(c => c.id === targetCardId);
        if (i !== -1) { theirCard = defender.field[z][i]; theirZone = z; theirIdx = i; break; }
      }
      if (myCard && theirCard) {
        // كل كارت يروح في مركزه الأصلي مش مركز الكارت التاني
        const myCardTargetZone = theirCard.zone === 'JOKER' ? myZone : theirCard.zone;
        const theirCardTargetZone = myCard.zone === 'JOKER' ? theirZone : myCard.zone;

        attacker.field[myZone].splice(myIdx, 1);
        defender.field[theirZone].splice(theirIdx, 1);

        attacker.field[myCardTargetZone] = attacker.field[myCardTargetZone] || [];
        attacker.field[myCardTargetZone].push(theirCard);
        defender.field[theirCardTargetZone] = defender.field[theirCardTargetZone] || [];
        defender.field[theirCardTargetZone].push(myCard);

        // الأنذارات تتنقل مع الكارت
        const myYellow = attacker.yellows[myCardId];
        const theirYellow = defender.yellows[targetCardId];
        delete attacker.yellows[myCardId];
        delete defender.yellows[targetCardId];
        if (myYellow) defender.yellows[myCard.id] = myYellow;
        if (theirYellow) attacker.yellows[theirCard.id] = theirYellow;
      }
      break;
    }
    case 'Contract': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) {
          const [stolen] = defender.field[zone].splice(idx, 1);
          // اللاعب يجي في مركزه الأصلي، الجوكر بيتحدد من targetZone
          const z = stolen.zone === 'JOKER' ? (targetZone || 'ATK') : stolen.zone;
          attacker.field[z] = attacker.field[z] || [];
          attacker.field[z].push(stolen);
          // الأنذارات تنتقل مع اللاعب
          if (defender.yellows[stolen.id]) {
            attacker.yellows[stolen.id] = defender.yellows[stolen.id];
            delete defender.yellows[stolen.id];
          }
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
        if (idx !== -1) {
          const [trashed] = attacker.field[zone].splice(idx, 1);
          room.burnedPile = room.burnedPile || [];
          room.burnedPile.push({ ...trashed, burnedBy: 'trash', burnedFrom: attacker.name });
          break;
        }
      }
      break;
    }
  }
}

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => console.log(`Action Almala3b Server running on ${HOST}:${PORT}`));
