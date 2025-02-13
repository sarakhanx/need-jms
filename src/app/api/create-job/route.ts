import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { JOB_STATUS, HouseComponent } from "@/types/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Transform components to include status, timestamps and time tracking
        const components = body.components.map((comp: HouseComponent) => ({
            ...comp,
            id: crypto.randomUUID(),
            status: JOB_STATUS.DRAFT,
            startedAt: null,
            finishedAt: null,
            totalTimeSpent: 0,
            pausedAt: null,
            pauseHistory: [],
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }));

        // Create the job in the database
        const job = await prisma.job.create({
            data: {
                name: body.jobName,
                model: body.model,
                components: components,
                createdAt: new Date(body.createdAt),
                updatedAt: new Date(body.updatedAt),
                deadline: new Date(body.deadline),
                startDate: new Date(body.startDate),
                status: body.status,
                respUser: body.respUser
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json(
            { error: 'Failed to create job' },
            { status: 500 }
        );
    }
}