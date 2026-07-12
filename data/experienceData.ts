type Experience = {
  company: string
  role: string
  period: string
  description: string
  technologies: string[]
  logo?: string
}

type ExperienceData = {
  [locale: string]: Experience[]
}

const experienceData: ExperienceData = {
  en: [
    {
      company: 'Percona', 
      role: 'Fullstack Engineer - Global Services',
      period: 'Jul 2026 - Present',
      description:
        'Bulding global, impactful products that help our mission to build an awesome observability environment (and open source)',
      technologies: ['Python', 'React', 'Golang', 'PostgreSQL', 'TypeScript', 'MongoDB'],
    },
    {
      company: 'SCALIS',
      role: 'Senior Backend Engineer',
      period: 'Dec 2025 - Jul 2026',
      description:
        'Building scalable backend systems with Node.js and GraphQL. Designing and implementing data models with Prisma and PostgreSQL, focusing on performance and reliability.',
      technologies: ['Node.js', 'GraphQL', 'Prisma', 'PostgreSQL', 'TypeScript'],
    },
    {
      company: 'Tripleten',
      role: 'Web Instructor',
      period: 'Sep 2025 - Apr 2026',
      description:
        'Teaching web development fundamentals and modern frameworks. Mentoring students through React, Node.js, and full-stack project development.',
      technologies: ['React', 'Node.js', 'JavaScript', 'Web Development'],
    },
    {
      company: 'Geekie',
      role: 'Software Engineer',
      period: 'Sep 2022 - Dec 2025',
      description:
        'Developed and maintained backend services for an education platform. Worked with Python microservices, designed APIs, and optimized database queries for scale.',
      technologies: ['Python', 'Flask', 'Pyramid', 'PostgreSQL', 'MongoDB', 'AWS'],
    },
    {
      company: 'Criaway',
      role: 'Co-Founder',
      period: 'Jun 2022 - Dec 2025',
      description:
        'Co-founded a tech company building digital products. Led architecture decisions and built microservices from scratch using Go, Node.js, and Python.',
      technologies: ['Golang', 'Node.js', 'Python', 'Microservices', 'AWS'],
    },
    {
      company: 'Cotabox',
      role: 'Software Engineer',
      period: 'Jul 2021 - Sep 2022',
      description:
        'Built and scaled procurement platform features using Node.js and GraphQL. Developed frontend interfaces with Vue.js and managed cloud infrastructure on AWS.',
      technologies: ['Node.js', 'GraphQL', 'Vue.js', 'AWS', 'MongoDB'],
    },
    {
      company: 'Fattoria',
      role: 'Software Engineer',
      period: 'Jul 2020 - Jul 2021',
      description:
        'Developed full-stack web applications using Node.js and React. Built REST APIs and responsive user interfaces for internal business tools.',
      technologies: ['Node.js', 'React', 'JavaScript', 'REST API'],
    },
  ],
  pt: [
    {
      company: 'Percona',
      role: 'Engenheiro Fullstack - Global Services',
      period: 'Jul 2026 - Presente',
      description:
        'Construindo produtos globais, impactantes que ajudam nossa missão de construir um ambiente de observabilidade incrível (e open source)!',
      technologies: ['Python', 'React', 'Golang', 'PostgreSQL', 'TypeScript', 'MongoDB'],
    },
    {
      company: 'SCALIS',
      role: 'Engenheiro Backend Sênior',
      period: 'Dez 2025 - Jul 2026',
      description:
        'Construindo sistemas backend escaláveis com Node.js e GraphQL. Projetando e implementando modelos de dados com Prisma e PostgreSQL, focando em performance e confiabilidade.',
      technologies: ['Node.js', 'GraphQL', 'Prisma', 'PostgreSQL', 'TypeScript'],
    },
    {
      company: 'Tripleten',
      role: 'Instrutor de Desenvolvimento Web',
      period: 'Set 2025 - Abr 2026',
      description:
        'Ensinando fundamentos de desenvolvimento web e frameworks modernos. Mentorando alunos em React, Node.js e projetos full-stack.',
      technologies: ['React', 'Node.js', 'JavaScript', 'Desenvolvimento Web'],
    },
    {
      company: 'Geekie',
      role: 'Engenheiro de Software',
      period: 'Set 2022 - Dez 2025',
      description:
        'Desenvolvi e mantive serviços backend para uma plataforma de educação. Trabalhei com microsserviços Python, projetei APIs e otimizei consultas ao banco de dados para escala.',
      technologies: ['Python', 'Flask', 'Pyramid', 'PostgreSQL', 'MongoDB', 'AWS'],
    },
    {
      company: 'Criaway',
      role: 'Co-Fundador',
      period: 'Jun 2022 - Dez 2025',
      description:
        'Co-fundei uma empresa de tecnologia construindo produtos digitais. Liderei decisões de arquitetura e construí microsserviços do zero usando Go, Node.js e Python.',
      technologies: ['Golang', 'Node.js', 'Python', 'Microsserviços', 'AWS'],
    },
    {
      company: 'Cotabox',
      role: 'Engenheiro de Software',
      period: 'Jul 2021 - Set 2022',
      description:
        'Construí e escalei funcionalidades de uma plataforma de procurement usando Node.js e GraphQL. Desenvolvi interfaces frontend com Vue.js e gerenciei infraestrutura cloud na AWS.',
      technologies: ['Node.js', 'GraphQL', 'Vue.js', 'AWS', 'MongoDB'],
    },
    {
      company: 'Fattoria',
      role: 'Engenheiro de Software',
      period: 'Jul 2020 - Jul 2021',
      description:
        'Desenvolvi aplicações web full-stack usando Node.js e React. Construí REST APIs e interfaces responsivas para ferramentas internas de negócio.',
      technologies: ['Node.js', 'React', 'JavaScript', 'REST API'],
    },
  ],
}

export default experienceData
