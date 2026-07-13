'use client'

import { useParams, usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import videosData from '@/data/videosData'
import Logo from '@/data/logo.svg'
import Link from '../mdxcomponents/Link'
import AuthorsMenu from './AuthorsMenu'
import MobileNav from './MobileNav'
import ThemeSwitch from '../theme/ThemeSwitch'
import LangSwitch from '../langswitch'
import SearchButton from '../search/SearchButton'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { motion } from 'framer-motion'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '../langswitch/icon'

// Hidden while empty: the /videos nav link only shows once the first
// video is published (see data/videosData.ts).
const visibleLinks = headerNavLinks.filter(
  (link) => link.href !== '/videos' || videosData.length > 0
)

// Home is rendered separately (as the site title), so it's excluded here.
const navLinks = visibleLinks.filter((link) => link.href !== '/')

// Below 1300px the full nav + icon row no longer fits without crowding the
// title, so only the first few links stay inline and the rest collapse
// into a "More" menu.
const PRIMARY_LINK_COUNT = 3
const primaryNavLinks = navLinks.slice(0, PRIMARY_LINK_COUNT)
const overflowNavLinks = navLinks.slice(PRIMARY_LINK_COUNT)

const Header = () => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const pathname = usePathname()

  const isLinkSelected = (href: string) => {
    const segments = pathname?.split('/').filter(Boolean) ?? []
    // segments[0] may be the locale ('pt'); strip it
    const pathWithoutLocale = '/' + segments.filter((s) => s !== locale).join('/')
    return pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
  }

  const renderNavLink = (link: { href?: string; title: string }) => {
    const isSelected = isLinkSelected(link.href!)
    return (
      <Link
        key={link.title}
        href={`/${locale}${link.href}`}
        aria-current={isSelected ? 'page' : undefined}
        className="flex transform-gpu items-center space-x-1 transition-transform duration-300"
      >
        <div
          className={`hidden font-medium ${
            isSelected
              ? 'text-heading-100 dark:text-heading-500'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          } relative rounded-md px-2 py-1 font-medium transition-colors sm:block`}
        >
          <span className="relative z-10">{t(`${link.title.toLowerCase()}`)}</span>
          {isSelected && (
            <motion.span
              layoutId="tab"
              transition={{ type: 'spring', duration: 0.4 }}
              className="absolute inset-0 z-0 rounded-md bg-gray-100 dark:bg-gray-600"
            ></motion.span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur dark:bg-gray-900/75">
      <div className="flex items-center justify-between gap-4 py-6">
        <div>
          <Link href={`/${locale}/`} aria-label={siteMetadata.headerTitle}>
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {typeof siteMetadata.headerTitle === 'string' ? (
                <div className="hidden h-6 shrink-0 whitespace-nowrap text-2xl font-semibold sm:block">
                  {siteMetadata.headerTitle}
                </div>
              ) : (
                siteMetadata.headerTitle
              )}
            </motion.div>
          </Link>
        </div>
        <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
          {primaryNavLinks.map(renderNavLink)}
          <div className="hidden items-center space-x-4 sm:space-x-6 min-[1300px]:flex">
            {overflowNavLinks.map(renderNavLink)}
            <AuthorsMenu className="hidden min-[1300px]:block" />
          </div>
          {overflowNavLinks.length > 0 && (
            <Menu as="div" className="relative inline-block text-left min-[1300px]:hidden">
              {({ open }) => (
                <>
                  <MenuButton
                    className="hidden items-center space-x-1 rounded-md px-2 py-1 font-medium text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-100 sm:flex"
                    aria-haspopup="true"
                    aria-expanded={open}
                  >
                    <span>{t('more')}</span>
                    <ChevronDownIcon
                      className={`ml-1 mt-1 transform transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </MenuButton>
                  <Transition
                    show={open}
                    enter="transition-all ease-out duration-300"
                    enterFrom="opacity-0 scale-95 translate-y-[-10px]"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="transition-all ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 translate-y-[10px]"
                  >
                    <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-600 dark:bg-gray-800">
                      <div className="p-1">
                        {overflowNavLinks.map((link) => {
                          const isSelected = isLinkSelected(link.href!)
                          return (
                            <MenuItem key={link.title}>
                              <Link
                                href={`/${locale}${link.href}`}
                                aria-current={isSelected ? 'page' : undefined}
                                className={`${
                                  isSelected
                                    ? 'text-primary-600 dark:text-primary-300'
                                    : 'text-gray-700 dark:text-white'
                                } flex w-full items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900 dark:hover:text-primary-300`}
                              >
                                {t(`${link.title.toLowerCase()}`)}
                              </Link>
                            </MenuItem>
                          )
                        })}
                        <AuthorsMenu className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-primary-50 hover:text-primary-600 dark:text-white dark:hover:bg-primary-900 dark:hover:text-primary-300" />
                      </div>
                    </MenuItems>
                  </Transition>
                </>
              )}
            </Menu>
          )}
          <SearchButton />
          <ThemeSwitch />
          <LangSwitch />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
