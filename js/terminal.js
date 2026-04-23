/* ── TERMINAL FAKE ── */
(function () {
  const term    = document.getElementById('terminal');
  const termBtn = document.getElementById('term-btn');
  const closeBtn = document.getElementById('term-close');
  const body    = document.getElementById('term-body');
  const input   = document.getElementById('term-input');
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
    term.classList.remove('term-hidden');
    term.classList.add('term-open');
    termBtn.classList.add('term-btn-active');
    setTimeout(() => input.focus(), 80);
  }

  function closeTerm() {
    term.classList.remove('term-open');
    term.classList.add('term-hidden');
    termBtn.classList.remove('term-btn-active');
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
    if (e.key === 'Escape' && !term.classList.contains('term-hidden')) closeTerm();
  });
}());
