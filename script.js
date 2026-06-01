// Capivara Dash - versão com dificuldade, reviver, personagens, músicas e responsividade horizontal.

let capivara, comidaImg, ovoImg, fundoImg;
let personagensImgs = {}; // imagens reais dos personagens em assets/
let coracaoCheio, coracaoVazio;
let fundoPadrao, fundoNoturno, fundoFloresta;
let musicaFundo, somComida, somPerdeVida, somGameOver;

let comidinhas = [];
let ovos = [];
let vidasDrop = [];
let chavesDrop = [];
let particulas = [];

let score = 0;
let displayedScore = 0;
let lives = 3;
let fase = 1;
let gameStarted = false;
let jogoPausado = false;
let reviveDisponivel = false;
let chaveJaApareceu = false;
let revivesUsados = 0;

let capivaraX, capivaraY;
let velocidadeCapivara = 8;
let velocidadeItens = 1;
let leftPressed = false;
let rightPressed = false;

let comidaInterval, ovoInterval, vidaInterval, chaveInterval;
let toastTimer = null;
let flashFrames = 0;
let phaseFlashFrames = 0;
let selectedCharacter = 'classica';
let dificuldadeAtual = 'medio';
let somMutado = false;
let musicaAtual = 0;

const MAX_WIDTH = 600;
const MAX_HEIGHT = 500;
const CHARACTER_SIZE = 70;
const ITEM_SIZE = 40;

const DIFICULDADES = {
  facil:  { label: 'Fácil',  itemSpeed: 1.0, capySpeed: 8.2, foodMs: 1050, eggMs: 2400, eggChance: 0.23, foodChance: 0.62, speedGain: 0.10 },
  medio:  { label: 'Médio',  itemSpeed: 1.25, capySpeed: 8.6, foodMs: 1150, eggMs: 1900, eggChance: 0.34, foodChance: 0.55, speedGain: 0.13 },
  dificil:{ label: 'Difícil', itemSpeed: 1.48, capySpeed: 9.0, foodMs: 1250, eggMs: 1450, eggChance: 0.46, foodChance: 0.50, speedGain: 0.16 }
};

const PERSONAGENS = {
  classica:  { nome: 'Capivara Clássica',   emoji: '🦫', arquivo: 'assets/classica.png',   aura: [255, 255, 255, 60] },
  ninja:     { nome: 'Capivara Ninja',      emoji: '🥷', arquivo: 'assets/ninja-removebg-preview.png',      aura: [40, 40, 50, 120] },
  princesa:  { nome: 'Capivara Princesa',   emoji: '👑', arquivo: 'assets/princesa-removebg-preview.png',   aura: [255, 160, 215, 110] },
  futebol:   { nome: 'Capivara Futebol',    emoji: '⚽', arquivo: 'assets/futebol-removebg-preview.png',    aura: [90, 210, 90, 110] },
  astronauta:{ nome: 'Capivara Astronauta', emoji: '🚀', arquivo: 'assets/astronauta-removebg-preview.png', aura: [170, 210, 255, 110] },
  bailarina: { nome: 'Capivara Bailarina',  emoji: '🩰', arquivo: 'assets/bailarina-removebg-preview.png',  aura: [255, 175, 215, 110] }
};

const MUSICAS = [
  { id: 'classica', nome: 'Clássica', rate: 1.00, volume: 0.55 },
  { id: 'calma', nome: 'Calma', rate: 0.88, volume: 0.42 },
  { id: 'aventura', nome: 'Aventura', rate: 1.05, volume: 0.58 },
  { id: 'turbo', nome: 'Turbo', rate: 1.13, volume: 0.62 }
];

function preload() {
  capivara = loadImage('assets/classica.png',
    img => { personagensImgs.classica = img; capivara = img; },
    () => { capivara = loadImage('assets/capivara.png'); }
  );

  personagensImgs.ninja = loadImage('assets/ninja-removebg-preview.png');
  personagensImgs.princesa = loadImage('assets/princesa-removebg-preview.png');
  personagensImgs.futebol = loadImage('assets/futebol-removebg-preview.png');
  personagensImgs.astronauta = loadImage('assets/astronauta-removebg-preview.png');
  personagensImgs.bailarina = loadImage('assets/bailarina-removebg-preview.png');

  comidaImg = loadImage('assets/comida.png');
  ovoImg = loadImage('assets/ovo.png');
  fundoPadrao = loadImage('assets/fundo.jpeg');
  fundoNoturno = loadImage('assets/fundo_noturno.png');
  fundoFloresta = loadImage('assets/fundo_floresta.png');
  fundoImg = fundoPadrao;
  coracaoCheio = loadImage('assets/coracaoCheio.png');
  coracaoVazio = loadImage('assets/coracaoVazio.png');
  musicaFundo  = loadSound('assets/fundo.mp3');
  somComida    = loadSound('assets/comida.mp3');
  somPerdeVida = loadSound('assets/vida.mp3');
  somGameOver  = loadSound('assets/gameover.mp3');
}

function setup() {
  const size = calcularCanvasResponsivo();
  const canvas = createCanvas(size.w, size.h);
  canvas.parent('game-canvas');
  capivaraX = width / 2 - CHARACTER_SIZE / 2;
  capivaraY = height - CHARACTER_SIZE;
  textFont('Luckiest Guy');
  noLoop();
  atualizarPreviewPersonagem();
}

function calcularCanvasResponsivo() {
  const horizontalMobile = windowWidth > windowHeight && windowWidth < 920;
  const hudSpace = horizontalMobile ? 108 : 200;
  const availableW = horizontalMobile ? windowWidth - 36 : min(windowWidth, MAX_WIDTH);
  const availableH = windowHeight - hudSpace;
  return {
    w: floor(constrain(availableW, 320, MAX_WIDTH)),
    h: floor(constrain(availableH, 260, MAX_HEIGHT))
  };
}

function windowResized() {
  const size = calcularCanvasResponsivo();
  resizeCanvas(size.w, size.h);
  capivaraX = constrain(capivaraX, 0, width - CHARACTER_SIZE);
  capivaraY = height - CHARACTER_SIZE;
}

function draw() {
  if (!gameStarted) return;

  image(fundoImg, 0, 0, width, height);
  desenharEfeitoFase();

  if (!jogoPausado) {
    if (leftPressed)  capivaraX = max(0, capivaraX - velocidadeCapivara);
    if (rightPressed) capivaraX = min(width - CHARACTER_SIZE, capivaraX + velocidadeCapivara);
  }

  desenharItens();
  desenharCapivara();
  updatePlacarAnimado();
  drawVidasEstiloCoracao(10, 10);
  desenharParticulas();
  drawFlash();
}

function desenharCapivara() {
  const personagem = PERSONAGENS[selectedCharacter] || PERSONAGENS.classica;
  const aura = personagem.aura || [255,255,255,40];
  push();
  noStroke();
  fill(aura[0], aura[1], aura[2], aura[3]);
  ellipse(capivaraX + 35, capivaraY + 38, 80 + sin(frameCount * 0.08) * 5, 34);
  const imgPersonagem = personagensImgs[selectedCharacter] || capivara;
  image(imgPersonagem, capivaraX, capivaraY, CHARACTER_SIZE, CHARACTER_SIZE);
  pop();
}

function desenharItens() {
  for (let i = comidinhas.length - 1; i >= 0; i--) {
    let comida = comidinhas[i];
    comida.y += velocidadeItens;
    image(comidaImg, comida.x, comida.y, ITEM_SIZE, ITEM_SIZE);

    if (colidiu(comida.x, comida.y, ITEM_SIZE, ITEM_SIZE)) {
      score += 10;
      criarParticulas(comida.x + 20, comida.y + 20, '#6eec07');
      comidinhas.splice(i, 1);
      tocarSom(somComida);
      updateFase();
      updateHUD();
    } else if (comida.y > height) {
      lives--;
      comidinhas.splice(i, 1);
      danoOuRevive();
    }
  }

  for (let i = ovos.length - 1; i >= 0; i--) {
    let ovo = ovos[i];
    ovo.y += velocidadeItens;
    image(ovoImg, ovo.x, ovo.y, ITEM_SIZE, ITEM_SIZE);

    if (colidiu(ovo.x, ovo.y, ITEM_SIZE, ITEM_SIZE)) {
      lives--;
      ovos.splice(i, 1);
      danoOuRevive();
    } else if (ovo.y > height) {
      ovos.splice(i, 1);
    }
  }

  for (let i = vidasDrop.length - 1; i >= 0; i--) {
    let vida = vidasDrop[i];
    vida.y += velocidadeItens * 0.72;
    let escala = 30 + sin(frameCount * 0.15 + i) * 4;
    image(coracaoCheio, vida.x, vida.y, escala, escala);

    if (colidiu(vida.x, vida.y, 30, 30)) {
      if (lives < 3) {
        lives++;
        showToast('❤️ Vida recuperada!');
        tocarSom(somComida);
        updateHUD();
      }
      vidasDrop.splice(i, 1);
    } else if (vida.y > height) {
      vidasDrop.splice(i, 1);
    }
  }

  for (let i = chavesDrop.length - 1; i >= 0; i--) {
    let chave = chavesDrop[i];
    chave.y += velocidadeItens * 0.62;
    desenharChave(chave.x, chave.y, frameCount * 0.08 + i);

    if (colidiu(chave.x, chave.y, 42, 42)) {
      reviveDisponivel = true;
      chavesDrop.splice(i, 1);
      criarParticulas(chave.x + 20, chave.y + 20, '#ffd700');
      showToast('🔑 Chave de reviver coletada!');
      tocarSom(somComida);
      updateHUD();
    } else if (chave.y > height) {
      chavesDrop.splice(i, 1);
    }
  }
}

function desenharChave(x, y, rot) {
  push();
  translate(x + 20, y + 20);
  rotate(sin(rot) * 0.16);
  stroke(70, 45, 0);
  strokeWeight(3);
  fill(255, 215, 0);
  ellipse(-9, 0, 20, 20);
  fill(255, 245, 150);
  ellipse(-9, 0, 8, 8);
  line(1, 0, 21, 0);
  line(16, 0, 16, 8);
  line(22, 0, 22, 7);
  pop();
}

function danoOuRevive() {
  tocarSom(somPerdeVida);
  flashDano();
  if (lives <= 0 && reviveDisponivel) {
    usarRevive();
  } else if (lives <= 0) {
    gameOver();
  }
  updateHUD();
}

function usarRevive() {
  reviveDisponivel = false;
  revivesUsados++;
  lives = 2;
  ovos = ovos.slice(0, Math.floor(ovos.length / 2));
  comidinhas = comidinhas.slice(0, Math.ceil(comidinhas.length / 2));
  phaseFlashFrames = 24;
  mostrarTransicaoFase('🔑 Segunda chance!');
  showToast('🔑 A capivara reviveu!');
}

function updateFase() {
  const novaFase = Math.floor(score / 100) + 1;
  if (novaFase > fase) {
    const pulou = novaFase - fase;
    fase = novaFase;
    const config = DIFICULDADES[dificuldadeAtual];
    velocidadeCapivara += 0.12 * pulou;
    velocidadeItens += config.speedGain * pulou;
    if (fase > 10) velocidadeItens += 0.02 * pulou;
    phaseFlashFrames = 32;
    criarParticulas(width / 2, height / 2, '#ffd700', 28);
    mostrarTransicaoFase('FASE ' + fase);
    showToast('🚀 Fase ' + fase + '!');
    reiniciarSpawnsSeJogando();
  }
}

function iniciarSpawns() {
  pararSpawns();
  const config = DIFICULDADES[dificuldadeAtual];
  const fatorFase = max(0, fase - 1);
  const foodMs = max(620, config.foodMs - fatorFase * 20);
  const eggMs = max(620, config.eggMs - fatorFase * 34);

  comidaInterval = setInterval(() => {
    if (!podeCriarItem()) return;
    const newX = random(width - ITEM_SIZE);
    if (podeNascer(newX, comidinhas, 90) && podeNascer(newX, ovos, 90) && random() < config.foodChance) {
      comidinhas.push({ x: newX, y: -random(40, 120) });
    }
  }, foodMs);

  ovoInterval = setInterval(() => {
    if (!podeCriarItem()) return;
    const extras = dificuldadeAtual === 'dificil' && fase >= 4 ? 2 : 1;
    for (let n = 0; n < extras; n++) {
      const newX = random(width - ITEM_SIZE);
      const chanceFase = min(0.18, fase * 0.012);
      if (podeNascer(newX, ovos, 78) && podeNascer(newX, comidinhas, 78) && random() < config.eggChance + chanceFase) {
        ovos.push({ x: newX, y: -random(40, 160) });
      }
    }
  }, eggMs);

  vidaInterval = setInterval(() => {
    if (!podeCriarItem() || lives >= 3) return;
    if (random() < 0.30) vidasDrop.push({ x: random(width - 40), y: -random(40, 120) });
  }, 18000);

  chaveInterval = setInterval(() => {
    if (!podeCriarItem()) return;
    if (fase >= 5 && !chaveJaApareceu && !reviveDisponivel && random() < 0.45) {
      chaveJaApareceu = true;
      chavesDrop.push({ x: random(width - 45), y: -random(60, 140) });
      showToast('🔑 Uma chave apareceu!');
    }
  }, 9000);
}

function pararSpawns() {
  clearInterval(comidaInterval);
  clearInterval(ovoInterval);
  clearInterval(vidaInterval);
  clearInterval(chaveInterval);
}

function reiniciarSpawnsSeJogando() {
  if (gameStarted && !jogoPausado) iniciarSpawns();
}

function podeCriarItem() {
  return gameStarted && !jogoPausado;
}

function flashDano() { flashFrames = 8; }

function drawFlash() {
  if (flashFrames > 0) {
    fill(255, 0, 0, map(flashFrames, 0, 8, 0, 100));
    noStroke();
    rect(0, 0, width, height);
    flashFrames--;
  }
}

function desenharEfeitoFase() {
  if (phaseFlashFrames > 0) {
    noStroke();
    fill(255, 255, 255, map(phaseFlashFrames, 0, 32, 0, 95));
    rect(0, 0, width, height);
    phaseFlashFrames--;
  }
}

function mostrarTransicaoFase(texto) {
  const el = document.getElementById('phase-transition');
  if (!el) return;
  el.textContent = texto;
  el.style.display = 'flex';
  el.classList.remove('phase-pop');
  void el.offsetWidth;
  el.classList.add('phase-pop');
  setTimeout(() => { el.style.display = 'none'; }, 1200);
}

function criarParticulas(x, y, cor = '#ffffff', qtd = 12) {
  for (let i = 0; i < qtd; i++) {
    particulas.push({
      x, y,
      vx: random(-2.5, 2.5),
      vy: random(-3, 1.5),
      life: random(18, 34),
      color: cor,
      size: random(3, 7)
    });
  }
}

function desenharParticulas() {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life--;
    push();
    noStroke();
    fill(p.color);
    circle(p.x, p.y, p.size);
    pop();
    if (p.life <= 0) particulas.splice(i, 1);
  }
}

function updatePlacarAnimado() {
  if (displayedScore < score) {
    displayedScore += 2;
    if (displayedScore > score) displayedScore = score;
  }
}

function drawVidasEstiloCoracao(x, y) {
  for (let i = 0; i < 3; i++) {
    const img = i < lives ? coracaoCheio : coracaoVazio;
    image(img, x + i * 36, y, 30, 30);
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.style.display = 'none'; }, 350);
  }, 1800);
}

function renderVidasHTML() {
  const el = document.getElementById('vidas-html');
  if (!el) return;
  let html = '';
  for (let i = 0; i < 3; i++) html += i < lives ? '❤️' : '🖤';
  el.innerHTML = html;
}

function updateFaseBar() {
  const pontosFase = score % 100;
  const pct = (pontosFase / 100) * 100;
  const bar = document.getElementById('fase-bar-fill');
  if (bar) bar.style.width = pct + '%';
}

function updateHUD() {
  const best = Number(localStorage.getItem('bestScore') || 0);
  setText('hud-score', score);
  setText('hud-fase', fase);
  setText('hud-best', best);
  setText('hud-score-side', score);
  setText('hud-fase-side', fase);
  setText('hud-best-side', best);
  setText('hud-key', '🔑 ' + (reviveDisponivel ? 1 : 0));
  setText('hud-key-side', '🔑 ' + (reviveDisponivel ? 1 : 0));
  setText('hud-difficulty-side', DIFICULDADES[dificuldadeAtual].label);
  renderVidasHTML();
  updateFaseBar();
  atualizarNomeMusica();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function keyPressed() {
  if (keyCode === LEFT_ARROW)  leftPressed = true;
  if (keyCode === RIGHT_ARROW) rightPressed = true;
  if (key === 'p' || key === 'P') togglePause();
  if (key === 'm' || key === 'M') toggleMute();
  if (key === 'n' || key === 'N') proximaMusica();
}

function keyReleased() {
  if (keyCode === LEFT_ARROW)  leftPressed = false;
  if (keyCode === RIGHT_ARROW) rightPressed = false;
}

function touchStarted() {
  if (!gameStarted) return;
  return false;
}

function touchEnded() { return false; }

function toggleMute() {
  somMutado = !somMutado;
  if (somMutado) getAudioContext().suspend();
  else getAudioContext().resume();
  atualizarIconesSom();
}

function atualizarIconesSom() {
  const cls = somMutado ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
  const icon = document.getElementById('mute-icon');
  const tIcon = document.getElementById('touch-mute-icon');
  const button = document.getElementById('mute-button');
  if (icon) icon.className = cls;
  if (tIcon) tIcon.className = cls;
  if (button) button.title = somMutado ? 'Ligar som' : 'Desligar som';
}

function tocarSom(som) {
  if (!som || somMutado) return;
  try { som.play(); } catch (e) { /* evita travar caso o áudio ainda não esteja liberado */ }
}

function aplicarMusicaAtual() {
  if (!musicaFundo) return;
  const config = MUSICAS[musicaAtual];
  musicaFundo.setVolume(config.volume);
  try { musicaFundo.rate(config.rate); } catch (e) {}
  atualizarNomeMusica();
}

function tocarMusicaFundo() {
  if (!musicaFundo) return;
  aplicarMusicaAtual();
  if (musicaFundo.isPlaying()) musicaFundo.stop();
  if (!somMutado) musicaFundo.loop();
}

function proximaMusica() {
  musicaAtual = (musicaAtual + 1) % MUSICAS.length;
  tocarMusicaFundo();
  showToast('🎵 ' + MUSICAS[musicaAtual].nome);
}

function musicaAnterior() {
  musicaAtual = (musicaAtual - 1 + MUSICAS.length) % MUSICAS.length;
  tocarMusicaFundo();
  showToast('🎵 ' + MUSICAS[musicaAtual].nome);
}

function trocarMusicaSelecionada() {
  const select = document.getElementById('musica-select');
  if (!select) return;
  const idx = MUSICAS.findIndex(m => m.id === select.value);
  musicaAtual = idx >= 0 ? idx : 0;
  if (gameStarted) tocarMusicaFundo();
  atualizarNomeMusica();
}

function atualizarNomeMusica() {
  const select = document.getElementById('musica-select');
  if (select) select.value = MUSICAS[musicaAtual].id;
  setText('music-name', MUSICAS[musicaAtual].nome);
}

function handlePauseToggle() { togglePause(); }

function togglePause() {
  if (!gameStarted) return;
  jogoPausado = !jogoPausado;
  const status = document.getElementById('pause-status');
  const toggle = document.getElementById('pause-toggle');
  const pIcon = document.getElementById('touch-pause-icon');

  if (jogoPausado) {
    pararSpawns();
    noLoop();
    if (musicaFundo && musicaFundo.isPlaying()) musicaFundo.pause();
    if (status) status.innerText = 'Pausado';
    if (toggle) toggle.checked = true;
    if (pIcon) pIcon.className = 'fa-solid fa-play';
    showToast('⏸️ Pausado');
  } else {
    iniciarSpawns();
    loop();
    if (musicaFundo && !somMutado) musicaFundo.loop();
    if (status) status.innerText = 'Jogando';
    if (toggle) toggle.checked = false;
    if (pIcon) pIcon.className = 'fa-solid fa-pause';
  }
}

function startGame() {
  userStartAudio();
  document.body.classList.remove('inicio');
  document.body.classList.add('jogo');
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-ui').style.display = 'flex';
  document.getElementById('game-over-popup').style.display = 'none';

  setTimeout(() => {
    document.getElementById('game-ui').classList.add('ui-visible');
    document.getElementById('game-canvas').classList.add('canvas-visible');
    windowResized();
  }, 50);

  const dificuldadeSelect = document.getElementById('dificuldade');
  dificuldadeAtual = dificuldadeSelect ? dificuldadeSelect.value : 'medio';
  selectedCharacter = document.getElementById('personagem')?.value || 'classica';
  trocarMusicaSelecionada();

  const config = DIFICULDADES[dificuldadeAtual];
  gameStarted = true;
  jogoPausado = false;
  score = 0;
  displayedScore = 0;
  lives = 3;
  fase = 1;
  reviveDisponivel = false;
  chaveJaApareceu = false;
  revivesUsados = 0;
  velocidadeCapivara = config.capySpeed;
  velocidadeItens = config.itemSpeed;
  capivaraX = width / 2 - CHARACTER_SIZE / 2;
  capivaraY = height - CHARACTER_SIZE;
  comidinhas = [];
  ovos = [];
  vidasDrop = [];
  chavesDrop = [];
  particulas = [];
  flashFrames = 0;
  phaseFlashFrames = 0;
  leftPressed = false;
  rightPressed = false;

  const toggle = document.getElementById('pause-toggle');
  const status = document.getElementById('pause-status');
  const pIcon = document.getElementById('touch-pause-icon');
  if (toggle) toggle.checked = false;
  if (status) status.innerText = 'Jogando';
  if (pIcon) pIcon.className = 'fa-solid fa-pause';

  pararSpawns();
  iniciarSpawns();
  tocarMusicaFundo();
  loop();
  updateHUD();
  trocarTema();
  mostrarTransicaoFase('VALENDO!');
}

function restartGame() { startGame(); }

function gameOver() {
  noLoop();
  gameStarted = false;
  jogoPausado = false;
  pararSpawns();
  comidinhas = [];
  ovos = [];
  vidasDrop = [];
  chavesDrop = [];
  leftPressed = false;
  rightPressed = false;
  capivaraX = width / 2 - CHARACTER_SIZE / 2;
  capivaraY = height - CHARACTER_SIZE;

  if (musicaFundo && musicaFundo.isPlaying()) musicaFundo.stop();
  tocarSom(somGameOver);

  let best = Number(localStorage.getItem('bestScore') || 0);
  let novoRecorde = false;
  if (score > best) {
    best = score;
    localStorage.setItem('bestScore', best);
    novoRecorde = true;
  }

  updateHUD();
  setText('final-score', score);
  setText('final-best', best);
  const badge = document.getElementById('new-record-badge');
  if (badge) badge.style.display = novoRecorde ? 'block' : 'none';
  document.getElementById('game-over-popup').style.display = 'flex';
}

function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function colidiu(x, y, w, h) {
  return collideRectRect(capivaraX, capivaraY, CHARACTER_SIZE, CHARACTER_SIZE, x, y, w, h);
}

function podeNascer(xNovo, fila, minDist) {
  return !fila.some(item => Math.abs(item.x - xNovo) < minDist);
}

function trocarTema() {
  const tema = document.getElementById('tema')?.value || 'padrao';
  const hud = document.getElementById('right-bar');
  const left = document.getElementById('left-bar');
  const body = document.body;
  const hudTop = document.getElementById('game-header');

  if (tema === 'padrao') {
    fundoImg = fundoPadrao;
    body.style.background = '#fd7a00';
    if (hud) { hud.style.color = '#003366'; hud.style.background = 'rgba(255,255,255,0.7)'; hud.style.borderColor = 'rgba(0,100,200,0.4)'; }
    if (left) { left.style.color = '#003366'; left.style.background = 'rgba(230,247,255,0.6)'; }
    if (hudTop) hudTop.style.background = 'rgba(0,0,0,0.35)';
  } else if (tema === 'noturno') {
    fundoImg = fundoNoturno;
    body.style.background = '#0d0d1a';
    if (hud) { hud.style.color = '#fff'; hud.style.background = 'rgba(20,20,40,0.85)'; hud.style.borderColor = 'rgba(100,100,255,0.4)'; }
    if (left) { left.style.color = '#aaa'; left.style.background = 'rgba(20,20,40,0.6)'; }
    if (hudTop) hudTop.style.background = 'rgba(10,10,30,0.6)';
  } else if (tema === 'floresta') {
    fundoImg = fundoFloresta;
    body.style.background = '#1a3a1a';
    if (hud) { hud.style.color = '#ecffec'; hud.style.background = 'rgba(7,92,7,0.72)'; hud.style.borderColor = 'rgba(7,180,7,0.5)'; }
    if (left) { left.style.color = '#145c1b'; left.style.background = 'rgba(210,245,210,0.5)'; }
    if (hudTop) hudTop.style.background = 'rgba(0,40,0,0.5)';
  }
}

function atualizarPreviewPersonagem() {
  const select = document.getElementById('personagem');
  const preview = document.getElementById('character-preview');
  const id = select ? select.value : 'classica';
  const p = PERSONAGENS[id] || PERSONAGENS.classica;
  if (preview) preview.textContent = `${p.emoji} ${p.nome}`;
}

function voltarParaInicio() {
  pararSpawns();
  gameStarted = false;
  jogoPausado = false;
  if (musicaFundo && musicaFundo.isPlaying()) musicaFundo.stop();
  document.body.classList.remove('jogo');
  document.body.classList.add('inicio');
  document.getElementById('start-screen').style.display = 'flex';
  document.getElementById('game-ui').style.display = 'none';
  document.getElementById('game-over-popup').style.display = 'none';
  document.getElementById('game-ui').classList.remove('ui-visible');
  trocarTema();
}

function salvarJogo() {
  const save = {
    score, lives, fase, dificuldadeAtual, selectedCharacter, musicaAtual, reviveDisponivel, revivesUsados
  };
  try {
    localStorage.setItem('capivara_save', JSON.stringify(save));
    showToast('💾 Jogo salvo!');
  } catch (e) {
    console.error('Erro ao salvar:', e);
    showToast('Erro ao salvar');
  }
}

function carregarJogo() {
  const raw = localStorage.getItem('capivara_save');
  if (!raw) { showToast('Nenhum salvamento encontrado'); return; }
  try {
    const s = JSON.parse(raw);
    score = Number(s.score || 0);
    lives = Number(s.lives || 3);
    fase = Number(s.fase || 1);
    dificuldadeAtual = s.dificuldadeAtual || 'medio';
    selectedCharacter = s.selectedCharacter || 'classica';
    musicaAtual = Number(s.musicaAtual || 0);
    reviveDisponivel = !!s.reviveDisponivel;
    revivesUsados = Number(s.revivesUsados || 0);
    updateHUD();
    if (!gameStarted) startGame();
    showToast('⤴️ Jogo carregado!');
  } catch (e) {
    console.error('Erro ao carregar:', e);
    showToast('Erro ao carregar');
  }
}

window.onload = () => {
  trocarTema();
  atualizarPreviewPersonagem();
  atualizarNomeMusica();
};
