'use client'

import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JOB_STATUS, Job, JobComponent, JobStatus } from "@/types/types";
import { useState, useEffect } from "react";

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

type ComponentDetailProps = {
    component: {
        sequence: number;
        name: string;
        description: string;
    };
    initialJobs: Job[];
}

export default function ComponentDetail({ component, initialJobs }: ComponentDetailProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [jobs, setJobs] = useState(initialJobs);
    const [statusCounts, setStatusCounts] = useState<Record<JobStatus, number>>({
        [JOB_STATUS.DRAFT]: 0,
        [JOB_STATUS.IN_PROGRESS]: 0,
        [JOB_STATUS.DONE]: 0
    });

    useEffect(() => {
        const counts = {
            [JOB_STATUS.DRAFT]: 0,
            [JOB_STATUS.IN_PROGRESS]: 0,
            [JOB_STATUS.DONE]: 0
        };

        jobs.forEach((job: Job) => {
            const comp = job.components.find((c: JobComponent) => c.name === component.name)
            if (comp?.status && comp.status in JOB_STATUS) {
                counts[comp.status as JobStatus]++
            }
        });

        setStatusCounts(counts);
    }, [jobs, component.name]);

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        ขั้นตอนที่ {component?.sequence + 1}: {component?.name}
                    </CardTitle>
                    <CardDescription>
                        Sequence {component?.sequence + 1}: {component?.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-semibold mb-2">รายละเอียด / Description:</h3>
                            <p className="text-gray-600">{component?.description}</p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-4">สถานะในงานต่างๆ / Status in Jobs:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">แบบร่าง / Draft</CardTitle>
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
                                        <CardTitle className="text-lg">เสร็จสิ้น / Done</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-500">
                                            {statusCounts[JOB_STATUS.DONE]}
                                        </div>
                                        <p className="text-sm text-gray-500">งาน / Jobs</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                {jobs.map((job: Job) => {
                                    const comp = job.components.find((c: JobComponent) => c.name === component?.name)
                                    return (
                                        <Card key={job.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold">{job?.name}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {job?.model} - {job?.respUser}
                                                        </p>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            <span className="font-medium">เริ่ม / Start:</span>{' '}
                                                            {format(new Date(job?.startDate || ''), 'dd MMMM yyyy', { locale: th })}
                                                            {' • '}
                                                            <span className="font-medium">กำหนดส่ง / Deadline:</span>{' '}
                                                            {format(new Date(job?.deadline || ''), 'dd MMMM yyyy', { locale: th })}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge className={getStatusBadgeStyle(comp?.status || '')}>
                                                            {comp?.status || ''}
                                                        </Badge>
                                                        {comp?.totalTimeSpent && comp?.totalTimeSpent > 0 && (
                                                            <span className="text-sm text-gray-500">
                                                                เวลาทำงาน / Time spent: {Math.floor(comp?.totalTimeSpent / 60)}h {comp?.totalTimeSpent % 60}m
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 