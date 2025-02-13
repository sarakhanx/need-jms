'use client'

import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { useState } from "react";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FormData, JOB_STATUS, JobStatus, HouseModel, HouseComponent } from "@/types/types";
import { Card, CardContent } from "../ui/card";
const models79k: HouseModel = {
    components: [
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
            name: "ทำความสะอาดและ QC",
            description: "ทำการทำความสะอาดและ QC",
        },
    ],
    status: "ร่าง",
    resp_user: {
        id: 1,
        name: "สมชาย ใจดี",
        email: "somchai@gmail.com",
        phone: "081234567890",
    },
}

export const models109k: HouseModel = {
    components: [
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
            name: "ทำความสะอาดและ QC",
            description: "ทำการทำความสะอาดและ QC",
        },
    ],
    status: "ร่าง",
    resp_user: {
        id: 1,
        name: "สมชาย ใจดี",
        email: "somchai@gmail.com",
        phone: "081234567890",
    },
}

export const models129k: HouseModel = {
    components: [
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
    ],
    status: "ร่าง",
    resp_user: {
        id: 1,
        name: "สมชาย ใจดี",
        email: "somchai@gmail.com",
        phone: "081234567890",
    },
}

export const models139k: HouseModel = {
    components: [
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
    ],
    status: "ร่าง",
    resp_user: {
        id: 1,
        name: "สมชาย ใจดี",
        email: "somchai@gmail.com",
        phone: "081234567890",
    },
} 

const CreateJob = () => {
    
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState<HouseModel | null>(null);
    const [modelName, setModelName] = useState<string>("");
    const [formData, setFormData] = useState<FormData>({
        jobName: "",
        startDate: "",
        deadline: "",
        status: JOB_STATUS.DRAFT,
        respUser: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleModelSelect = (model: HouseModel, name: string) => {
        setSelectedModel(model);
        setModelName(name);
        setFormData(prev => ({
            ...prev,
            status: JOB_STATUS.DRAFT
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleStatusChange = (value: JobStatus) => {
        setFormData(prev => ({
            ...prev,
            status: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const jobData = {
                ...formData,
                model: modelName,
                components: selectedModel?.components || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await fetch('/api/create-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            if (!response.ok) {
                throw new Error('Failed to create job');
            }

            // Reset form and redirect
            setFormData({
                jobName: "",
                startDate: "",
                deadline: "",
                status: JOB_STATUS.DRAFT,
                respUser: ""
            });
            setSelectedModel(null);
            setModelName("");
            
            router.push('/'); // Redirect to home page
            router.refresh(); // Refresh the page data

        } catch (error) {
            console.error('Error creating job:', error);
            alert('เกิดข้อผิดพลาดในการสร้างงาน / Error creating job');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 bg-background">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-foreground">สร้างงานใหม่ / Create New Job</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobName" className="text-sm font-medium">ชื่องาน / Job Name</Label>
                                <Input 
                                    id="jobName" 
                                    type="text" 
                                    placeholder="กรุณาใส่ชื่องาน..." 
                                    value={formData.jobName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">รุ่นบ้าน / House Model</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            {modelName || "เลือกโมเดลบ้าน"}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full">
                                        <DropdownMenuItem onClick={() => handleModelSelect(models79k, "บ้าน 79K")}>
                                            บ้าน 79K
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleModelSelect(models109k, "บ้าน 109K")}>
                                            บ้าน 109K
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleModelSelect(models129k, "บ้าน 129K")}>
                                            บ้าน 129K
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleModelSelect(models139k, "บ้าน 139K")}>
                                            บ้าน 139K
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {selectedModel && (
                                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="p-4 space-y-3">
                                        <h3 className="font-medium text-sm">รายการ Components / Component List</h3>
                                        <div className="space-y-2">
                                            {selectedModel.components?.map((comp: HouseComponent) => (
                                                <div key={comp.sequence} className="p-3 rounded-md bg-muted/50">
                                                    <p className="font-medium text-sm">{comp.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-sm font-medium">วันที่เริ่มงาน / Start Date</Label>
                                    <Input 
                                        id="startDate" 
                                        type="date" 
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline" className="text-sm font-medium">กำหนดส่งงาน / Deadline</Label>
                                    <Input 
                                        id="deadline" 
                                        type="date" 
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium">สถานะ / Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="เลือกสถานะ..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={JOB_STATUS.DRAFT}>แบบร่าง / Draft</SelectItem>
                                        <SelectItem value={JOB_STATUS.IN_PROGRESS}>กำลังดำเนินการ / In Progress</SelectItem>
                                        <SelectItem value={JOB_STATUS.DONE}>เสร็จสิ้น / Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="respUser" className="text-sm font-medium">ผู้รับผิดชอบ / Responsible Person</Label>
                                <Input 
                                    id="respUser" 
                                    type="text" 
                                    placeholder="ชื่อผู้รับผิดชอบ..." 
                                    value={formData.respUser}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-primary text-primary-foreground"
                            disabled={isSubmitting || !selectedModel}
                        >
                            {isSubmitting ? 'กำลังสร้าง... / Creating...' : 'สร้างงาน / Create Job'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateJob;