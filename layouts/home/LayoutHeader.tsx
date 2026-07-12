import React from 'react'

interface LayoutHeaderProps {
  title: string
  description?: string
}

const LayoutHeader: React.FC<LayoutHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-heading-50 dark:text-heading-400 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  )
}

export default LayoutHeader
