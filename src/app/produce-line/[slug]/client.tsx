'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JOB_STATUS, Job, JobComponent, StatusCount, SortConfig, PaginatedData, ApiJob } from '@/types/types'
import { notFound } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

function getStatusBadgeStyle(status: string) {
    switch (status) {
        case JOB_STATUS.DRAFT:
            return "bg-[hsl(var(--chart-3))] text-white hover:bg-[hsl(var(--chart-3))]"
        case JOB_STATUS.IN_PROGRESS:
            return "bg-[hsl(var(--chart-2))] text-white hover:bg-[hsl(var(--chart-2))]"
        case JOB_STATUS.DONE:
            return "bg-[hsl(var(--chart-1))] text-white hover:bg-[hsl(var(--chart-1))]"
        default:
            return "bg-[hsl(var(--chart-4))] text-white hover:bg-[hsl(var(--chart-4))]"
    }
}

type ProductionLineClientProps = {
    componentName: string
}

export default function ProductionLineClient({ componentName }: ProductionLineClientProps) {
    const { toast } = useToast()
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [showCompleted, setShowCompleted] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [data, setData] = useState<PaginatedData>()
    const [sortConfig, setSortConfig] = useState<SortConfig>({ 
        key: 'deadline',
        direction: 'asc'
    })

    // Add page size options
    const pageSizeOptions = [10, 20, 50, 100]

    // Modify fetchData to include sorting parameters
    const fetchData = async () => {
        try {
            const response = await fetch(
                `/api/jobs?page=${currentPage}&pageSize=${pageSize}&componentName=${componentName}&showCompleted=${showCompleted}&sortField=${sortConfig.key}&sortDirection=${sortConfig.direction}`,
                {cache: 'no-store'}
            )
            if (!response.ok) throw new Error('Failed to fetch jobs')
            const responseData = await response.json()

            const statusCounts: StatusCount = {
                [JOB_STATUS.DRAFT]: 0,
                [JOB_STATUS.IN_PROGRESS]: 0,
                [JOB_STATUS.DONE]: 0
            }

            responseData.jobs.forEach((job: ApiJob) => {
                const components = job.components || []
                components.forEach((comp) => {
                    if (comp.name === componentName && statusCounts[comp.status] !== undefined) {
                        statusCounts[comp.status]++
                    }
                })
            })

            const transformedJobs = responseData.paginatedJobs.map((job: ApiJob) => ({
                id: job.id,
                name: job.name,
                model: job.model,
                startDate: new Date(job.startDate),
                deadline: new Date(job.deadline),
                status: job.status,
                respUser: job.respUser,
                components: (job.components || []).map((comp) => ({
                    id: comp.id || '',
                    jobId: job.id,
                    name: comp.name,
                    sequence: comp.sequence,
                    description: comp.description,
                    status: comp.status || JOB_STATUS.DRAFT,
                    startedAt: comp.startedAt ? new Date(comp.startedAt) : null,
                    finishedAt: comp.finishedAt ? new Date(comp.finishedAt) : null,
                    updatedAt: comp.updatedAt ? new Date(comp.updatedAt) : new Date(),
                    createdAt: comp.createdAt ? new Date(comp.createdAt) : new Date(),
                    totalTimeSpent: comp.totalTimeSpent || 0,
                    pausedAt: comp.pausedAt ? new Date(comp.pausedAt) : undefined
                }))
            }))

            setData({
                jobs: transformedJobs,
                total: responseData.total,
                statusCounts,
                totalPages: responseData.totalPages
            })
        } catch (error) {
            console.error('Error fetching data:', error)
            toast({
                variant: "destructive",
                description: "เกิดข้อผิดพลาดในการโหลดข้อมูล / Failed to load data",
            })
        }
    }

    const handleSort = (key: string) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const SortIndicator = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return null
        return sortConfig.direction === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 15 6-6 6 6"/></svg>
        )
    }

    useEffect(() => {
        fetchData()
    }, [currentPage, pageSize, showCompleted, sortConfig, componentName])

    if (!data) {
        return <div>Loading...</div>
    }

    const { jobs, total, statusCounts } = data

    if (total === 0) {
        notFound()
    }

    const handleStatusChange = async (componentId: string, newStatus: string) => {
        setUpdatingId(componentId)
        try {
            const response = await fetch(`/api/jobs/components/${componentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus , id: componentId }),
            })

            if (!response.ok) {
                throw new Error('Failed to update status')
            }

            toast({
                description: "อัพเดทสถานะสำเร็จ / Status updated successfully",
            })

            // Refresh data
            fetchData()
        } catch (error) {
            console.error('Error updating status:', error)
            toast({
                variant: "destructive",
                description: "เกิดข้อผิดพลาดในการอัพเดทสถานะ / Failed to update status",
            })
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        สายการผลิต: {componentName}
                    </CardTitle>
                    <CardDescription>
                        Production Line: {componentName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">ยังไม่ได้ดำเนินการ / Not Started</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {statusCounts[JOB_STATUS.DRAFT]}
                                </div>
                                <p className="text-sm text-gray-500">งาน / Jobs</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">กำลังดำเนินการ / In Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-500">
                                    {statusCounts[JOB_STATUS.IN_PROGRESS]}
                                </div>
                                <p className="text-sm text-gray-500">งาน / Jobs</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">เสร็จสิ้น / Completed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-500">
                                    {statusCounts[JOB_STATUS.DONE]}
                                </div>
                                <p className="text-sm text-gray-500">งาน / Jobs</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>รายการงานทั้งหมด / All Jobs</CardTitle>
                            <CardDescription>
                                แสดงเฉพาะงานที่มีส่วนประกอบ &quot;{componentName}&quot; / Showing jobs containing &quot;{componentName}&quot; component
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={showCompleted}
                                    onChange={(e) => setShowCompleted(e.target.checked)}
                                    className="h-4 w-4 rounded border-input bg-background"
                                />
                                <span className="text-muted-foreground">แสดงงานที่เสร็จแล้ว / Show completed</span>
                            </label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span>แสดง / Show:</span>
                                <Select
                                    value={pageSize.toString()}
                                    onValueChange={(value) => {
                                        setPageSize(Number(value))
                                        setCurrentPage(1) // Reset to first page when changing page size
                                    }}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue>{pageSize}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pageSizeOptions.map(size => (
                                            <SelectItem key={size} value={size.toString()}>
                                                {size} แถว / rows
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span>ต่อหน้า / per page</span>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                                        <div className="flex items-center">
                                            ชื่องาน / Job Name
                                            <SortIndicator column="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('model')} className="cursor-pointer">
                                        <div className="flex items-center">
                                            โมเดล / Model
                                            <SortIndicator column="model" />
                                        </div>
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('startDate')} className="cursor-pointer">
                                        <div className="flex items-center">
                                            วันที่เริ่ม / Start Date
                                            <SortIndicator column="startDate" />
                                        </div>
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('deadline')} className="cursor-pointer">
                                        <div className="flex items-center">
                                            กำหนดส่ง / Deadline
                                            <SortIndicator column="deadline" />
                                        </div>
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                                        <div className="flex items-center">
                                            สถานะงาน / Job Status
                                            <SortIndicator column="status" />
                                        </div>
                                    </TableHead>
                                    <TableHead>สถานะ Component / Component Status</TableHead>
                                    <TableHead>เวลาทำงาน / Time Spent</TableHead>
                                    <TableHead onClick={() => handleSort('respUser')} className="cursor-pointer">
                                        <div className="flex items-center">
                                            ผู้รับผิดชอบ / Responsible
                                            <SortIndicator column="respUser" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.filter(job => {
                                    const component = job.components.find((c: JobComponent) => c.name === componentName);
                                    return showCompleted || (component && component.status !== JOB_STATUS.DONE);
                                }).map((job: Job) => {
                                    const component = job.components.find((c: JobComponent) => c.name === componentName)
                                    if (!component) return null

                                    return (
                                        <TableRow key={job.id}>
                                            <TableCell>{job.name}</TableCell>
                                            <TableCell>{job.model}</TableCell>
                                            <TableCell>
                                                {format(new Date(job.startDate), 'dd MMMM yyyy', { locale: th })}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(job.deadline), 'dd MMMM yyyy', { locale: th })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeStyle(job.status)}>
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusBadgeStyle(component.status)}>
                                                        {component.status}
                                                    </Badge>
                                                    <Select
                                                        value={component.status}
                                                        onValueChange={(value) => handleStatusChange(component.id, value)}
                                                        disabled={updatingId === component.id}
                                                    >
                                                        <SelectTrigger className="w-8 h-8">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={JOB_STATUS.DRAFT}>
                                                                แบบร่าง / Draft
                                                            </SelectItem>
                                                            <SelectItem value={JOB_STATUS.IN_PROGRESS}>
                                                                กำลังดำเนินการ / In Progress
                                                            </SelectItem>
                                                            <SelectItem value={JOB_STATUS.DONE}>
                                                                เสร็จสิ้น / Done
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {component.totalTimeSpent > 0 && (
                                                        <div>
                                                            <span className="font-medium">เวลารวม / Total:</span>{' '}
                                                            {Math.floor(component.totalTimeSpent / 60)}h {component.totalTimeSpent % 60}m
                                                        </div>
                                                    )}
                                                    {component.startedAt && (
                                                        <div className="text-sm text-gray-500">
                                                            <span className="font-medium">เริ่ม / Started:</span>{' '}
                                                            {format(new Date(component.startedAt), 'dd/MM/yyyy HH:mm')}
                                                        </div>
                                                    )}
                                                    {component.finishedAt && (
                                                        <div className="text-sm text-gray-500">
                                                            <span className="font-medium">เสร็จ / Finished:</span>{' '}
                                                            {format(new Date(component.finishedAt), 'dd/MM/yyyy HH:mm')}
                                                        </div>
                                                    )}
                                                    {component.pausedAt && (
                                                        <div className="text-sm text-yellow-600">
                                                            <span className="font-medium">หยุดชั่วคราว / Paused:</span>{' '}
                                                            {format(new Date(component.pausedAt), 'dd/MM/yyyy HH:mm')}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{job.respUser}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        {data && data.totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        />
                                    </PaginationItem>
                                    
                                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(page)}
                                                isActive={currentPage === page}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext 
                                            onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                                            disabled={currentPage === data.totalPages}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 