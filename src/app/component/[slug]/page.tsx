import { notFound } from "next/navigation";
import { Job } from "@/types/types";
import ComponentDetail from "./client";
import  allComponents  from "@/datas/components.js";


type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

async function getComponentJobs(componentName: string) {
    try {
        const url = new URL('/api/jobs', 'http://localhost:3000')
        url.searchParams.append('componentName', componentName)

        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (!response.ok) throw new Error('Failed to fetch jobs')
        const data = await response.json()
        return data.jobs as Job[]
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return []
    }
}

export default async function ComponentDetailPage({ params }: PageProps) {
    const resolvedParams = await params
    const slug = String(resolvedParams.slug)
    
    let component = allComponents.find(comp => comp.name === slug)
    if (!component) {
        const decodedSlug = decodeURIComponent(slug)
        component = allComponents.find(comp => comp.name === decodedSlug)
    }

    if (!component) {
        notFound()
    }

    const jobs = await getComponentJobs(component.name)

    // ส่ง props ไปให้ client component
    return <ComponentDetail component={component} initialJobs={jobs} />
} 