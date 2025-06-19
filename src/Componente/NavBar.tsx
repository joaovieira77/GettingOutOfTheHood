'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/homepage', icon: HomeIcon },
    { label: 'Stats', href: '/stats', icon: WrappedIcon },
    { label: 'Profile', href: '/profile', icon: ProfileIcon }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-[#1e0f29] border-t border-[#3b2d47] shadow-inner z-50">
      <div className="flex justify-around items-center h-14">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ───── Icons (Replace with your preferred icons or packages) ─────

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 12l9-9 9 9M4 10v10h5v-6h6v6h5V10" />
    </svg>
  )
}

function WrappedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3v18m9-9H3" />
    </svg>
  )
}

function ProfileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5.121 17.804A9 9 0 1119.78 6.222M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
