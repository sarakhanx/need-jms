import { notFound } from "next/navigation";
import { Job } from "@/types/types";
import ComponentDetail from "./client";

// ย้าย models data มาไว้ในไฟล์
const allComponents = [
    // บ้าน 79K
    {
        sequence: 0,
        name: "โครงสร้างเหล็ก",
        description: "ทำการเชื่อมโครงสร้างเหล็กกัลวาไนซ์",
    },
    {
        sequence: 1,
        name: "ผนัง",
        description: "ทำการประกอบผนัง",
    },
    {
        sequence: 2,
        name: "พื้น",
        description: "ทำการปูพื้นด้วยบอร์ด 18mm.",
    },
    {
        sequence: 3,
        name: "ฝ้า",
        description: "ทำการติดตั้งฝ้า",
    },
    {
        sequence: 4,
        name: "ไฟฟ้า",
        description: "ทำการติดตั้งไฟฟ้า",
    },
    {
        sequence: 5,
        name: "หลังคา",
        description: "ทำการติดตั้งหลังคา",
    },
    {
        sequence: 6,
        name: "สุขภัณฑ์",
        description: "ทำการติดตั้งสุขภัณฑ์",
    },
    {
        sequence: 7,
        name: "ทำความสะอาดและ QC",
        description: "ทำการทำความสะอาดและ QC",
    },
]

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