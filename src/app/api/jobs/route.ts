import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { JobComponent } from "@/types/types";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')
        const componentName = searchParams.get('componentName')
        const showCompleted = searchParams.get('showCompleted') === 'true'
        const sortField = searchParams.get('sortField') || 'deadline'
        const sortDirection = searchParams.get('sortDirection') || 'asc'
        const searchTerm = searchParams.get('search') || ''
        
        const skip = (page - 1) * pageSize

        // Get all jobs for counting
        const allJobs = await prisma.job.findMany()

        // Filter jobs by search term and component if specified
        let filteredJobs = allJobs
        if (searchTerm) {
            filteredJobs = filteredJobs.filter(job => 
                job.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        if (componentName) {
            filteredJobs = filteredJobs.filter(job => {
                const components = job.components as Prisma.JsonArray;
                const jobComponents = components.map(comp => comp as unknown as JobComponent);
                const hasComponent = jobComponents.some(comp => 
                    comp.name === componentName && 
                    (showCompleted || comp.status !== 'DONE')
                )
                return hasComponent
            })
        }

        // Sort jobs
        filteredJobs.sort((a, b) => {
            switch (sortField) {
                case 'name':
                case 'model':
                case 'respUser':
                case 'status':
                    return sortDirection === 'asc'
                        ? (a[sortField] || '').localeCompare(b[sortField] || '')
                        : (b[sortField] || '').localeCompare(a[sortField] || '')
                case 'startDate':
                case 'deadline':
                    const dateA = new Date(a[sortField]).getTime()
                    const dateB = new Date(b[sortField]).getTime()
                    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
                case 'componentStatus':
                    if (!componentName) return 0
                    const componentsA = a.components as Prisma.JsonArray;
                    const componentsB = b.components as Prisma.JsonArray;
                    const jobComponentsA = componentsA.map(comp => comp as unknown as JobComponent);
                    const jobComponentsB = componentsB.map(comp => comp as unknown as JobComponent);
                    const compA = jobComponentsA.find(c => c.name === componentName)?.status || ''
                    const compB = jobComponentsB.find(c => c.name === componentName)?.status || ''
                    return sortDirection === 'asc'
                        ? compA.localeCompare(compB)
                        : compB.localeCompare(compA)
                default:
                    return 0
            }
        })

        // Get total count after filtering
        const totalJobs = filteredJobs.length

        // Get paginated jobs
        const paginatedJobs = filteredJobs.slice(skip, skip + pageSize)

        return NextResponse.json({
            jobs: filteredJobs, // All filtered jobs for status counting
            paginatedJobs, // Paginated jobs for display
            total: totalJobs,
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(totalJobs / pageSize)
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
} 