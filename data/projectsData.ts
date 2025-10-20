type Project = {
  title: string
  description: string
  imgSrc: string
  href: string
}

type ProjectsData = {
  [locale: string]: Project[]
}

const projectsData: ProjectsData = {
  en: [
    {
      title: 'Yeon',
      description: `A comprehensive platform for artists to manage their musical career, maximize earnings, and connect with fans. It offers smart management, fan engagement, direct monetization, crowdfunding tools, and an AI-assisted release planner.`,
      imgSrc: '/static/images/yeon_logo.webp',
      href: 'https://yeon.live',
    },
    {
      title: 'Trevo - CORS Proxy & API Testing Tool',
      description: `Trevo is a powerful CORS proxy API and API testing tool that allows users to send HTTP and WebSocket requests, save requests, and manage parameters, headers, and body content.`,
      imgSrc: '/static/images/trevo_logo.png',
      href: 'https://app.trevo.rest',
    },
    {
      title: 'BomDeMorar - Neighborhood Reviews',
      description: `BomDeMorar is a platform for real residents to review neighborhoods based on safety, cost-benefit, mobility, and infrastructure, helping users find their ideal place to live.`,
      imgSrc: '/static/images/bomdemorar_logo.webp',
      href: 'https://www.bomdemorar.com',
    },
    {
      title: 'Davez - Mototaxi App',
      description: `Davez is an application used by mototaxis in Brazilian communities, facilitating ride services and connecting drivers with passengers.`,
      imgSrc: '/static/images/davez_logo.png',
      href: 'https://davez.vercel.app',
    },
    {
      title: 'Homebrew AutoMaintainer',
      description: `A command-line utility that automates common GitHub maintenance tasks for repositories and organizations, including automated pull request and branch management.`,
      imgSrc: '/static/images/automaintainer_logo.png',
      href: 'https://github.com/olucasandrade/homebrew-automaintainer',
    },
    {
      title: 'URL Analyzer (Go Package)',
      description: `A Go package designed for analyzing website performance metrics, providing data such as page load time, HTTP requests count, and page size.`,
      imgSrc: '/static/images/url_analyzer_logo.png',
      href: 'https://github.com/olucasandrade/url-analyzer',
    },
  ],

  pt: [
    {
      title: 'Yeon',
      description: `Uma plataforma completa para artistas gerenciarem sua carreira musical, maximizarem ganhos e se conectarem com fãs. Oferece gestão inteligente, engajamento de fãs, monetização direta, ferramentas de crowdfunding e um planejador de lançamentos assistido por IA.`,
      imgSrc: '/static/images/yeon_logo.webp',
      href: 'https://yeon.live',
    },
    {
      title: 'Trevo - Proxy CORS e Ferramenta de Teste de API',
      description: `Trevo é uma API de proxy CORS e ferramenta de teste de API que permite aos usuários enviar requisições HTTP e WebSocket, salvar requisições e gerenciar parâmetros, cabeçalhos e conteúdo do corpo.`,
      imgSrc: '/static/images/trevo_logo.png',
      href: 'https://app.trevo.rest',
    },
    {
      title: 'BomDeMorar - Avaliações de Bairros',
      description: `BomDeMorar é uma plataforma para moradores reais avaliarem bairros com base em segurança, custo-benefício, mobilidade e infraestrutura, ajudando usuários a encontrar seu lugar ideal para morar.`,
      imgSrc: '/static/images/bomdemorar_logo.webp',
      href: 'https://www.bomdemorar.com',
    },
    {
      title: 'Davez - Aplicativo de Mototáxi',
      description: `Davez é um aplicativo utilizado por mototáxis em comunidades brasileiras para organizar as corridas por ordem do mototaxi da vez (tendeu?)`,
      imgSrc: '/static/images/davez_logo.png',
      href: 'https://davez.vercel.app',
    },
    {
      title: 'Homebrew AutoMaintainer',
      description: `Um utilitário de linha de comando que automatiza tarefas comuns de manutenção do GitHub para repositórios e organizações, incluindo gerenciamento automatizado de pull requests e branches.`,
      imgSrc: '/static/images/automaintainer_logo.png',
      href: 'https://github.com/olucasandrade/homebrew-automaintainer',
    },
    {
      title: 'URL Analyzer (Pacote Go)',
      description: `Um pacote Go projetado para analisar métricas de desempenho de sites, fornecendo dados como tempo de carregamento da página, contagem de requisições HTTP e tamanho da página.`,
      imgSrc: '/static/images/url_analyzer_logo.png',
      href: 'https://github.com/olucasandrade/url-analyzer',
    },
  ],
}

export default projectsData
