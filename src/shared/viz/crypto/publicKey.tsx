/** Groups, RSA and Diffie–Hellman / discrete logarithm labs (toy sizes). */
import { useMemo, useState } from 'react';
import { KV, Seg, Slider, VizFrame } from '../kit';
import { cayley, cycle, generators, generatorTest, order, zn, type GroupKind } from '../../math/crypto/groups';
import { crt, egcd, factor, gcd, iroot, isPrimeN, modInv, modPow, modPowSteps, phi, primesBetween } from '../../math/crypto/numberTheory';

// ------------------------------------------------------------------ groups

export function GroupExplorer({ kind: k0 = 'mul', n: n0 = 9 }: Record<string, unknown>) {
  const [kind, setKind] = useState<GroupKind>(k0 === 'add' ? 'add' : 'mul');
  const [n, setN] = useState(Number(n0) || 9);
  const G = useMemo(() => zn(kind, n), [kind, n]);
  const [gSel, setG] = useState(2);
  const g = G.elements.includes(gSel) ? gSel : G.elements[Math.min(1, G.elements.length - 1)];
  const cyc = cycle(G, g);
  const gens = generators(G);
  const m = G.elements.length;
  const add = kind === 'add';
  const pow = (k: number) => (add ? `${k}·${g}` : `${g}^${k}`);
  const R = 92;
  const pos = (i: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / m;
    return [130 + R * Math.cos(a), 115 + R * Math.sin(a)];
  };
  const idx = new Map(G.elements.map((e, i) => [e, i]));
  const table = m <= 16 ? cayley(G) : null;
  return (
    <VizFrame title={`The group ${add ? `(ℤ${n}, +)` : `(ℤ${n}^×, ·)`}`} caption="Order of g = size of the subgroup ⟨g⟩ it generates. By Lagrange it divides |G|, hence g^|G| = e and exponents can be reduced modulo |G| (or modulo the order of g). A generator has order |G|; a cyclic group of order m has φ(m) generators.">
      <div className="viz-controls">
        <Seg value={kind} onChange={setKind} options={[{ v: 'mul', label: 'ℤₙ^× (multiplicative)' }, { v: 'add', label: 'ℤₙ (additive)' }]} />
        <Slider label="n" value={n} min={2} max={40} step={1} onChange={setN} />
        <label className="field">
          element g
          <select value={g} onChange={(e) => setG(+e.target.value)}>
            {G.elements.map((x) => (
              <option key={x} value={x}>
                {x} (order {order(G, x)})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="row" style={{ gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 260 230" width={260}>
          {cyc.map((x, i) => {
            const [x1, y1] = pos(idx.get(x)!);
            const [x2, y2] = pos(idx.get(cyc[(i + 1) % cyc.length])!);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c2)" strokeWidth={2} opacity={0.8} />;
          })}
          {G.elements.map((x, i) => {
            const [cx, cy] = pos(i);
            const inSub = cyc.includes(x);
            return (
              <g key={x} onClick={() => setG(x)} style={{ cursor: 'pointer' }}>
                <circle cx={cx} cy={cy} r={11} fill={x === g ? 'var(--c2)' : inSub ? 'color-mix(in srgb, var(--c2) 30%, transparent)' : gens.includes(x) ? 'color-mix(in srgb, var(--c3) 30%, transparent)' : 'var(--bg-sunk)'} stroke="var(--border-strong)" />
                <text x={cx} y={cy + 4} fontSize={10} textAnchor="middle">
                  {x}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          <KV
            items={[
              { k: '|G|', v: add ? n : `φ(${n}) = ${m}` },
              { k: `order of ${g}`, v: cyc.length },
              { k: 'divides |G|?', v: m % cyc.length === 0 ? 'yes (Lagrange)' : 'no?!' },
              { k: 'generators', v: gens.length ? gens.join(', ') : 'none: not cyclic' },
              { k: 'φ(|G|)', v: phi(m) },
            ]}
          />
          <div className="small">
            ⟨{g}⟩ = {'{'}
            {cyc.map((x, i) => (
              <span key={i} title={pow(i)}>
                {i ? ', ' : ''}
                {x}
              </span>
            ))}
            {'}'} <span className="muted">({cyc.map((_, i) => pow(i)).slice(0, 4).join(', ')}, …)</span>
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            Generator test for g = {g} (|G| = {m} = {factor(m).map(([p, e]) => (e > 1 ? `${p}^${e}` : p)).join('·') || '1'}):{' '}
            {generatorTest(G, g).map((t) => (
              <span key={t.p} className="mono">
                {add ? `(${m}/${t.p})·g` : `g^(${m}/${t.p})`} = {t.value}
                {t.value === G.identity ? ' = e ✗' : ' ≠ e ✓'};{' '}
              </span>
            ))}
          </div>
        </div>
      </div>
      {table && (
        <div className="scroll-x" style={{ marginTop: 8 }}>
          <table className="cipher-table">
            <thead>
              <tr>
                <th>{G.symbol}</th>
                {G.elements.map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i}>
                  <th>{G.elements[i]}</th>
                  {row.map((v, j) => (
                    <td key={j} className={v === G.identity ? 'sel' : ''}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="small muted">Cayley table: every row and column is a permutation of G. Highlighted cells are the neutral element e — each row has exactly one, so every element has a unique inverse.</div>
        </div>
      )}
    </VizFrame>
  );
}

// ------------------------------------------------------------------ RSA

const SMALL_PRIMES = primesBetween(11, 400);

export function RsaLab({ tab: t0 = 'basic' }: Record<string, unknown>) {
  const [tab, setTab] = useState<'basic' | 'attacks'>(t0 === 'attacks' ? 'attacks' : 'basic');
  return (
    <VizFrame title="RSA with small numbers" caption="Key generation: N = pq, φ(N) = (p−1)(q−1), e coprime to φ(N), d = e⁻¹ mod φ(N). Correctness: ed = 1 + kφ(N) and m^φ(N) = 1 in ℤ_N^× (Euler), so (m^e)^d = m·(m^φ(N))^k = m.">
      <Seg value={tab} onChange={setTab} options={[{ v: 'basic', label: 'Keygen, encrypt, decrypt' }, { v: 'attacks', label: 'Attacks on textbook RSA' }]} />
      <div style={{ marginTop: 10 }}>{tab === 'basic' ? <RsaBasic /> : <RsaAttacks />}</div>
    </VizFrame>
  );
}

function RsaBasic() {
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [e, setE] = useState(17);
  const [m, setM] = useState(65);
  const N = BigInt(p * q);
  const ph = BigInt((p - 1) * (q - 1));
  const g = gcd(BigInt(e), ph);
  const eg = egcd(ph, BigInt(e));
  const d = g === 1n ? modInv(BigInt(e), ph)! : null;
  const mm = BigInt(Math.min(m, p * q - 1));
  const enc = modPowSteps(mm, BigInt(e), N);
  const dec = d ? modPow(enc.result, d, N) : null;
  return (
    <>
      <div className="viz-controls">
        <label className="field">
          p
          <select value={p} onChange={(ev) => setP(+ev.target.value)}>
            {SMALL_PRIMES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          q
          <select value={q} onChange={(ev) => setQ(+ev.target.value)}>
            {SMALL_PRIMES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          e
          <input type="number" value={e} min={3} onChange={(ev) => setE(Math.max(3, +ev.target.value))} />
        </label>
        <Slider label="message m" value={Math.min(m, p * q - 1)} min={0} max={p * q - 1} step={1} onChange={setM} />
      </div>
      {p === q && <div className="callout warn small">p = q gives N = p², and φ(N) = p(p − 1), not (p − 1)²: pick two different primes.</div>}
      <KV
        items={[
          { k: 'N = p·q', v: String(N) },
          { k: 'φ(N) = (p−1)(q−1)', v: String(ph) },
          { k: 'gcd(e, φ(N))', v: <span style={{ color: g === 1n ? undefined : 'var(--bad)' }}>{String(g)}</span> },
          { k: 'd = e⁻¹ mod φ(N)', v: d === null ? 'does not exist' : String(d) },
        ]}
      />
      {g === 1n && (
        <details className="collapse">
          <summary>Extended Euclid for d (rows rᵢ = sᵢ·φ(N) + tᵢ·e)</summary>
          <div className="collapse-body scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th>q</th>
                  <th>r</th>
                  <th>s</th>
                  <th>t</th>
                </tr>
              </thead>
              <tbody>
                {eg.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.q === null ? '' : String(r.q)}</td>
                    <td>{String(r.r)}</td>
                    <td>{String(r.s)}</td>
                    <td>{String(r.t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="small muted">The row with r = 1 gives 1 = s·φ(N) + t·e, so d ≡ t (mod φ(N)) = {String(d)}.</div>
          </div>
        </details>
      )}
      <div className="small" style={{ marginTop: 8 }}>
        <b>Encrypt</b> c = m^e mod N by square-and-multiply on the bits of e = {e.toString(2)}₂:
      </div>
      <div className="row" style={{ gap: 4, flexWrap: 'wrap', margin: '4px 0' }}>
        {enc.steps.map((s, i) => (
          <span key={i} className="chip" title={s.bit ? 'square, then multiply by m' : 'square'}>
            {s.bit ? 'S·M' : 'S'} → {String(s.acc)}
          </span>
        ))}
      </div>
      <KV
        items={[
          { k: 'c = m^e mod N', v: String(enc.result) },
          { k: 'c^d mod N', v: dec === null ? '—' : String(dec) },
          { k: 'correct?', v: dec === mm ? '✓' : '✗' },
        ]}
      />
    </>
  );
}

const big3 = [1009n * 1013n, 1019n * 1021n, 1031n * 1033n];

function RsaAttacks() {
  const [m, setM] = useState(123456);
  const [x, setX] = useState(2);
  const e = 3n;
  const M = BigInt(m);
  const cs = big3.map((N) => modPow(M, e, N));
  const sol = crt(cs, big3)!;
  const root = iroot(sol.x, 3);
  // shared prime
  const P = 1051n;
  const N1 = P * 1061n;
  const N2 = P * 1063n;
  const shared = gcd(N1, N2);
  // malleability with a toy key
  const N = 61n * 53n;
  const ee = 17n;
  const d = modInv(ee, 60n * 52n)!;
  const mm = 65n;
  const c = modPow(mm, ee, N);
  const c2 = (c * modPow(BigInt(x), ee, N)) % N;
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="card tight">
        <b>1 · Same message to three receivers with e = 3 (CRT attack)</b>
        <Slider label="message m" value={m} min={2} max={1_000_000} step={1} onChange={setM} />
        <div className="small mono">
          {cs.map((c, i) => (
            <div key={i}>
              c{i + 1} = m³ mod {String(big3[i])} = {String(c)}
            </div>
          ))}
        </div>
        <div className="small">
          CRT gives x ≡ cᵢ (mod Nᵢ), x &lt; N₁N₂N₃. Since m &lt; Nᵢ, also m³ &lt; N₁N₂N₃, so x = m³ exactly (no reduction!) and an ordinary cube root returns m: ∛{String(sol.x)} = <b>{String(root)}</b> {root === M ? '✓' : ''}.
        </div>
      </div>
      <div className="card tight">
        <b>2 · Bad randomness: two moduli share a prime</b>
        <div className="small mono">
          N₁ = {String(N1)}, N₂ = {String(N2)} → gcd(N₁, N₂) = {String(shared)} → N₁ = {String(shared)}·{String(N1 / shared)}, N₂ = {String(shared)}·{String(N2 / shared)}
        </div>
        <div className="small">Euclid’s algorithm is fast even for 2048-bit numbers; a 2012 scan factored about 0.3 % of public RSA keys this way.</div>
      </div>
      <div className="card tight">
        <b>3 · Textbook RSA is malleable (and deterministic)</b>
        <Slider label="attacker multiplies by x^e, x =" value={x} min={2} max={9} step={1} onChange={setX} />
        <div className="small mono">
          c = {String(mm)}^17 mod 3233 = {String(c)}; c′ = c·{x}^17 mod N = {String(c2)}; D(c′) = {String(modPow(c2, d, N))} = {x}·{String(mm)} mod N
        </div>
        <div className="small">
          (m₁m₂)^e = m₁^e·m₂^e, so ciphertexts can be combined. Deterministic encryption is not even semantically secure (encrypt both candidate messages and compare). Hence real RSA encryption pads with randomness (PKCS#1 v1.5, OAEP) or
          is used only to transport a random symmetric key (hybrid encryption).
        </div>
      </div>
      <div className="card tight">
        <b>4 · Small message, no padding</b>
        <div className="small">
          If m^e &lt; N the modulus never wraps around: e.g. m = 42, e = 3, N = {String(big3[0])}: c = {String(42n ** 3n)} and ∛c = {String(iroot(42n ** 3n, 3))}.
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Diffie–Hellman & discrete log

const DH_PRIMES = primesBetween(23, 2000).filter((p) => p > 100);

function primitiveRoot(p: number): number {
  const fs = factor(p - 1).map(([q]) => q);
  for (let g = 2; g < p; g++) if (fs.every((q) => modPow(BigInt(g), BigInt((p - 1) / q), BigInt(p)) !== 1n)) return g;
  return 2;
}

export function DhLab({ tab: t0 = 'dh' }: Record<string, unknown>) {
  const [tab, setTab] = useState<'dh' | 'dlog'>(t0 === 'dlog' ? 'dlog' : 'dh');
  return (
    <VizFrame title="Diffie–Hellman and the discrete logarithm" caption="Security rests on the discrete-log problem in a cyclic group: given b and b^k, find k. Its difficulty depends on the size of the group and on the largest prime factor of its order.">
      <Seg value={tab} onChange={setTab} options={[{ v: 'dh', label: 'Key exchange & MITM' }, { v: 'dlog', label: 'Computing discrete logs' }]} />
      <div style={{ marginTop: 10 }}>{tab === 'dh' ? <DhExchange /> : <DlogSolvers />}</div>
    </VizFrame>
  );
}

function DhExchange() {
  const [p, setP] = useState(467);
  const g = primitiveRoot(p);
  const [a, setA] = useState(153);
  const [b, setB] = useState(197);
  const [mitm, setMitm] = useState(false);
  const [mu, setMu] = useState(77);
  const P = BigInt(p);
  const G = BigInt(g);
  const A = modPow(G, BigInt(a), P);
  const B = modPow(G, BigInt(b), P);
  const Mv = modPow(G, BigInt(mu), P);
  const kA = modPow(mitm ? Mv : B, BigInt(a), P);
  const kB = modPow(mitm ? Mv : A, BigInt(b), P);
  return (
    <>
      <div className="viz-controls">
        <label className="field">
          prime p (group ℤₚ^×)
          <select value={p} onChange={(e) => setP(+e.target.value)}>
            {DH_PRIMES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <Slider label="Alice’s secret α" value={Math.min(a, p - 2)} min={1} max={p - 2} step={1} onChange={setA} />
        <Slider label="Bob’s secret β" value={Math.min(b, p - 2)} min={1} max={p - 2} step={1} onChange={setB} />
        <label className="row small" style={{ gap: 6 }}>
          <input type="checkbox" checked={mitm} onChange={(e) => setMitm(e.target.checked)} /> active man in the middle (Mallory)
        </label>
        {mitm && <Slider label="Mallory’s secret μ" value={Math.min(mu, p - 2)} min={1} max={p - 2} step={1} onChange={setMu} />}
      </div>
      <div className="grid cols-3" style={{ gap: 8 }}>
        <div className="card tight">
          <b>Alice</b>
          <div className="small mono">sends b^α = {g}^{a} = {String(A)}</div>
          <div className="small mono">receives {String(mitm ? Mv : B)}</div>
          <div className="small mono">key = {String(mitm ? Mv : B)}^{a} = <b>{String(kA)}</b></div>
        </div>
        <div className="card tight" style={{ borderColor: mitm ? 'var(--bad)' : undefined }}>
          <b>{mitm ? 'Mallory (active)' : 'Eve (passive)'}</b>
          <div className="small mono">sees p = {p}, b = {g}, {String(A)}, {String(B)}</div>
          {mitm ? (
            <div className="small mono">
              key with Alice = {String(A)}^{mu} = {String(modPow(A, BigInt(mu), P))}
              <br />
              key with Bob = {String(B)}^{mu} = {String(modPow(B, BigInt(mu), P))}
            </div>
          ) : (
            <div className="small">needs α or β (a discrete log) to compute the key</div>
          )}
        </div>
        <div className="card tight">
          <b>Bob</b>
          <div className="small mono">sends b^β = {g}^{b} = {String(B)}</div>
          <div className="small mono">receives {String(mitm ? Mv : A)}</div>
          <div className="small mono">key = {String(mitm ? Mv : A)}^{b} = <b>{String(kB)}</b></div>
        </div>
      </div>
      <p className="small">
        {mitm
          ? 'Mallory replaces both public values by b^μ. Alice and Bob each share a key with Mallory, who decrypts, reads and re-encrypts everything. Unauthenticated DH is only secure against passive eavesdroppers; in practice the exchanged values are signed (e.g. the station-to-station protocol, TLS).'
          : `Both obtain b^(αβ) = ${String(kA)} because (b^α)^β = (b^β)^α. b = ${g} is a generator of ℤₚ^× (order p − 1 = ${p - 1} = ${factor(p - 1).map(([q, e]) => (e > 1 ? `${q}^${e}` : q)).join('·')}).`}
      </p>
    </>
  );
}

function DlogSolvers() {
  const [p, setP] = useState(1009);
  const g = primitiveRoot(p);
  const [x, setX] = useState(777);
  const P = BigInt(p);
  const G = BigInt(g);
  const n = p - 1;
  const xx = Math.min(x, n - 1);
  const y = modPow(G, BigInt(xx), P);
  // BSGS
  const m = Math.ceil(Math.sqrt(n));
  const baby = new Map<bigint, number>();
  for (let j = 0; j < m; j++) baby.set(modPow(G, BigInt(j), P), j);
  const ginvm = modPow(modInv(G, P)!, BigInt(m), P);
  let gamma = y;
  let found = -1;
  let giant = 0;
  for (let i = 0; i < m; i++) {
    giant++;
    if (baby.has(gamma)) {
      found = i * m + baby.get(gamma)!;
      break;
    }
    gamma = (gamma * ginvm) % P;
  }
  return (
    <>
      <div className="viz-controls">
        <label className="field">
          prime p
          <select value={p} onChange={(e) => setP(+e.target.value)}>
            {DH_PRIMES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <Slider label="secret exponent x" value={xx} min={1} max={n - 1} step={1} onChange={setX} />
      </div>
      <KV
        items={[
          { k: 'group order p − 1', v: `${n} = ${factor(n).map(([q, e]) => (e > 1 ? `${q}^${e}` : q)).join('·')}` },
          { k: `y = ${g}^x mod p`, v: String(y) },
          { k: 'brute force', v: `${xx} multiplications` },
          { k: 'baby-step giant-step', v: `${m} baby + ${giant} giant steps → x = ${found}` },
        ]}
      />
      <p className="small">
        <b>Baby-step giant-step</b> writes x = i·m + j with m = ⌈√n⌉: store all b^j (baby steps), then compare y·b^(−im) for i = 0, 1, … (giant steps). About 2√n group operations and √n memory, which is why the group must have order
        ≥ 2^256 for 128-bit security.
      </p>
      <p className="small">
        The group order must also not be <b>smooth</b>: the Pohlig–Hellman algorithm reduces the discrete log to the prime-order subgroups, so its cost is governed by the largest prime factor of the order. Use a prime-order subgroup (or a
        safe prime p = 2q + 1).
      </p>
      {!isPrimeN(p) && <div className="callout bad small">p is not prime.</div>}
    </>
  );
}
