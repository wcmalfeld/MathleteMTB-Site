// ============================================================
// Teacher Curriculum: text with math in it.
//
// Lesson text is plain strings with two kinds of markup:
//   **bold**        for emphasis
//   $ ... $         math, written in a small LaTeX-like notation:
//       \frac{a}{b}  fraction          x^2, x^{n+1}   powers
//       \sqrt{x}     square root       x_1, y_{2}     subscripts
//       \overline{AB} segment          \text{rise}    upright words
//       \sin \cos \tan \log \ln        function names (upright)
//       \pm \times \div \cdot \le \ge \ne \approx \to \infty \deg
//       \angle \triangle \cong \sim \parallel \perp \circ \Rightarrow
//       \theta \alpha \beta \pi \Delta \lambda \mu \sigma \omega \phi
//       \,  thin space    \{ \}  braces    \_  a blank to fill in    - is shown as a minus sign
//   \$  a dollar sign in ordinary text (prices)
//
// parseRich() and parseMath() are pure (no DOM), so Node checks every
// lesson's text at build time (scripts/build-teacher-curriculum.mjs) and a
// typo fails the build instead of showing up in class. richNodes() turns
// the result into DOM nodes in the browser. Never innerHTML.
// ============================================================

const SYMBOLS = {
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '·', le: '≤', ge: '≥', ne: '≠', approx: '≈', to: '→',
  infty: '∞', deg: '°', angle: '∠', triangle: '△', cong: '≅', sim: '∼', parallel: '∥', perp: '⊥', circ: '∘',
  Rightarrow: '⇒', leftrightarrow: '↔', rightarrow: '→', leftarrow: '←', implies: '⇒',  cup: '∪', cap: '∩', leq: '≤', geq: '≥', neq: '≠', therefore: '∴', mid: '|', emptyset: '∅', propto: '∝', checkmark: '✓',  quad: '\u2003', qquad: '\u2003\u2003', Leftrightarrow: '⇔', in: '∈', ldots: '…', cdots: '⋯', prime: '′',
  theta: 'θ', alpha: 'α', beta: 'β', gamma: 'γ', pi: 'π', Delta: 'Δ', delta: 'δ', lambda: 'λ', mu: 'μ',
  sigma: 'σ', Sigma: 'Σ', omega: 'ω', phi: 'φ', rho: 'ρ', tau: 'τ',
  ';': '\u2005', ':': '\u2005', '!': '',
  ',': ' ', ' ': ' ', '{': '{', '}': '}', '%': '%', '$': '$', '|': '‖', '_': '_'
};
const FUNCS = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'log', 'ln', 'det', 'max', 'min', 'arcsin', 'arccos', 'arctan', 'lim'];
const OPS = { '-': '−', '+': '+', '=': '=', '<': '<', '>': '>', '/': '/', '*': '×' };

// ---------- parsing ----------
export function parseMath(src) {
  let i = 0;
  const s = String(src);
  const fail = msg => { throw new Error(`math "${s}": ${msg}`); };

  function group() {
    // A {braced} group, or a single character/command for ^ and _.
    if (s[i] === '{') { i++; const out = seq('}'); if (s[i] !== '}') fail('missing }'); i++; return out; }
    if (s[i] === '\\') return [command()];
    if (i >= s.length) fail('nothing after ^ or _');
    return [atom(s[i++])];
  }
  function atom(ch) {
    if (/[A-Za-z]/.test(ch)) return { t: 'v', s: ch };
    if (/[0-9.]/.test(ch)) return { t: 'n', s: ch };
    if (OPS[ch]) return { t: 'o', s: OPS[ch] };
    return { t: 'x', s: ch };
  }
  function command() {
    i++; // the backslash
    if (i >= s.length) fail('lone backslash');
    if (!/[A-Za-z]/.test(s[i])) { const c = s[i++]; if (!(c in SYMBOLS)) fail('unknown \\' + c); return { t: 'x', s: SYMBOLS[c] }; }
    let name = '';
    while (i < s.length && /[A-Za-z]/.test(s[i])) name += s[i++];
    if (name === 'frac') return { t: 'frac', n: group(), d: group() };
    if (name === 'sqrt') return { t: 'sqrt', c: group() };
    if (name === 'overline') return { t: 'over', c: group() };
    if (name === 'overrightarrow' || name === 'vec') return { t: 'arrow', c: group() };
    if (name === 'text') {
      if (s[i] !== '{') fail('\\text needs {…}');
      const end = s.indexOf('}', i);
      if (end < 0) fail('missing } after \\text');
      const txt = s.slice(i + 1, end); i = end + 1;
      return { t: 'w', s: txt };
    }
    if (FUNCS.includes(name)) return { t: 'f', s: name };
    if (name in SYMBOLS) return { t: SYMBOLS[name].match(/[α-ωΑ-Ω]/) ? 'v' : 'x', s: SYMBOLS[name] };
    fail('unknown command \\' + name);
  }
  function seq(stop) {
    const out = [];
    while (i < s.length && s[i] !== stop) {
      const ch = s[i];
      if (ch === '}') fail('unexpected }');
      if (ch === '\\') { out.push(command()); continue; }
      if (ch === '^' || ch === '_') {
        i++;
        if (!out.length) fail(ch + ' needs something before it');
        out.push({ t: ch === '^' ? 'sup' : 'sub', c: group() });
        continue;
      }
      if (ch === '{') { i++; const inner = seq('}'); if (s[i] !== '}') fail('missing }'); i++; out.push({ t: 'grp', c: inner }); continue; }
      i++;
      if (ch === ' ') { out.push({ t: 'sp' }); continue; }
      if (ch === '-') {
        // A minus sign with nothing to subtract from is a negative sign: no spacing.
        const prev = [...out].reverse().find(n => n.t !== 'sp');
        if (!prev || prev.t === 'o' || (prev.t === 'x' && /^[(\[,=:≤≥<>±]$/.test(prev.s))) { out.push({ t: 'x', s: '−' }); continue; }
      }
      out.push(atom(ch));
    }
    return out;
  }
  const out = seq(null);
  if (i < s.length) fail('unbalanced braces');
  return out;
}

// Splits text into [{t:'text'|'bold'|'math', s, ast?}]. Throws on bad markup.
export function parseRich(src) {
  const s = String(src == null ? '' : src);
  const out = [];
  let buf = '', i = 0, bold = false;
  const flush = () => { if (buf) out.push({ t: bold ? 'bold' : 'text', s: buf }); buf = ''; };
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '$') { buf += '$'; i += 2; continue; }
    if (ch === '*' && s[i + 1] === '*') { flush(); bold = !bold; i += 2; continue; }
    if (ch === '$') {
      let j = i + 1;
      while (j < s.length && !(s[j] === '$' && s[j - 1] !== '\\')) j++;
      if (j >= s.length) throw new Error(`text "${s.slice(0, 60)}…": a $ isn't closed (write \\$ for a dollar sign)`);
      flush();
      const m = s.slice(i + 1, j);
      out.push({ t: 'math', s: m, ast: parseMath(m), bold });
      i = j + 1;
      continue;
    }
    buf += ch; i++;
  }
  if (bold) throw new Error(`text "${s.slice(0, 60)}…": ** isn't closed`);
  flush();
  return out;
}

// Plain-text version (for titles, alt text, search and the page <title>).
export function plainText(src) {
  return parseRich(src).map(p => p.t === 'math' ? flat(p.ast) : p.s).join('');
}
function flat(nodes) {
  return nodes.map(n => {
    switch (n.t) {
      case 'frac': return '(' + flat(n.n) + ')/(' + flat(n.d) + ')';
      case 'sqrt': return '√(' + flat(n.c) + ')';
      case 'sup': return '^' + (n.c.length > 1 ? '(' + flat(n.c) + ')' : flat(n.c));
      case 'sub': return flat(n.c);
      case 'over': case 'arrow': case 'grp': return flat(n.c);
      case 'sp': return ' ';
      default: return n.s;
    }
  }).join('');
}

// ---------- DOM (browser only) ----------
function mk(tag, cls, kids) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  (kids || []).forEach(k => e.append(k));
  return e;
}
function mathDom(nodes) {
  return nodes.map(n => {
    switch (n.t) {
      case 'v': return mk('i', 'm-v', [n.s]);
      case 'n': return mk('span', 'm-n', [n.s]);
      case 'o': return mk('span', 'm-o', [n.s]);
      case 'f': return mk('span', 'm-f', [n.s]);
      case 'w': return mk('span', 'm-w', [n.s]);
      case 'sp': return document.createTextNode(' ');
      case 'grp': return mk('span', 'm-g', mathDom(n.c));
      case 'sup': return mk('sup', 'm-sup', mathDom(n.c));
      case 'sub': return mk('sub', 'm-sub', mathDom(n.c));
      case 'over': return mk('span', 'm-over', mathDom(n.c));
      case 'arrow': return mk('span', 'm-arrow', mathDom(n.c));
      case 'sqrt': return mk('span', 'm-sqrt', [mk('span', 'm-rad', ['√']), mk('span', 'm-rad-in', mathDom(n.c))]);
      case 'frac': return mk('span', 'm-frac', [mk('span', 'm-num', mathDom(n.n)), mk('span', 'm-den', mathDom(n.d))]);
      default: return mk('span', 'm-x', [n.s]);
    }
  });
}
// One math expression as an element (screen readers get the plain form).
export function mathNode(src, display) {
  const ast = parseMath(src);
  const box = mk('span', display ? 'm m--display' : 'm');
  box.setAttribute('role', 'math');
  box.setAttribute('aria-label', flat(ast));
  mathDom(ast).forEach(k => box.append(k));
  return box;
}
// Rich text as an array of nodes, to append into any element.
export function richNodes(src) {
  return parseRich(src).map(p => {
    if (p.t === 'text') return document.createTextNode(p.s);
    if (p.t === 'bold') return mk('strong', '', [p.s]);
    const m = mathNode(p.s);
    return p.bold ? mk('strong', '', [m]) : m;
  });
}
