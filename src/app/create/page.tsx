import CreateJob from "@/components/forms/CreateJob";
import {Suspense} from "react";

export default function Create() {

    return (
        <>
        <div className="flex flex-col gap-4 items-center justify-center">

         <h1 className="text-2xl font-bold">Create Job</h1>
        <div className="flex justify-center items-center">
            <Suspense fallback={<div>Loading...</div>}>
                <CreateJob />
            </Suspense>
        </div>
        </div>
        </>
    )
}