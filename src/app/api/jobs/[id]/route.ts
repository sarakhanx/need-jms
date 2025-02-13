import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
) {
    try {
        const body = await request.json();
        const { status, id } = body;

        // Await params first
        // const { id } = await params;
        // const resolvedParams =  params;  
        // const id = String(resolvedParams.id);

        const updatedJob = await prisma.job.update({
            where: {
                id : id
            },
            data: {
                status,
                updatedAt: new Date()  
            }
        });

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        return NextResponse.json(
            { error: 'Failed to update job' }, 
            { status: 500 }
        );
    }
}