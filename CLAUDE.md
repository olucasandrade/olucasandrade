# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 personal blog/portfolio with multi-language support (English and Portuguese). Built on the tailwind-nextjs-starter-blog-i18n template.

Live site: https://olucasandrade.dev

## Commands

```bash
yarn dev          # Start development server (port 3000)
yarn build        # Production build + RSS generation
yarn serve        # Start production server
yarn lint         # ESLint with auto-fix
yarn format       # Prettier formatting
yarn analyze      # Bundle analysis (ANALYZE=true)
```

Pre-commit hooks (Husky) automatically run lint-staged on commits.

## Architecture

**App Router with i18n:** Uses Next.js 15 App Router with dynamic `[locale]` routing. Supported locales: `en` (default, stripped from URLs), `pt`.

**Content Management:** Contentlayer2 processes MDX blog posts from `data/blog/{en,pt}/`. Posts include frontmatter for title, date, tags, featured status, draft mode. Build generates `search.json` index and `tag-data.json`.

**Key Directories:**
- `app/[locale]/` - Pages and API routes
- `app/[locale]/api/blog/` - View tracking and stats endpoints (Redis-backed)
- `components/` - React components (blog, comments, search, navigation)
- `layouts/` - Page layout templates (PostLayout, ListLayout, AuthorLayout, etc.)
- `data/` - Content and configuration (blog posts, siteMetadata.js, projectsData.ts)
- `lib/` - Utility functions including blog-stats.ts
- `hooks/` - Custom React hooks

**i18n System:** i18next with react-i18next. Translations in `app/[locale]/i18n/locales/`. Middleware handles locale detection and URL rewrites.

**Path Aliases:** `@/components/*`, `@/data/*`, `@/layouts/*`, `@/lib/*`, `@/hooks/*`, etc. (see tsconfig.json)

## Configuration

- `data/siteMetadata.js` - Site-wide settings (title, social links, analytics, comments, search)
- `contentlayer.config.ts` - MDX processing, computed fields (reading time, TOC, slug)
- `next.config.js` - Security headers, image domains, Contentlayer integration
- `tailwind.config.js` - Dark mode (class-based), custom colors, Space Grotesk font

## Environment Variables

See `.env.example` for required variables (Giscus comments, analytics, newsletter providers).

## Commit Style

Conventional commits: `fix:`, `feat:`, `adjust:`

---

## Blog Post Style Guide

### Frontmatter Structure

```yaml
---
title: 'Title in the post language'
date: 'YYYY-MM-DD'
language: en  # or pt
tags: ['lowercase', 'hyphenated-tags', 'max-5-tags']
authors: ['lucas-andrade']
draft: false
summary: 'One to two sentences that hook the reader and summarize the article.'
images: ['/static/images/descriptive-name.png']
---
```

### Voice and Tone

**Personal and conversational.** Write as if explaining to a friend who's a fellow developer. Use first person ("I", "we") naturally. Share personal experiences and opinions.

**Approachable but technical.** Don't dumb down content, but make complex topics accessible. Use analogies and real-world examples.

**Encouraging.** Frame challenges positively. "Automating tasks can be very fun!" not "Automation is difficult but necessary."

### Structure Patterns

**Opening:** Start with a personal hook or relatable question. Connect with the reader's experience before diving into technical content.

Examples:
- "When I started programming, I felt a lot of difficulty and insecurity..."
- "Have you ever stopped to think about how your favorite bank's app can process thousands of payments?"
- "There are various programming concepts that spread across different languages..."

**Body:** Use clear H2/H3 headers. For tutorials, use numbered steps ("STEP 1:", "1º PASSO:"). Include code blocks with syntax highlighting. Explain code after showing it.

**Closing:** End with encouragement and call-to-action for feedback. Typical patterns:
- "That's basically it! [Topic] can be very fun..."
- "Thanks for reading! I hope I helped you..."
- "Did you like the article? Leave your comment!"

### Code Examples

- Use real, working code (not pseudocode)
- Include necessary imports
- Add inline comments sparingly, explain in prose instead
- Show output in comments when helpful: `# Output: Hello world`

### Formatting

- **Bold** for emphasis and key terms on first use
- *Italics* for file names, variable names, technical terms
- Inline code for `functions()`, `variables`, `commands`
- Horizontal rules (`---`) to separate conclusion from main content
- Links with descriptive text: `[OpenWeatherAPI](https://openweathermap.org/)`

### Bilingual Writing

Posts exist in both languages in `data/blog/en/` and `data/blog/pt/`. They are **translations of the same content**, not separate articles.

**English file naming:** `kebab-case-descriptive-name.mdx`
**Portuguese file naming:** `nome-descritivo-em-portugues.mdx`

**Translation guidelines:**

| Aspect | English | Portuguese |
|--------|---------|------------|
| Idioms | "get your hands dirty" | "pôr a mão na massa" |
| Expressions | "seven-headed beast" | "bicho de sete cabeças" |
| Technical terms | Keep in English (API, JSON, cache) | Keep in English (API, JSON, cache) |
| Code comments | English | Portuguese when translating user-facing strings |
| Headers | "STEP 1: INSTALLING..." | "1º PASSO: INSTALANDO..." |
| Closing | "Until next time!" | "Até a próxima!" |

**Portuguese-specific:**
- Use natural Brazilian Portuguese, not overly formal
- "você" not "tu" for second person
- Contractions are fine: "pra", "pro" in casual contexts
- Keep technical jargon in English but explain in Portuguese

### Tags Convention

Use lowercase, hyphenated tags. Common tags in the blog:
- Languages: `python`, `javascript`, `go`
- Topics: `tutorial`, `best-practices`, `architecture`, `automation`
- Technologies: `aws`, `telegram`, `graphql`, `rest`, `api`
- Concepts: `system-design`, `web-development`, `programming`

### Images

Store in `/public/static/images/`. Use descriptive kebab-case names matching the post topic: `python-decorators.png`, `telegram-bot.png`, `system_design.webp`
