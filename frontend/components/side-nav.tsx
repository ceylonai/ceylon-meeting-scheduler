"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Users, FileEdit, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Meetings",
    href: "/meetings",
    icon: FileEdit,
  },
  {
    name: "Participants",
    href: "/participants",
    icon: Users,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Scheduling",
    href: "/scheduling",
    icon: Calendar,
  },
]

export function SideNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-background transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center border-b px-6">
          <h1 className="text-xl font-bold">Meeting Scheduler</h1>
        </div>
        <nav className="space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

