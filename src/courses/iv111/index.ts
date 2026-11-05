import { lazy } from 'react';
import type { Course } from '../../platform/types';
import { examGroups, schedule, examInfo } from './meta';
import { topics } from './topics';
import { exercises } from './exercises';
import { generators } from './generators';

const course: Course = {
  id: 'iv111',
  code: 'IV111',
  title: 'Probability in Computer Science',
  university: 'Faculty of Informatics, Masaryk University',
  term: 'Autumn 2026',
  description: 'Probability spaces, tail bounds, laws of large numbers, Markov chains, MDPs, entropy, coding and channel capacity.',
  examGroups,
  topics,
  exercises,
  generators,
  schedule,
  examInfo,
  mockExam: {
    minutes: [90, 60, 120],
    autoPerGroup: 2,
    writtenPerGroup: 1,
    instructions:
      'The real exam is a **written test** (preliminary evaluation) followed by an **oral exam**, organised around the seven exam questions Q1–Q7. This simulation draws two quick questions and one written problem per exam question. For the oral part, practise explaining definitions and proof ideas from the flashcards out loud.',
  },
  viz: {
    mdp: { title: 'Markov decision process', component: lazy(() => import('./viz/MdpEditor')) },
    channel: { title: 'Channel capacity', component: lazy(() => import('./viz/ChannelViz')) },
    ctmc: { title: 'CTMC & queues', component: lazy(() => import('./viz/CtmcViz')) },
  },
};

export default course;
