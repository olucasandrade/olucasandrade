import experienceData from '@/data/experienceData'
import projectsData from '@/data/projectsData'

type Locale = 'en' | 'pt'

const helpText: Record<Locale, string> = {
  en: `Available commands:
  help        - Show this help message
  about       - About Lucas Andrade
  skills      - Technical skills
  projects    - View projects
  experience  - Work experience
  contact     - Contact information
  clear       - Clear terminal
  play snake  - Play Snake game
  play typing - Typing speed game
  play quiz   - Tech quiz game
  sudo hire-me - ???
  cat resume.pdf - ???`,
  pt: `Comandos disponíveis:
  help           - Mostrar esta mensagem de ajuda
  about          - Sobre Lucas Andrade
  skills         - Habilidades técnicas
  projects       - Ver projetos
  experience     - Experiência profissional
  contact        - Informações de contato
  clear          - Limpar terminal
  play snake     - Jogar Snake
  play typing    - Jogo de velocidade de digitação
  play quiz      - Quiz de tecnologia
  sudo hire-me   - ???
  cat resume.pdf - ???`,
}

const aboutText: Record<Locale, string> = {
  en: `
> Lucas Andrade
> Senior Backend Engineer @ SCALIS
> Web Instructor @ Tripleten

5+ years building scalable backend systems.
Passionate about system design, performance,
and teaching others.

Based in Brazil. Working globally.
Languages: Python, Go, Node.js, TypeScript`,
  pt: `
> Lucas Andrade
> Engenheiro Backend Senior @ SCALIS
> Instrutor Web @ Tripleten

5+ anos construindo sistemas backend escaláveis.
Apaixonado por system design, performance,
e ensinar outras pessoas.

Baseado no Brasil. Trabalhando globalmente.
Linguagens: Python, Go, Node.js, TypeScript`,
}

const skillsText: Record<Locale, string> = {
  en: `
LANGUAGES    Python | Go | Node.js | TypeScript | JavaScript
BACKEND      Flask | Pyramid | Express | GraphQL | REST
DATABASES    PostgreSQL | MongoDB | Redis
CLOUD        AWS (EC2, S3, Lambda, SQS, SNS)
TOOLS        Docker | Git | Prisma | Terraform
FRONTEND     React | Vue.js | Next.js | Tailwind CSS`,
  pt: `
LINGUAGENS   Python | Go | Node.js | TypeScript | JavaScript
BACKEND      Flask | Pyramid | Express | GraphQL | REST
BANCOS       PostgreSQL | MongoDB | Redis
CLOUD        AWS (EC2, S3, Lambda, SQS, SNS)
FERRAMENTAS  Docker | Git | Prisma | Terraform
FRONTEND     React | Vue.js | Next.js | Tailwind CSS`,
}

const contactText: Record<Locale, string> = {
  en: `
Email:    contato@olucasandrade.com
GitHub:   github.com/olucasandrade
LinkedIn: linkedin.com/in/lucasandradesouza
Twitter:  x.com/olucasandrad
Website:  olucasandrade.dev`,
  pt: `
Email:    contato@olucasandrade.com
GitHub:   github.com/olucasandrade
LinkedIn: linkedin.com/in/lucasandradesouza
Twitter:  x.com/olucasandrad
Website:  olucasandrade.dev`,
}

function getExperienceText(locale: Locale): string {
  const experiences = experienceData[locale] || experienceData.en
  return experiences
    .map((exp) => `\n${exp.role} @ ${exp.company}\n${exp.period}\n${exp.technologies.join(' | ')}`)
    .join('\n')
}

function getProjectsText(locale: Locale): string {
  const projects = projectsData[locale] || projectsData.en
  return projects
    .map((p) => `\n> ${p.title}\n  ${p.description.substring(0, 80)}...\n  ${p.href}`)
    .join('\n')
}

export function executeCommand(
  command: string,
  locale: Locale
): { output: string; special?: string } {
  const cmd = command.trim().toLowerCase()

  switch (cmd) {
    case 'help':
      return { output: helpText[locale] }
    case 'about':
      return { output: aboutText[locale] }
    case 'skills':
      return { output: skillsText[locale] }
    case 'contact':
      return { output: contactText[locale] }
    case 'experience':
      return { output: getExperienceText(locale) }
    case 'projects':
      return { output: getProjectsText(locale) }
    case 'clear':
      return { output: '', special: 'clear' }
    case 'sudo hire-me':
      return {
        output:
          locale === 'pt'
            ? '> Processando... Acesso concedido! Manda uma mensagem :)\n> contato@olucasandrade.com'
            : "> Processing... Access granted! Let's talk :)\n> contato@olucasandrade.com",
      }
    case 'cat resume.pdf':
      return {
        output:
          locale === 'pt'
            ? '> Abrindo currículo... Acesse olucasandrade.dev/about para ver mais!'
            : '> Opening resume... Visit olucasandrade.dev/about to learn more!',
      }
    case 'play snake':
      return { output: '', special: 'snake' }
    case 'play typing':
      return { output: '', special: 'typing' }
    case 'play quiz':
      return { output: '', special: 'quiz' }
    default:
      return {
        output:
          locale === 'pt'
            ? `Comando não encontrado: ${command}\nDigite "help" para ver os comandos disponíveis.`
            : `Command not found: ${command}\nType "help" to see available commands.`,
      }
  }
}
