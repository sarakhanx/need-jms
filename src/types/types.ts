export const JOB_STATUS = {
    DRAFT: 'Draft',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done'
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type FormData = {
    jobName: string;
    startDate: string;
    deadline: string;
    status: JobStatus;
    respUser: string;
}

// API Types (as they come from the server)
export type ApiJob = {
    id: string;
    name: string;
    model: string;
    startDate: string;
    deadline: string;
    status: string;
    respUser: string;
    components: ApiJobComponent[];
    createdAt: string;
    updatedAt: string;
    finished?: string;
}

export type ApiJobComponent = {
    id: string;
    jobId: string;
    name: string;
    sequence: number;
    description: string;
    status: string;
    startedAt: string | null;
    finishedAt: string | null;
    updatedAt: string;
    createdAt: string;
    totalTimeSpent: number;
    pausedAt?: string;
}

// Client Types (after transformation)
export type Job = {
    id: string;
    name: string;
    model: string;
    startDate: Date;
    deadline: Date;
    status: string;
    respUser: string;
    components: JobComponent[];
    createdAt: Date;
    updatedAt: Date;
    finished?: Date;
}

export type JobComponent = {
    id: string;
    jobId: string;
    name: string;
    sequence: number;
    description: string;
    status: string;
    startedAt: Date | null;
    finishedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
    totalTimeSpent: number;
    pausedAt?: Date;
}


export type ComponentStats = {
    name: string
    draft: number
    inProgress: number
    done: number
  }
  
  export type DailyStats = {
    date: string
    pending: number
    completed: number
  }
  
  export type OverallStats = {
    name: string
    value: number
  }
  
  export type AverageTimeStats = {
    name: string
    averageTime: number
    totalJobs: number
  }

export interface HouseComponent {
    sequence: number;
    name: string;
    description: string;
}

export interface ResponsibleUser {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export interface HouseModel {
    components: HouseComponent[];
    status: string;
    resp_user: ResponsibleUser;
}

export type StatusCount = {
    [key: string]: number
}

export type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
}

export type PaginatedData = {
    jobs: Job[]
    total: number
    statusCounts: StatusCount
    totalPages: number
}