/** Visualizations available to every course. Course-specific ones are merged on top via `Course.viz`. */
import { lazy } from 'react';
import type { VizComponent, VizRegistry } from '../../platform/types';

const basics = () => import('./basics');
const dists = () => import('./distributions');
const chain = () => import('./markovChain');
const info = () => import('./info');

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
};
