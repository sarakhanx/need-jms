'use client'

import Link from "next/link"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SearchBar from "./SearchBar"
import { useState, Suspense } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import allComponents from "@/datas/components.js"
import { usePathname } from 'next/navigation'

const menu = [
    {label : "Dashboard", href : "/"},
    {label : "List All", href : "/list-all"},
    {label : "Create", href : "/create"},
]

// menu สายการผลิต / Production Lines
const components = allComponents;
// เรียงลำดับตาม sequence เลย ไม่ต้องใช้ useState และ useEffect
const uniqueComponents = Array.from(new Set(components.map(comp => comp.name)))
    .sort((a, b) => {
        const compA = components.find(c => c.name === a)
        const compB = components.find(c => c.name === b)
        return (compA?.sequence || 0) - (compB?.sequence || 0)
    })

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Function to get active component name from path
    const getActiveComponent = () => {
        if (pathname.startsWith('/produce-line/')) {
            const decodedPath = decodeURIComponent(pathname.split('/').pop() || '')
            if (uniqueComponents.includes(decodedPath)) {
                return decodedPath
            }
        }
        return null
    }

    const activeComponent = getActiveComponent()

    return (
        <div className="border-b">
            <div className="flex flex-col md:flex-row justify-between items-center p-4 max-w-7xl mx-auto">
                <div className="w-full md:w-auto flex items-center justify-between md:gap-8 mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold">JOB SYSTEM</h1>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                        >
                            {isOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="w-full md:w-auto mb-4 md:mb-0">
                    <Suspense fallback={<div>Loading...</div>}>
                        <SearchBar />
                    </Suspense>
                </div>

                <nav className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto gap-4 items-center`}>
                    {menu.map((item) => (
                        <div key={item.label} className="w-full md:w-auto">
                            <Link href={item.href} className="w-full">
                                <Button className="w-full md:w-auto">{item.label}</Button>
                            </Link>
                        </div>
                    ))}
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                {activeComponent ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 bg-primary rounded-full" />
                                        {activeComponent}
                                    </span>
                                ) : (
                                    "สายการผลิต / Production Lines"
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            {uniqueComponents.map((name) => (
                                <DropdownMenuItem 
                                    key={name} 
                                    asChild
                                    className={name === activeComponent ? "bg-muted" : ""}
                                >
                                    <Link 
                                        href={`/produce-line/${encodeURIComponent(name)}`}
                                        className="w-full"
                                    >
                                        <p className="text-sm font-bold -tracking-tighter">
                                            {name === activeComponent && (
                                                <span className="mr-2">•</span>
                                            )}
                                            {name}
                                        </p>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
            </div>
        </div>
    )
}

export default Navbar;