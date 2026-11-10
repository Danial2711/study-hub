/** Visualizations available to every course. Course-specific ones are merged on top via `Course.viz`. */
import { lazy } from 'react';
import type { VizComponent, VizRegistry } from '../../platform/types';

const basics = () => import('./basics');
const dists = () => import('./distributions');
const chain = () => import('./markovChain');
const info = () => import('./info');
const cSym = () => import('./crypto/symmetric');
const cCiph = () => import('./crypto/ciphers');
const cHash = () => import('./crypto/hashes');
const cMac = () => import('./crypto/macs');
const cPk = () => import('./crypto/publicKey');
const cEc = () => import('./crypto/ecc');
const cProto = () => import('./crypto/protocols');

const pick = <M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M) =>
  lazy(async () => ({ default: (await load())[name] as VizComponent }));

export const SHARED_VIZ: VizRegistry = {
  venn: { title: 'Events as sets (Venn diagram)', component: pick(basics, 'VennEvents') },
  bayes: { title: "Bayes' rule & total probability", component: pick(basics, 'BayesTree') },
  independence: { title: 'Independence on two dice', component: pick(basics, 'IndependenceChecker') },
  distribution: { title: 'Distribution explorer', component: pick(dists, 'DistributionExplorer') },
  tailBounds: { title: 'Markov vs Chebyshev vs Chernoff', component: pick(dists, 'TailBoundsCompare') },
  lln: { title: 'Law of large numbers', component: pick(dists, 'LLNSimulator') },
  clt: { title: 'Central limit theorem', component: pick(dists, 'CLTSimulator') },
  jensen: { title: "Jensen's inequality", component: pick(dists, 'JensenViz') },
  markovChain: { title: 'Markov chain explorer', component: pick(chain, 'MarkovChainEditor') },
  entropy: { title: 'Entropy', component: pick(info, 'EntropyViz') },
  mutualInfo: { title: 'Mutual information', component: pick(info, 'MutualInfoVenn') },
  huffman: { title: 'Huffman code builder', component: pick(info, 'HuffmanBuilder') },
  kraft: { title: 'Kraft–McMillan inequality', component: pick(info, 'KraftChecker') },
  // cryptography
  cipherTable: { title: 'Perfect secrecy checker', component: pick(cSym, 'CipherTable') },
  xorPad: { title: 'One-time pad & two-time pad', component: pick(cSym, 'XorPad') },
  attackGame: { title: 'Attack game simulator', component: pick(cSym, 'AttackGame') },
  negligible: { title: 'Negligible functions', component: pick(cSym, 'Negligible') },
  chacha: { title: 'ChaCha quarter round & diffusion', component: pick(cCiph, 'ChaChaViz') },
  aesRound: { title: 'AES-128 round by round', component: pick(cCiph, 'AesRound') },
  gf256: { title: 'GF(2⁸) arithmetic', component: pick(cCiph, 'Gf256') },
  blockModes: { title: 'Block-cipher modes (ECB/CBC/CTR)', component: pick(cCiph, 'BlockModes') },
  birthday: { title: 'Birthday attack & Floyd ρ', component: pick(cHash, 'Birthday') },
  merkleDamgard: { title: 'Merkle–Damgård and sponge', component: pick(cHash, 'MerkleDamgard') },
  merkleTree: { title: 'Merkle tree proofs', component: pick(cHash, 'MerkleTree') },
  macLab: { title: 'MAC lab (HMAC, CBC-MAC, CMAC, poly MAC)', component: pick(cMac, 'MacLab') },
  aeLab: { title: 'Authenticated encryption (EtM/MtE/E&M)', component: pick(cMac, 'AeLab') },
  groupExplorer: { title: 'Group explorer (ℤₙ, ℤₙ^×)', component: pick(cPk, 'GroupExplorer') },
  rsaLab: { title: 'RSA lab', component: pick(cPk, 'RsaLab') },
  dhLab: { title: 'Diffie–Hellman & discrete log', component: pick(cPk, 'DhLab') },
  ellipticCurve: { title: 'Elliptic curves', component: pick(cEc, 'EllipticCurve') },
  signatureLab: { title: 'Signatures (Schnorr, RSA-FDH)', component: pick(cProto, 'SignatureLab') },
  zkProof: { title: 'Zero-knowledge identification', component: pick(cProto, 'ZkProof') },
};
