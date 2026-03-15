// In production, replace this with a real database (MongoDB, PostgreSQL, etc.)
const projects = [
  {
    id: '1',
    title: 'IntelliScribe AI',
    description: 'A meeting transcription and summarization tool that uses GPT-4 to generate action items and key insights from audio.',
    longDescription: 'IntelliScribe AI leverages OpenAI\'s Whisper for audio transcription and GPT-4 for intelligent summarization. It extracts action items, key decisions, and follow-ups automatically from any meeting recording.',
    tags: ['NEXT.JS', 'GITHUB'],
    tech: ['Next.js', 'OpenAI', 'Whisper API', 'Tailwind CSS', 'Node.js'],
    liveDemo: 'https://intelliscribe.demo.com',
    source: 'https://github.com/tinkukrishna/intelliscribe',
    featured: true,
    category: 'AI & LLM',
    image: null,
  },
  {
    id: '2',
    title: 'Portfolio Pro',
    description: 'An automated portfolio generator that builds SEO-optimized developer websites based on Github profile data.',
    longDescription: 'Portfolio Pro pulls your GitHub data via API, analyzes your repositories and contributions, then generates a fully SEO-optimized portfolio site with one click. Built with Next.js and deployed on Vercel.',
    tags: ['REACT', 'TAILWIND'],
    tech: ['React', 'Next.js', 'GitHub API', 'Tailwind CSS', 'Vercel'],
    liveDemo: 'https://portfoliopro.demo.com',
    source: 'https://github.com/tinkukrishna/portfolio-pro',
    featured: true,
    category: 'React',
    image: null,
  },
  {
    id: '3',
    title: 'AI Content Generator',
    description: 'Automated SEO-friendly blog post generator using GPT-4 with a sleek management dashboard.',
    longDescription: 'A full-stack content management platform that uses GPT-4 to generate, edit, and schedule SEO-optimized blog posts. Features keyword research, readability scoring, and one-click WordPress/Ghost publishing.',
    tags: ['REACT', 'OPENAI', 'TAILWIND'],
    tech: ['React', 'OpenAI', 'Tailwind CSS', 'Express', 'MongoDB'],
    liveDemo: 'https://contentgen.demo.com',
    source: 'https://github.com/tinkukrishna/content-gen',
    featured: false,
    category: 'AI & LLM',
    image: null,
  },
  {
    id: '4',
    title: 'Neural Portfolio',
    description: 'High-performance portfolio featuring interactive 3D neural network visualizations and smooth transitions.',
    longDescription: 'A visually stunning portfolio website built with Three.js for interactive 3D neural network animations. Uses Framer Motion for page transitions and is fully responsive.',
    tags: ['NEXT.JS', 'THREE.JS', 'FRAMER'],
    tech: ['Next.js', 'Three.js', 'Framer Motion', 'GSAP', 'Tailwind CSS'],
    liveDemo: 'https://neural.demo.com',
    source: 'https://github.com/tinkukrishna/neural-portfolio',
    featured: false,
    category: 'Next.js',
    image: null,
  },
  {
    id: '5',
    title: 'Smart Dashboard',
    description: 'Real-time data visualization platform with predictive analytics and customizable user widgets.',
    longDescription: 'An enterprise-grade analytics dashboard with D3.js visualizations, real-time Firebase sync, and AI-driven predictions. Supports custom widget layouts with drag-and-drop.',
    tags: ['REACT', 'FIREBASE', 'D3.JS'],
    tech: ['React', 'Firebase', 'D3.js', 'Recharts', 'Tailwind CSS'],
    liveDemo: 'https://smartdash.demo.com',
    source: 'https://github.com/tinkukrishna/smart-dashboard',
    featured: false,
    category: 'React',
    image: null,
  },
  {
    id: '6',
    title: 'Cryptuo Wallet UI',
    description: 'A sleek mobile-first cryptocurrency wallet interface with real-time price tracking.',
    longDescription: 'Beautiful mobile UI for a crypto wallet app built with React Native. Features live price feeds, portfolio analytics, and biometric authentication.',
    tags: ['REACT', 'NEXT.JS'],
    tech: ['React Native', 'Next.js', 'CoinGecko API', 'Expo'],
    liveDemo: 'https://cryptuo.demo.com',
    source: 'https://github.com/tinkukrishna/cryptuo',
    featured: false,
    category: 'Mobile',
    image: null,
  },
];

const getProjects = (req, res) => {
  const { category, featured } = req.query;

  let filtered = [...projects];

  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (featured === 'true') {
    filtered = filtered.filter(p => p.featured);
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
};

const getProjectById = (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ success: true, data: project });
};

module.exports = { getProjects, getProjectById };
