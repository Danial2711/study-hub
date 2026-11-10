import { describe, expect, it } from 'vitest';
import { fromHex, toHex, utf8, xor } from '../src/shared/math/crypto/bytes';
import { gfInv, gfMul, xtime } from '../src/shared/math/crypto/gf2';
import { aesCipher, cbcDecrypt, cbcEncrypt, ctr, decryptBlock, encryptBlock, expandKey, mixColumns, SBOX, invMixColumns, shiftRows, invShiftRows } from '../src/shared/math/crypto/aes';
import { block, initialState, invPermute, permute, quarterRoundSteps, serialize } from '../src/shared/math/crypto/chacha';
import { sha256 } from '../src/shared/math/crypto/sha256';
import { mdHash, mdPad, toyHash, MD_BLOCK } from '../src/shared/math/crypto/toyHash';
import { crt, egcd, iroot, isPrime, modInv, modPow, modPowSteps, phi } from '../src/shared/math/crypto/numberTheory';
import { cycle, generators, generatorTest, order, zn } from '../src/shared/math/crypto/groups';
import { add, groupOrder, hasse, mul, onCurve, pointOrder, points, type Curve } from '../src/shared/math/crypto/ec';
import { gradeFor, roundRobin, scoreAutoPart } from '../src/platform/exam';
import { makeRng } from '../src/shared/math/random';
import type { QuizQuestion } from '../src/platform/types';

describe('GF(2^8)', () => {
  it('matches the FIPS-197 worked examples', () => {
    expect(gfMul(0x57, 0x83)).toBe(0xc1);
    expect(gfMul(0x57, 0x13)).toBe(0xfe);
    expect(xtime(0x57)).toBe(0xae);
    expect(xtime(0xae)).toBe(0x47);
  });
  it('inverses multiply to 1', () => {
    for (let a = 1; a < 256; a++) expect(gfMul(a, gfInv(a))).toBe(1);
  });
});

describe('AES-128', () => {
  it('S-box matches the standard', () => {
    expect(SBOX[0x00]).toBe(0x63);
    expect(SBOX[0x53]).toBe(0xed);
    expect(SBOX[0xff]).toBe(0x16);
  });
  it('FIPS-197 Appendix C.1 vector', () => {
    const key = fromHex('000102030405060708090a0b0c0d0e0f');
    const pt = fromHex('00112233445566778899aabbccddeeff');
    const ct = encryptBlock(pt, key);
    expect(toHex(ct)).toBe('69c4e0d86a7b0430d8cdb78070b4c55a');
    expect(toHex(decryptBlock(ct, key))).toBe(toHex(pt));
  });
  it('key schedule (FIPS-197 A.1) last round key', () => {
    const rk = expandKey(fromHex('2b7e151628aed2a6abf7158809cf4f3c'));
    expect(toHex(rk[10])).toBe('d014f9a8c9ee2589e13f0cc8b6630ca6');
  });
  it('round operations are invertible', () => {
    const s = fromHex('d4bf5d30e0b452aeb84111f11e2798e5');
    expect(toHex(mixColumns(s))).toBe('046681e5e0cb199a48f8d37a2806264c');
    expect(toHex(invMixColumns(mixColumns(s)))).toBe(toHex(s));
    expect(toHex(invShiftRows(shiftRows(s)))).toBe(toHex(s));
  });
  it('CBC and CTR round-trip', () => {
    const E = aesCipher(fromHex('2b7e151628aed2a6abf7158809cf4f3c'));
    const iv = fromHex('000102030405060708090a0b0c0d0e0f');
    const pt = fromHex('6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e51');
    const c = cbcEncrypt(E, iv, pt);
    expect(toHex(c[0])).toBe('7649abac8119b246cee98e9b12e9197d'); // NIST SP 800-38A F.2.1
    expect(toHex(Uint8Array.from(cbcDecrypt(E, iv, c).flatMap((b) => [...b])))).toBe(toHex(pt));
    const ctrIv = fromHex('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff');
    expect(toHex(ctr(E, ctrIv, pt))).toBe('874d6191b620e3261bef6864990db6ce9806f66b7970fdff8617187bb9fffdff'); // F.5.1
  });
});

describe('ChaCha20', () => {
  it('quarter round, RFC 8439 §2.1.1', () => {
    const s = quarterRoundSteps(0x11111111, 0x01020304, 0x9b8d6f43, 0x01234567);
    expect(s[s.length - 1].words.map((w) => w.toString(16))).toEqual(['ea2a92f4', 'cb1cf8ce', '4581472e', '5881c4bb']);
  });
  it('block function, RFC 8439 §2.3.2', () => {
    const key = fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const nonce = fromHex('000000090000004a00000000');
    const out = serialize(block(key, 1, nonce));
    expect(toHex(out.slice(0, 16))).toBe('10f1e7e4d13b5915500fdd1fa32071c4');
  });
  it('without the final addition the permutation can be inverted to recover the key', () => {
    const key = fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const nonce = fromHex('000000090000004a00000000');
    const init = initialState(key, 1, nonce);
    const out = block(key, 1, nonce, { feedForward: false });
    expect(Array.from(invPermute(out))).toEqual(Array.from(init));
    expect(Array.from(permute(init))).toEqual(Array.from(out));
  });
});

describe('SHA-256 and the toy MD hash', () => {
  it('SHA-256 test vectors', () => {
    expect(toHex(sha256('abc'))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(toHex(sha256(''))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(toHex(sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  });
  it('MD padding fills to whole blocks and encodes the length', () => {
    for (let len = 0; len < 40; len++) expect((len + mdPad(len).length) % MD_BLOCK).toBe(0);
    expect(mdPad(3)[mdPad(3).length - 1]).toBe(24);
  });
  it('toy MD hash chains one value per block', () => {
    const t = mdHash(utf8('a message longer than one block'));
    expect(t.chain).toHaveLength(t.blocks.length + 1);
    expect(t.chain.at(-1)).toBe(toyHash(utf8('a message longer than one block')));
  });
});

describe('number theory', () => {
  it('egcd, inverse, power', () => {
    const { g, x, y } = egcd(240n, 46n);
    expect(g).toBe(2n);
    expect(240n * x + 46n * y).toBe(2n);
    expect(modInv(17n, 3120n)).toBe(2753n);
    expect(modPow(65n, 17n, 3233n)).toBe(2790n);
    expect(modPowSteps(65n, 17n, 3233n).result).toBe(2790n);
    expect(modPow(2790n, 2753n, 3233n)).toBe(65n);
  });
  it('CRT and roots (e = 3 broadcast attack)', () => {
    const r = crt([2n, 3n, 2n], [3n, 5n, 7n])!;
    expect(r.x).toBe(23n);
    const m = 42n;
    const Ns = [55n, 87n, 133n];
    const cs = Ns.map((N) => modPow(m, 3n, N));
    const c = crt(cs, Ns)!;
    expect(iroot(c.x, 3)).toBe(m);
  });
  it('primes and phi', () => {
    expect(isPrime(2147483647n)).toBe(true);
    expect(isPrime(561n)).toBe(false);
    expect(phi(9)).toBe(6);
    expect(phi(3233)).toBe(3120);
  });
});

describe('groups', () => {
  it('Z_9^× is cyclic of order 6 with generators 2 and 5', () => {
    const G = zn('mul', 9);
    expect(G.elements).toEqual([1, 2, 4, 5, 7, 8]);
    expect(generators(G)).toEqual([2, 5]);
    expect(order(G, 8)).toBe(2);
    expect(cycle(G, 2)).toEqual([1, 2, 4, 8, 7, 5]);
    expect(generatorTest(G, 4).some((t) => t.value === 1)).toBe(true);
  });
  it('Z_8^× is not cyclic', () => {
    expect(generators(zn('mul', 8))).toEqual([]);
    expect(generators(zn('add', 6))).toEqual([1, 5]);
  });
});

describe('elliptic curves over F_p', () => {
  const c: Curve = { a: 2, b: 2, p: 17 };
  const G = { x: 5, y: 1 };
  it('known textbook curve y² = x³ + 2x + 2 mod 17 has 19 points', () => {
    expect(onCurve(c, G)).toBe(true);
    expect(groupOrder(c)).toBe(19);
    expect(pointOrder(c, G)).toBe(19);
    expect(add(c, G, G)).toEqual({ x: 6, y: 3 });
    expect(mul(c, 19, G)).toBeNull();
  });
  it('group law is associative and counts satisfy Hasse', () => {
    const pts = points(c);
    for (let i = 0; i < 20; i++) {
      const [P, Q, R] = [pts[i % pts.length], pts[(3 * i + 1) % pts.length], pts[(7 * i + 2) % pts.length]];
      expect(add(c, add(c, P, Q), R)).toEqual(add(c, P, add(c, Q, R)));
    }
    for (const p of [11, 13, 101]) {
      const n = groupOrder({ a: 1, b: 3, p });
      expect(n).toBeGreaterThanOrEqual(hasse(p).lo);
      expect(n).toBeLessThanOrEqual(hasse(p).hi);
    }
  });
});

describe('mock exam blueprint helpers', () => {
  const q = (answer: number): QuizQuestion => ({ id: String(Math.random()), type: 'mcq', prompt: '', options: ['a', 'b', 'c'], answer, explanation: '' });
  it('round robin spreads over groups', () => {
    const out = roundRobin([[1, 2, 3], [4], [5, 6]], 4, makeRng(1));
    expect(out).toHaveLength(4);
    expect(new Set(out.filter((x) => x <= 3)).size).toBeLessThanOrEqual(2);
    expect(out).toContain(4);
  });
  it('penalty scoring with blanks, clamped at 0', () => {
    const part = { kind: 'auto' as const, id: 'A', title: 'A', count: 3, points: 2.5, penalty: 1 };
    expect(scoreAutoPart(part, [{ q: q(0), r: 0 }, { q: q(0), r: 1 }, { q: q(0), r: undefined }]).score).toBe(1.5);
    expect(scoreAutoPart(part, [{ q: q(0), r: 1 }, { q: q(0), r: 2 }]).score).toBe(0);
    expect(scoreAutoPart(part, [{ q: q(0), r: 1 }]).max).toBe(2.5);
  });
  it('grade lookup', () => {
    const scale = [
      { label: 'A', minPercent: 90 },
      { label: 'E', minPercent: 50 },
    ];
    expect(gradeFor(scale, 95)).toBe('A');
    expect(gradeFor(scale, 50)).toBe('E');
    expect(gradeFor(scale, 49.9)).toBe('F');
  });
});

it('xor helper', () => expect(toHex(xor(fromHex('ff00'), fromHex('0f0f')))).toBe('f00f'));
