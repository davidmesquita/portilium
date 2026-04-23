/* ── TERMINAL FAKE ── */
(function () {
  const term    = document.getElementById('terminal');
  const termBtn = document.getElementById('term-btn');
  const closeBtn = document.getElementById('term-close');
  const body    = document.getElementById('term-body');
  const input   = document.getElementById('term-input');
  let hackerActive = false;
  let hackerTimer = null;
  let hackerOverlay = null;
  let snakeActive = false;
  let snakeOverlay = null;
  let snakeLoop = null;
  let snakeState = null;
  let history   = [];
  let histIdx   = -1;

  function renderTerminalIntro() {
    body.innerHTML = `
      <div class="term-line term-info">Bem-vindo ao portfólio de <span class="term-hl">David Mesquita</span>. 👨‍💻</div>
      <div class="term-line term-muted">Digite <span class="term-hl">help</span> para ver os comandos disponíveis.</div>
    `;
  }

  const COMMANDS = {
    help: {
      desc: 'Lista todos os comandos',
      run() {
        const list = [
          ['help',      'Mostra esta lista'],
          ['about',     'Sobre mim'],
          ['skills',    'Navega para Skills'],
          ['exp',       'Navega para Experiência'],
          ['education', 'Navega para Formação'],
          ['contact',   'Navega para Contato'],
          ['github',    'Abre GitHub em nova aba'],
          ['linkedin',  'Abre LinkedIn em nova aba'],
          ['hacker',    'Ativa modo hacker de filme'],
          ['snake',     'Abre jogo da cobrinha'],
          ['dark',      'Ativa dark mode'],
          ['light',     'Ativa light mode'],
          ['whoami',    'Quem sou eu?'],
          ['clear',     'Limpa o terminal'],
          ['exit',      'Fecha o terminal'],
        ];
        return list.map(([cmd, d]) =>
          `<span class="term-hl">${cmd.padEnd(14, ' ')}</span><span class="term-muted">${d}</span>`
        ).join('\n');
      }
    },
    about: {
      desc: 'Sobre mim',
      run() {
        return `<span class="term-hl">David Mesquita</span>
Full-Stack Developer · Ruby on Rails &amp; React
3+ anos entregando soluções SaaS corporativas
Teresina, PI — Aberto a trabalho remoto`;
      }
    },
    whoami: {
      desc: 'Quem sou',
      run() {
        return `<span class="term-hl">david</span> — desenvolvedor, solucionador de problemas, fã de café ☕`;
      }
    },
    skills: {
      desc: 'Ir para Skills',
      run() {
        scrollToSection('#habilidades');
        return `<span class="term-ok">↓ Navegando para Skills...</span>`;
      }
    },
    exp: {
      desc: 'Ir para Experiência',
      run() {
        scrollToSection('#experiencia');
        return `<span class="term-ok">↓ Navegando para Experiência...</span>`;
      }
    },
    experience: {
      desc: 'Ir para Experiência',
      run() { return COMMANDS.exp.run(); }
    },
    education: {
      desc: 'Ir para Formação',
      run() {
        scrollToSection('#formacao');
        return `<span class="term-ok">↓ Navegando para Formação...</span>`;
      }
    },
    contact: {
      desc: 'Ir para Contato',
      run() {
        scrollToSection('#contato');
        return `<span class="term-ok">↓ Navegando para Contato...</span>
<span class="term-muted">──────────────────────────</span>
<span class="term-prompt-inline">email</span>      <span class="term-hl">devid.mesquita13@gmail.com</span>
<span class="term-prompt-inline">whatsapp</span>   <span class="term-hl">(86) 9 8106-4034</span>`;
      }
    },
    github: {
      desc: 'Abrir GitHub',
      run() {
        window.open('https://github.com/davidmesquita', '_blank', 'noopener');
        return `<span class="term-ok">→ Abrindo github.com/david-mesquita...</span>`;
      }
    },
    linkedin: {
      desc: 'Abrir LinkedIn',
      run() {
        window.open('https://www.linkedin.com/in/david-freitas-a39486201/', '_blank', 'noopener');
        return `<span class="term-ok">→ Abrindo linkedin.com/in/david-mesquita...</span>`;
      }
    },
    hacker: {
      desc: 'Modo hacker',
      run() {
        startHackerMode();
        return `<span class="term-ok">[easter egg] Modo hacker ativado. Pressione ESC para sair.</span>`;
      }
    },
    snake: {
      desc: 'Jogo da cobrinha',
      run() {
        startSnakeGame();
        return `<span class="term-ok">[easter egg] Snake iniciado. Use setas/WASD. ESC para sair.</span>`;
      }
    },
    cobrinha: {
      desc: 'Jogo da cobrinha',
      run() { return COMMANDS.snake.run(); }
    },
    dark: {
      desc: 'Dark mode',
      run() {
        const btn = document.getElementById('dm-toggle');
        document.body.classList.add('dark');
        btn.innerHTML = '<i class="bi bi-sun-fill"></i>';
        localStorage.setItem('dm', '1');
        return `<span class="term-ok">dark mode ativado 🌙</span>`;
      }
    },
    light: {
      desc: 'Light mode',
      run() {
        const btn = document.getElementById('dm-toggle');
        document.body.classList.remove('dark');
        btn.innerHTML = '<i class="bi bi-moon-fill"></i>';
        localStorage.setItem('dm', '0');
        return `<span class="term-ok">light mode ativado ☀️</span>`;
      }
    },
    clear: {
      desc: 'Limpar terminal',
      run() {
        renderTerminalIntro();
        return null;
      }
    },
    exit: {
      desc: 'Fechar terminal',
      run() { closeTerm(); return null; }
    },
  };

  function scrollToSection(sel) {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function print(cmd, output) {
    const cmdLine = document.createElement('div');
    cmdLine.className = 'term-line';
    cmdLine.innerHTML = `<span class="term-prompt-inline">$&nbsp;</span><span class="term-cmd">${escHtml(cmd)}</span>`;
    body.appendChild(cmdLine);
    if (output !== null && output !== undefined) {
      const out = document.createElement('div');
      out.className = 'term-line term-output';
      out.innerHTML = output;
      body.appendChild(out);
    }
    body.scrollTop = body.scrollHeight;
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function openTerm() {
    if (hackerActive || snakeActive) return;
    term.classList.remove('term-hidden');
    term.classList.add('term-open');
    termBtn.classList.add('term-btn-active');
    setTimeout(() => input.focus(), 80);
  }

  function closeTerm() {
    if (hackerActive || snakeActive) return;
    term.classList.remove('term-open');
    term.classList.add('term-hidden');
    termBtn.classList.remove('term-btn-active');
  }

  function startHackerMode() {
    if (snakeActive) stopSnakeGame();
    if (hackerActive) return;
    hackerActive = true;
    termBtn.classList.add('term-btn-active');

    hackerOverlay = document.createElement('div');
    hackerOverlay.id = 'hacker-overlay';
    hackerOverlay.innerHTML = `
      <div class="hacker-noise"></div>
      <div class="hacker-content">
        <div class="hacker-header">root@cinema:~# access granted</div>
        <pre class="hacker-screen" id="hacker-screen"></pre>
        <div class="hacker-footer">[esc] exit mode</div>
      </div>
    `;
    document.body.appendChild(hackerOverlay);
    document.body.classList.add('hacker-mode');

    playHackerTyping();
  }

  function stopHackerMode() {
    if (!hackerActive) return;
    hackerActive = false;
    if (hackerTimer) {
      clearTimeout(hackerTimer);
      hackerTimer = null;
    }
    if (hackerOverlay) {
      hackerOverlay.remove();
      hackerOverlay = null;
    }
    document.body.classList.remove('hacker-mode');
    termBtn.classList.remove('term-btn-active');
  }

  function playHackerTyping() {
    const screen = document.getElementById('hacker-screen');
    if (!screen) return;
    const script = [
      'Initializing secure channel...',
      'Bypassing firewall layers...',
      'Injecting payload...',
      'Executing command: echo hello world',
      'hello world',
      '',
      'Done. Nothing illegal, just vibes.'
    ].join('\n');

    let idx = 0;
    const tick = () => {
      if (!hackerActive || !screen) return;
      if (idx < script.length) {
        screen.textContent += script[idx];
        idx += 1;
        screen.scrollTop = screen.scrollHeight;
        const char = script[idx - 1];
        const delay = char === '\n' ? 180 : Math.floor(Math.random() * 35) + 18;
        hackerTimer = setTimeout(tick, delay);
      }
    };
    tick();
  }

  function startSnakeGame() {
    if (hackerActive) stopHackerMode();
    if (snakeActive) return;
    snakeActive = true;
    termBtn.classList.add('term-btn-active');

    snakeOverlay = document.createElement('div');
    snakeOverlay.id = 'snake-overlay';
    snakeOverlay.innerHTML = `
      <div class="snake-wrap">
        <div class="snake-head">
          <span>SNAKE.EXE</span>
          <span class="snake-score" id="snake-score">score: 0</span>
        </div>
        <canvas id="snake-canvas" width="360" height="360" aria-label="Jogo da cobrinha"></canvas>
        <div class="snake-help">setas / WASD · ENTER reinicia · ESC sai</div>
        <div class="snake-touch" aria-hidden="true">
          <button class="snake-key" data-dir="up">↑</button>
          <button class="snake-key" data-dir="left">←</button>
          <button class="snake-key" data-dir="down">↓</button>
          <button class="snake-key" data-dir="right">→</button>
        </div>
      </div>
    `;
    document.body.appendChild(snakeOverlay);
    document.body.classList.add('snake-mode');

    initSnakeState();
    bindSnakeTouch();
    renderSnake();
    snakeLoop = setInterval(stepSnake, 105);
  }

  function stopSnakeGame() {
    if (!snakeActive) return;
    snakeActive = false;
    if (snakeLoop) {
      clearInterval(snakeLoop);
      snakeLoop = null;
    }
    if (snakeOverlay) {
      snakeOverlay.remove();
      snakeOverlay = null;
    }
    snakeState = null;
    document.body.classList.remove('snake-mode');
    termBtn.classList.remove('term-btn-active');
  }

  function initSnakeState() {
    snakeState = {
      size: 18,
      snake: [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 13, y: 11 },
      score: 0,
      over: false,
    };
    spawnFood();
    updateSnakeScore();
  }

  function spawnFood() {
    if (!snakeState) return;
    const { size, snake } = snakeState;
    let x = 0;
    let y = 0;
    let valid = false;
    while (!valid) {
      x = Math.floor(Math.random() * size);
      y = Math.floor(Math.random() * size);
      valid = !snake.some(seg => seg.x === x && seg.y === y);
    }
    snakeState.food = { x, y };
  }

  function setSnakeDirection(dir) {
    if (!snakeState || snakeState.over) return;
    const { x, y } = dir;
    const current = snakeState.dir;
    if (x === -current.x && y === -current.y) return;
    snakeState.nextDir = { x, y };
  }

  function stepSnake() {
    if (!snakeState || snakeState.over) return;
    const st = snakeState;
    st.dir = st.nextDir;
    const head = st.snake[0];
    const next = { x: head.x + st.dir.x, y: head.y + st.dir.y };

    if (next.x < 0 || next.y < 0 || next.x >= st.size || next.y >= st.size) {
      st.over = true;
      renderSnake();
      return;
    }
    if (st.snake.some(seg => seg.x === next.x && seg.y === next.y)) {
      st.over = true;
      renderSnake();
      return;
    }

    st.snake.unshift(next);
    if (next.x === st.food.x && next.y === st.food.y) {
      st.score += 10;
      updateSnakeScore();
      spawnFood();
    } else {
      st.snake.pop();
    }
    renderSnake();
  }

  function renderSnake() {
    if (!snakeState) return;
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const cssSize = Math.min(window.innerWidth * 0.88, 420);
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;
    const px = Math.floor(cssSize * dpr);
    if (canvas.width !== px || canvas.height !== px) {
      canvas.width = px;
      canvas.height = px;
    }

    const cell = canvas.width / snakeState.size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#020A08';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(34,211,238,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < snakeState.size; i += 1) {
      const p = i * cell;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(canvas.width, p);
      ctx.stroke();
    }

    ctx.fillStyle = '#22D3EE';
    snakeState.snake.forEach((seg, idx) => {
      const pad = idx === 0 ? 2 : 3;
      ctx.fillRect(seg.x * cell + pad, seg.y * cell + pad, cell - pad * 2, cell - pad * 2);
    });

    ctx.fillStyle = '#3DCF8E';
    const foodPad = 4;
    ctx.fillRect(
      snakeState.food.x * cell + foodPad,
      snakeState.food.y * cell + foodPad,
      cell - foodPad * 2,
      cell - foodPad * 2
    );

    if (snakeState.over) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#F85149';
      ctx.textAlign = 'center';
      ctx.font = `${Math.floor(cell * 1.05)}px JetBrains Mono`;
      ctx.fillText('game over', canvas.width / 2, canvas.height / 2 - cell * 0.25);
      ctx.fillStyle = '#C9D1D9';
      ctx.font = `${Math.floor(cell * 0.6)}px JetBrains Mono`;
      ctx.fillText('pressione ENTER para reiniciar', canvas.width / 2, canvas.height / 2 + cell * 0.9);
    }
  }

  function bindSnakeTouch() {
    if (!snakeOverlay) return;
    snakeOverlay.querySelectorAll('.snake-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-dir');
        if (dir === 'up') setSnakeDirection({ x: 0, y: -1 });
        if (dir === 'down') setSnakeDirection({ x: 0, y: 1 });
        if (dir === 'left') setSnakeDirection({ x: -1, y: 0 });
        if (dir === 'right') setSnakeDirection({ x: 1, y: 0 });
      });
    });
  }

  function updateSnakeScore() {
    const scoreEl = document.getElementById('snake-score');
    if (scoreEl && snakeState) scoreEl.textContent = `score: ${snakeState.score}`;
  }

  termBtn.onclick  = () => term.classList.contains('term-hidden') ? openTerm() : closeTerm();
  closeBtn.onclick = closeTerm;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const raw = input.value.trim();
      input.value = '';
      histIdx = -1;
      if (!raw) return;
      history.unshift(raw);
      if (history.length > 50) history.pop();
      const cmd = raw.toLowerCase();
      if (COMMANDS[cmd]) {
        const out = COMMANDS[cmd].run();
        print(raw, out);
      } else {
        print(raw, `<span class="term-err">Comando não encontrado: <b>${escHtml(raw)}</b>. Digite <span class="term-hl">help</span> para ajuda.</span>`);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      else { histIdx = -1; input.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.toLowerCase();
      const match = Object.keys(COMMANDS).find(k => k.startsWith(partial) && k !== partial);
      if (match) input.value = match;
    }
  });

  document.addEventListener('keydown', e => {
    if (snakeActive) {
      const k = e.key.toLowerCase();
      if (e.key === 'Escape') {
        stopSnakeGame();
        return;
      }
      if (e.key === 'Enter' && snakeState && snakeState.over) {
        initSnakeState();
        renderSnake();
        return;
      }
      if (k === 'arrowup' || k === 'w') { e.preventDefault(); setSnakeDirection({ x: 0, y: -1 }); return; }
      if (k === 'arrowdown' || k === 's') { e.preventDefault(); setSnakeDirection({ x: 0, y: 1 }); return; }
      if (k === 'arrowleft' || k === 'a') { e.preventDefault(); setSnakeDirection({ x: -1, y: 0 }); return; }
      if (k === 'arrowright' || k === 'd') { e.preventDefault(); setSnakeDirection({ x: 1, y: 0 }); return; }
      return;
    }
    if (e.key === 'Escape' && hackerActive) {
      stopHackerMode();
      return;
    }
    if (e.key === 'Escape' && !term.classList.contains('term-hidden')) closeTerm();
  });
}());
