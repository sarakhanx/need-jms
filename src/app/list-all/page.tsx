'use client'

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { th } from 'date-fns/locale'
import { JOB_STATUS, Job, JobComponent } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"


const getStatusBadgeStyle = (status: Job['status']) => {
    switch (status) {
        case JOB_STATUS?.DRAFT:
            return "bg-[hsl(var(--chart-3))] text-white hover:bg-[hsl(var(--chart-3))]"
        case JOB_STATUS?.IN_PROGRESS:
            return "bg-[hsl(var(--chart-2))] text-white hover:bg-[hsl(var(--chart-2))]"
        case JOB_STATUS?.DONE:
            return "bg-[hsl(var(--chart-1))] text-white hover:bg-[hsl(var(--chart-1))]"
        default:
            return "bg-[hsl(var(--chart-4))] text-white hover:bg-[hsl(var(--chart-4))]"
    }
}

export default function JobListPage() {
    const { toast } = useToast()
    const [jobs, setJobs] = useState<Job[]>([])
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "deadline",
            desc: false
        }
    ])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)

    const sortJobs = (jobs: Job[]) => {
        if (!sorting.length) return jobs

        return [...jobs].sort((a, b) => {
            const { id, desc } = sorting[0]
            
            switch (id) {
                case 'name':
                case 'model':
                case 'respUser':
                case 'status':
                    return desc
                        ? (b[id] || '').localeCompare(a[id] || '')
                        : (a[id] || '').localeCompare(b[id] || '')
                case 'startDate':
                case 'deadline':
                    const dateA = new Date(a[id]).getTime()
                    const dateB = new Date(b[id]).getTime()
                    return desc ? dateB - dateA : dateA - dateB
                default:
                    return 0
            }
        })
    }

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/jobs?page=${currentPage}&pageSize=${pageSize}`,{cache: 'no-store'})
            if (!response.ok) {
                throw new Error('Failed to fetch jobs')
            }
            const data = await response.json()
            let transformedJobs = data.paginatedJobs.map((job: Job) => ({
                ...job,
                startDate: new Date(job?.startDate),
                deadline: new Date(job?.deadline),
                finished: job?.finished ? new Date(job?.finished) : undefined,
                createdAt: new Date(job?.createdAt),
                updatedAt: new Date(job?.updatedAt)
            }))

            transformedJobs = sortJobs(transformedJobs)
            
            setJobs(transformedJobs)
            setTotalPages(data.totalPages)
        } catch (err) {
            setError('Failed to load jobs')
            console.error('Error:', err)
            toast({
                variant: "destructive",
                description: "เกิดข้อผิดพลาดในการโหลดข้อมูล / Failed to load data",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [currentPage, pageSize, sorting])

    const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
        setUpdatingId(jobId)
        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus, id: jobId }),
            })

            if (!response.ok) {
                throw new Error('Failed to update status')
            }

            // Update local state
            setJobs(prevJobs =>
                prevJobs.map(job =>
                    job?.id === jobId ? { ...job, status: newStatus } : job
                )
            )
            toast({
                description: "อัพเดทสถานะสำเร็จ / Status updated successfully",
                variant: "default",
            })
        } catch (error) {
            console.error('Error updating status:', error)
            toast({
                description: "เกิดข้อผิดพลาดในการอัพเดทสถานะ / Failed to update status",
                variant: "destructive",
            })
        } finally {
            setUpdatingId(null)
        }
    }

    const columns: ColumnDef<Job>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
                        ชื่องาน / Job Name
                        {column?.getIsSorted() === "asc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
                        ) : column.getIsSorted() === "desc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 15 6-6 6 6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-0 group-hover:opacity-100"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                    </div>
                )
            },
            sortingFn: "text"
        },
        {
            accessorKey: "model",
            header: ({ column }) => {
                return (
                    <div className="flex items-center cursor-pointer" onClick={() => column?.toggleSorting()}>
                        โมเดล / Model
                        {column?.getIsSorted() === "asc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
                        ) : column?.getIsSorted() === "desc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 15 6-6 6 6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-0 group-hover:opacity-100"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                    </div>
                )
            },
            sortingFn: "text"
        },
        {
            accessorKey: "components",
            header: "รายการงาน / Components",
            cell: ({ row }) => {
                const components = row.original.components

                return (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                ดูรายการ / View List ({components.length})
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[800px]">
                            <DialogHeader>
                                <DialogTitle>รายการงานทั้งหมด / All Components</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4">
                                {components.map((comp: JobComponent) => (
                                    <div key={comp.sequence} className="flex items-center justify-between p-2 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">
                                                {comp.sequence + 1}. {comp.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {comp.description}
                                            </p>
                                        </div>
                                        <Link 
                                            href={`/component/${encodeURIComponent(comp.name)}`}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            รายละเอียด / Details →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                )
            },
        },
        {
            accessorKey: "startDate",
            header: ({ column }) => {
                return (
                    <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
                        วันที่เริ่ม / Start Date
                        {column?.getIsSorted() === "asc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
                        ) : column?.getIsSorted() === "desc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 15 6-6 6 6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-0 group-hover:opacity-100"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                    </div>
                )
            },
            cell: ({ row }) => {
                return format(new Date(row.original.startDate), 'dd MMMM yyyy', { locale: th })
            },
            sortingFn: "datetime"
        },
        {
            accessorKey: "deadline",
            header: ({ column }) => {
                return (
                    <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
                        กำหนดส่ง / Deadline
                        {column?.getIsSorted() === "asc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
                        ) : column?.getIsSorted() === "desc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 15 6-6 6 6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-0 group-hover:opacity-100"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                    </div>
                )
            },
            cell: ({ row }) => {
                return format(new Date(row.original.deadline), 'dd MMMM yyyy', { locale: th })
            },
            sortingFn: "datetime"
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
                        สถานะ / Status
                        {column?.getIsSorted() === "asc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
                        ) : column?.getIsSorted() === "desc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 15 6-6 6 6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-0 group-hover:opacity-100"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                    </div>
                )
            },
            cell: ({ row }) => {
                const status = row.original.status
                const isUpdating = updatingId === row.original.id

                return (
                    <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeStyle(status)}>
                            {status === JOB_STATUS?.DRAFT && "แบบร่าง / Draft"}
                            {status === JOB_STATUS?.IN_PROGRESS && "กำลังดำเนินการ / In Progress"}
                            {status === JOB_STATUS?.DONE && "เสร็จสิ้น / Done"}
                        </Badge>
                        <Select
                            value={status}
                            onValueChange={(value) => handleStatusChange(row.original.id, value as Job['status'])}
                            disabled={isUpdating}
                        >
                            <SelectTrigger className="w-8 h-8">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={JOB_STATUS?.DRAFT}>
                                    แบบร่าง / Draft
                                </SelectItem>
                                <SelectItem value={JOB_STATUS?.IN_PROGRESS}>
                                    กำลังดำเนินการ / In Progress
                                </SelectItem>
                                <SelectItem value={JOB_STATUS?.DONE}>
                                    เสร็จสิ้น / Done
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )
            },
            sortingFn: "text"
        },
        {
            accessorKey: "respUser",
            header: ({ column }) => {
                return (
                    <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting()}>
                        ผู้รับผิดชอบ / Responsible
                        {column?.getIsSorted() === "asc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
                        ) : column?.getIsSorted() === "desc" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 15 6-6 6 6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-0 group-hover:opacity-100"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                    </div>
                )
            },
            sortingFn: "text"
        },
    ]

    const table = useReactTable({
        data: jobs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    })

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">กำลังโหลด... / Loading...</div>
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">รายการงานทั้งหมด / All Jobs</h1>
            </div>
            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader className="bg-muted">
                        {table?.getHeaderGroups()?.map((headerGroup) => (
                            <TableRow key={headerGroup?.id} className="hover:bg-muted/50">
                                {headerGroup?.headers?.map((header) => {
                                    return (
                                        <TableHead key={header?.id} className="text-muted-foreground">
                                            {header?.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header?.column?.columnDef?.header,
                                                    header?.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row?.id}
                                    data-state={row?.getIsSelected() && "selected"}
                                    className="hover:bg-muted/50"
                                >
                                    {row?.getVisibleCells()?.map((cell) => (
                                        <TableCell key={cell?.id} className="text-card-foreground">
                                            {flexRender(
                                                cell?.column?.columnDef?.cell,
                                                cell?.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns?.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    ไม่พบข้อมูล / No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="hover:bg-muted/50"
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(page)}
                                        isActive={currentPage === page}
                                        className={currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="hover:bg-muted/50"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
} 