'use client'

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { JOB_STATUS } from "@/types/types"

type SearchResult = {
    id: string
    name: string
    components: Array<{
        name: string
        status: string
        sequence: number
    }>
}

export default function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm)
    const [open, setOpen] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([])

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch search results
    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedTerm) {
                setResults([])
                return
            }

            try {
                const response = await fetch(`/api/jobs?search=${debouncedTerm}`)
                if (!response.ok) throw new Error('Failed to fetch results')
                const data = await response.json()
                setResults(data.paginatedJobs)
                setOpen(true)
            } catch (error) {
                console.error('Error fetching results:', error)
                setResults([])
            }
        }

        fetchResults()
    }, [debouncedTerm])

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case JOB_STATUS.DRAFT:
                return "bg-gray-500 hover:bg-gray-600"
            case JOB_STATUS.IN_PROGRESS:
                return "bg-blue-500 hover:bg-blue-600"
            case JOB_STATUS.DONE:
                return "bg-green-500 hover:bg-green-600"
            default:
                return "bg-gray-500 hover:bg-gray-600"
        }
    }

    const handleSelect = (componentName: string) => {
        router.push(`/component/${encodeURIComponent(componentName)}`)
        setOpen(false)
        setSearchTerm('')
    }

    return (
        <div className="relative w-full max-w-sm">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative flex items-center">
                        <Search className="absolute left-2 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="ค้นหางาน / Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-8"
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 h-full px-2 hover:bg-transparent"
                                onClick={() => {
                                    setSearchTerm('')
                                    setOpen(false)
                                }}
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                    <Command>
                        <CommandList>
                            <CommandEmpty>ไม่พบผลลัพธ์ / No results found.</CommandEmpty>
                            {results.map((job) => (
                                <CommandGroup key={job.id} heading={job.name}>
                                    {job.components.map((component) => (
                                        <CommandItem
                                            key={`${job.id}-${component.name}`}
                                            onSelect={() => handleSelect(component.name)}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{component.sequence + 1}. {component.name}</span>
                                            </div>
                                            <Badge className={getStatusBadgeStyle(component.status)}>
                                                {component.status}
                                            </Badge>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
} 