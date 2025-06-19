'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function NavBar() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/homepage', iconPath: '/icons/home.png' },
    { label: 'Stats', href: '/stats', iconPath: '/icons/audio-waves.png' },
    { label: 'Profile', href: '/profile', iconPath: '/icons/customer.png' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-[#1e0f29] border-t border-[#3b2d47] shadow-inner z-50"
     style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
      <div className="flex justify-around items-center h-14">
        {navItems.map(({ label, href, iconPath }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Image
                src={iconPath}
                alt={`${label} icon`}
                width={20}
                height={20}
                className="mb-1"
              />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
