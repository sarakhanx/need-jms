import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { JOB_STATUS, } from "@/types/types";
import { Prisma } from "@prisma/client";

type JobComponent = {
    id: string;
    status: string;
    startedAt?: string;
    finishedAt?: string;
    pausedAt: string | null;
    pauseHistory: Array<{
        startedAt: string;
        finishedAt: string | null;
    }>;
    totalTimeSpent?: number;
    updatedAt: string;
}

export async function PATCH(
    request: NextRequest,
    // { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status , id } = body;
        
        // Await params first
        // const resolvedParams = await params;
        // const id = String(resolvedParams.id);

        // Find the job that contains this component
        const jobs = await prisma.job.findMany();
        let jobToUpdate = null;
        let componentToUpdate = null;

        for (const job of jobs) {
            const components = (job.components as Prisma.JsonArray).map(comp => ({
                ...(comp as JobComponent),
                pauseHistory: (comp as JobComponent).pauseHistory || []
            }));
            const component = components.find(c => c.id === id);
            if (component) {
                jobToUpdate = job;
                componentToUpdate = component;
                break;
            }
        }

        if (!jobToUpdate || !componentToUpdate) {
            return NextResponse.json(
                { error: 'Component not found' },
                { status: 404 }
            );
        }

        const now = new Date().toISOString();
        const updatedComponent = { 
            ...componentToUpdate,
            pauseHistory: componentToUpdate.pauseHistory || []
        };

        // Handle time tracking based on status change
        if (status === JOB_STATUS.IN_PROGRESS && componentToUpdate.status !== JOB_STATUS.IN_PROGRESS) {
            // Starting work
            updatedComponent.startedAt = now;
            updatedComponent.pausedAt = null;
        } else if (status === JOB_STATUS.DONE && componentToUpdate.status !== JOB_STATUS.DONE) {
            // Finishing work
            updatedComponent.finishedAt = now;
            // Calculate total time spent
            if (updatedComponent.startedAt) {
                const startTime = new Date(updatedComponent.startedAt).getTime();
                const endTime = new Date(now).getTime();
                const totalPauseTime = updatedComponent.pauseHistory.reduce((total: number, pause) => {
                    if (pause.finishedAt) {
                        return total + (new Date(pause.finishedAt).getTime() - new Date(pause.startedAt).getTime());
                    }
                    return total;
                }, 0);
                
                updatedComponent.totalTimeSpent = Math.floor((endTime - startTime - totalPauseTime) / (1000 * 60)); // Convert to minutes
            }
        } else if (status === JOB_STATUS.DRAFT && componentToUpdate.status === JOB_STATUS.IN_PROGRESS) {
            // Pausing work
            updatedComponent.pausedAt = now;
            updatedComponent.pauseHistory.push({ startedAt: now, finishedAt: null });
        } else if (status === JOB_STATUS.IN_PROGRESS && componentToUpdate.status === JOB_STATUS.DRAFT) {
            // Resuming work
            if (updatedComponent.pausedAt && updatedComponent.pauseHistory.length > 0) {
                const lastPause = updatedComponent.pauseHistory[updatedComponent.pauseHistory.length - 1];
                if (!lastPause.finishedAt) {
                    lastPause.finishedAt = now;
                }
            }
            updatedComponent.pausedAt = null;
        }

        // Update the component
        updatedComponent.status = status;
        updatedComponent.updatedAt = now;

        // Update the job with new components
        const updatedComponents = (jobToUpdate.components as Prisma.JsonArray)
            .map(comp => (comp as JobComponent).id === id ? updatedComponent : comp);

        const updatedJob = await prisma.job.update({
            where: {
                id: jobToUpdate.id
            },
            data: {
                components: updatedComponents as unknown as Prisma.InputJsonValue[],
                updatedAt: new Date()
            }
        });

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error('Error updating component:', error);
        return NextResponse.json(
            { error: 'Failed to update component' },
            { status: 500 }
        );
    }
} 