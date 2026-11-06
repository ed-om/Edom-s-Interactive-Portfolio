export type ChapterId = 'cap' | 'person' | 'build' | 'tools' | 'journey' | 'next';

export type Chapter = {
  id: ChapterId;
  ordinal: string;
  name: string;
  bodyPart: string;
  title: string;
  accent: string;
  paragraph: string;
  marginNote: string;
  focus: { x: number; y: number };
  scale: number;
  panelSide: 'left' | 'right';
  targetY: number;
  tone: string;
};

export type Project = {
  id: string;
  number: string;
  name: string;
  kind: string;
  summary: string;
  problem: string;
  approach: string;
  stack: string[];
  takeaway: string;
  status: string;
  color: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: 'cap', ordinal: '01', name: 'Curiosity', bodyPart: 'THE MUSHROOM CAP',
    title: 'A mind that asks', accent: 'why?',
    paragraph: 'I’m Edom, a software engineering student drawn to the questions underneath the surface. I want to understand how things work—not just how to use them.',
    marginNote: 'Every good build begins with a better question.', focus: { x: 0.51, y: 0.14 }, scale: 1.64,
    panelSide: 'left', targetY: 0.41, tone: '#f5dce0',
  },
  {
    id: 'person', ordinal: '02', name: 'The person', bodyPart: 'FACE & LAVENDER HAIR',
    title: 'I learn by taking', accent: 'things apart.',
    paragraph: 'I follow questions until I reach the underlying idea. I like learning fundamentals, testing assumptions, and letting a mistake teach me where my understanding is thin.',
    marginNote: 'Curiosity is a practice—not a badge.', focus: { x: 0.52, y: 0.29 }, scale: 1.82,
    panelSide: 'right', targetY: 0.39, tone: '#eee2f4',
  },
  {
    id: 'build', ordinal: '03', name: 'Things I build', bodyPart: 'THE SHIRT · THE WORK',
    title: 'Questions become', accent: 'something real.',
    paragraph: 'Projects are where ideas meet constraints: confusing bugs, trade-offs, imperfect first attempts, and the satisfaction of making something work.',
    marginNote: 'Open a project for the technical notes.', focus: { x: 0.51, y: 0.49 }, scale: 1.76,
    panelSide: 'left', targetY: 0.40, tone: '#f9edc8',
  },
  {
    id: 'tools', ordinal: '04', name: 'My toolkit', bodyPart: 'ARMS & HANDS',
    title: 'Tools for', accent: 'exploration.',
    paragraph: 'C++ and Python help me think about logic and systems. Web and Android experiments let me bring ideas closer to people. The toolkit keeps growing as the questions change.',
    marginNote: 'Depth over a collection of logos.', focus: { x: 0.13, y: 0.38 }, scale: 2.02,
    panelSide: 'right', targetY: 0.42, tone: '#e0eadb',
  },
  {
    id: 'journey', ordinal: '05', name: 'The journey', bodyPart: 'TROUSERS · THE PATH SO FAR',
    title: 'Still a work', accent: 'in progress.',
    paragraph: 'At AASTU, through DSA learning and the INSA Summer Camp, I keep moving between strengthening my foundations and building what I want to understand next.',
    marginNote: 'Learn it. Build it. Find the next question.', focus: { x: 0.51, y: 0.76 }, scale: 1.85,
    panelSide: 'left', targetY: 0.42, tone: '#e7e2f2',
  },
  {
    id: 'next', ordinal: '06', name: 'What’s next', bodyPart: 'THE SHOES · THE NEXT STEP',
    title: 'The next step is', accent: 'unknown.',
    paragraph: 'I’m exploring developer tooling, systems, AI/ML, and the deeper mechanics behind software. I’m not trying to look finished. I’m here to keep getting better.',
    marginNote: 'Another chapter, still being written.', focus: { x: 0.50, y: 0.95 }, scale: 2.03,
    panelSide: 'left', targetY: 0.40, tone: '#f2dce1',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'aposma', number: '01', name: 'Aposma', kind: 'Developer tooling',
    summary: 'A local-first code intelligence tool for reviewing, documenting, and understanding code.',
    problem: 'Understanding an unfamiliar codebase takes more than opening one file at a time. Aposma explores how analysis and generated documentation can make code easier to navigate.',
    approach: 'A C++ analysis layer paired with a Python-facing CLI, with experiments around Clang/LLVM integration and local review workflows.',
    stack: ['C++', 'Python', 'Clang / LLVM', 'CLI'],
    takeaway: 'Compiler tooling makes the build environment and the underlying representation of source code part of the engineering problem.',
    status: 'Active experiment · Local-first', color: '#b65870',
  },
  {
    id: 'ergocam', number: '02', name: 'ErgoCam', kind: 'Computer vision',
    summary: 'A posture-coaching experiment exploring pose estimation and visual feedback.',
    problem: 'When working at a desk, posture can drift without being noticed. This project explores whether camera-based pose cues can offer useful reminders.',
    approach: 'A web prototype with a React/Vite interface and pose-landmark experiments, including testing model assets and calibration behavior.',
    stack: ['React', 'Vite', 'JavaScript', 'MediaPipe experiments'],
    takeaway: 'A computer-vision demo is only as dependable as model loading, calibration, camera conditions, and feedback thresholds.',
    status: 'Prototype · Not a medical product', color: '#648c88',
  },
  {
    id: 'touch-grass', number: '03', name: 'Touch Grass', kind: 'Android / Kotlin',
    summary: 'An Android screen-time project exploring more intentional device use.',
    problem: 'Phones are useful, but it can be difficult to notice how much attention they quietly absorb.',
    approach: 'A Kotlin and Android Studio project focused on exploring screen-time awareness. Feature claims are limited to the available project context.',
    stack: ['Kotlin', 'Android Studio'],
    takeaway: 'Mobile interventions should fit naturally into a person’s routine; useful feedback should be clear rather than noisy.',
    status: 'Personal project · Evolving scope', color: '#a18ac1',
  },
  {
    id: 'pharmacy', number: '04', name: 'AASTU Pharmacy', kind: 'Coursework',
    summary: 'A pharmacy management console project with login roles and medicine records.',
    problem: 'The coursework explores structured medicine records and different interactions for pharmacist and student users.',
    approach: 'A C++ console application exploring login flows, medicine CRUD, MySQL, and file-based validation.',
    stack: ['C++', 'MySQL', 'File I/O'],
    takeaway: 'Even small applications involve data validation, access boundaries, and decisions about where information is stored.',
    status: 'Coursework · Educational scope', color: '#d0a451',
  },
];

export const SKILL_GROUPS = [
  { name: 'Languages', items: ['C++', 'C', 'Python', 'JavaScript', 'Kotlin'] },
  { name: 'Web', items: ['HTML', 'CSS', 'React', 'Vite'] },
  { name: 'Mobile', items: ['Android Studio', 'Flutter · learning'] },
  { name: 'Systems', items: ['Linux', 'Git', 'DSA', 'CLI tools'] },
  { name: 'Data', items: ['SQL', 'MySQL', 'File handling'] },
];

export const LINKS = {
  github: 'https://github.com/ed-om',
  linkedin: 'https://www.linkedin.com/in/edom-anteneh-alemu/',
  email: 'mailto:blessededom1@gmail.com',
  emailText: 'blessededom1@gmail.com',
};
