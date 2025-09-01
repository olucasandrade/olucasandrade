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
      title: 'Python Decorators Guide',
      description: `A comprehensive guide to understanding and implementing Python decorators. Learn how to supercharge your code with practical examples and best practices for decorators in Python development.`,
      imgSrc: '/static/images/logo.png',
      href: '/en/blog/supercharging-code-with-python-decorators',
    },
    {
      title: 'GraphQL vs REST Analysis',
      description: `In-depth comparison of GraphQL and REST APIs. Understand when to use each approach, their advantages and disadvantages, and make informed decisions for your next API project.`,
      imgSrc: '/static/images/logo.png',
      href: '/en/blog/graphql-vs-rest-when-to-use-each',
    },
  ],

  'pt-br': [
    {
      title: 'Guia de Decorators em Python',
      description: `Um guia completo para entender e implementar decorators em Python. Aprenda como potencializar seu código com exemplos práticos e boas práticas para decorators no desenvolvimento Python.`,
      imgSrc: '/static/images/logo.png',
      href: '/pt-br/blog/potencializando-codigo-com-decorators-python',
    },
    {
      title: 'Análise GraphQL vs REST',
      description: `Comparação aprofundada entre APIs GraphQL e REST. Entenda quando usar cada abordagem, suas vantagens e desvantagens, e tome decisões informadas para seu próximo projeto de API.`,
      imgSrc: '/static/images/logo.png',
      href: '/pt-br/blog/graphql-vs-rest-quando-utilizar',
    },
  ],
}

export default projectsData
