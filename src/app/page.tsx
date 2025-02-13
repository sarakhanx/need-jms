'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, PieChart, Pie, Cell, Legend } from "recharts"
import { useEffect, useState } from "react"
import { JOB_STATUS, ComponentStats, DailyStats, OverallStats, AverageTimeStats, Job, JobComponent } from "@/types/types"
import { format, subDays, startOfToday } from "date-fns"
import { th } from 'date-fns/locale'


// Theme colors from globals.css
const THEME_COLORS = {
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
}

export default function Home() {
  const [componentStats, setComponentStats] = useState<ComponentStats[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats[]>([])
  const [averageTimeStats, setAverageTimeStats] = useState<AverageTimeStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/jobs')
        if (!response.ok) throw new Error('Failed to fetch jobs')
        const data = await response.json()
        const jobs = data.jobs

        // Process component statistics
        const componentMap = new Map<string, { draft: number; inProgress: number; done: number }>()
        const timeTrackingMap = new Map<string, { totalTime: number; jobCount: number }>()
        let totalDraft = 0
        let totalInProgress = 0
        let totalDone = 0
        
        // Process daily statistics for the last 7 days
        const dailyMap = new Map<string, { pending: number; completed: number }>()
        const today = startOfToday()
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = format(subDays(today, i), 'yyyy-MM-dd')
          dailyMap.set(date, { pending: 0, completed: 0 })
        }

        jobs.forEach((job: Job) => {
          // Component stats and time tracking
          job.components.forEach((component: JobComponent) => {
            if (!componentMap.has(component.name)) {
              componentMap.set(component.name, { draft: 0, inProgress: 0, done: 0 })
              timeTrackingMap.set(component.name, { totalTime: 0, jobCount: 0 })
            }
            const stats = componentMap.get(component.name)!
            const timeStats = timeTrackingMap.get(component.name)!
            
            // Update status counts
            switch (component.status) {
              case JOB_STATUS.DRAFT:
                stats.draft++
                totalDraft++
                break
              case JOB_STATUS.IN_PROGRESS:
                stats.inProgress++
                totalInProgress++
                break
              case JOB_STATUS.DONE:
                stats.done++
                totalDone++
                // Add to time tracking stats if component is done
                if (component.totalTimeSpent) {
                  timeStats.totalTime += component.totalTimeSpent
                  timeStats.jobCount++
                }
                break
            }
          })

          // Daily stats
          job.components.forEach((component: JobComponent) => {
            if (component.updatedAt) {
              const updateDate = format(new Date(component.updatedAt), 'yyyy-MM-dd')
              if (dailyMap.has(updateDate)) {
                const stats = dailyMap.get(updateDate)!
                if (component.status === JOB_STATUS.DONE) {
                  stats.completed++
                } else {
                  stats.pending++
                }
              }
            }
          })
        })

        // Calculate average time stats
        const averageTimeStatsData = Array.from(timeTrackingMap.entries()).map(([name, stats]) => ({
          name,
          averageTime: stats.jobCount > 0 ? Math.round(stats.totalTime / stats.jobCount) : 0,
          totalJobs: stats.jobCount
        })).filter(stat => stat.averageTime > 0)

        // Set overall stats for pie chart
        const overallStatsData = [
          { name: 'แบบร่าง / Draft', value: totalDraft },
          { name: 'กำลังดำเนินการ / In Progress', value: totalInProgress },
          { name: 'เสร็จสิ้น / Done', value: totalDone }
        ]

        // Convert component map to array
        const componentStatsArray = Array.from(componentMap.entries()).map(([name, stats]) => ({
          name,
          ...stats
        }))

        // Convert daily map to array
        const dailyStatsArray = Array.from(dailyMap.entries()).map(([date, stats]) => ({
          date: format(new Date(date), 'dd/MM', { locale: th }),
          ...stats
        }))

        setOverallStats(overallStatsData)
        setComponentStats(componentStatsArray)
        setDailyStats(dailyStatsArray)
        setAverageTimeStats(averageTimeStatsData)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">กำลังโหลด... / Loading...</div>
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">แดชบอร์ด / Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overall Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>ภาพรวมสถานะงาน / Overall Status</CardTitle>
              <CardDescription>
                แสดงสัดส่วนของงานในแต่ละสถานะ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overallStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overallStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(THEME_COLORS)[index % Object.values(THEME_COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border-border text-foreground p-4 border rounded-lg shadow">
                              <p className="font-bold">{payload[0]?.name}</p>
                              <p>จำนวน: {payload[0]?.value} งาน</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend className="text-muted-foreground" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Component Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะงานแต่ละ Component / Component Status</CardTitle>
              <CardDescription>
                แสดงจำนวนงานในแต่ละสถานะของแต่ละ Component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={componentStats}>
                    <XAxis dataKey="name" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border-border text-foreground p-4 border rounded-lg shadow">
                              <p className="font-bold">{payload[0]?.payload?.name}</p>
                              <p className="text-muted-foreground">แบบร่าง / Draft: {payload[0]?.payload?.draft}</p>
                              <p className="text-muted-foreground">กำลังดำเนินการ / In Progress: {payload[0]?.payload?.inProgress}</p>
                              <p className="text-muted-foreground">เสร็จสิ้น / Done: {payload[0]?.payload?.done}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="draft" stackId="a" fill={THEME_COLORS.chart1} name="แบบร่าง / Draft" />
                    <Bar dataKey="inProgress" stackId="a" fill={THEME_COLORS.chart2} name="กำลังดำเนินการ / In Progress" />
                    <Bar dataKey="done" stackId="a" fill={THEME_COLORS.chart3} name="เสร็จสิ้น / Done" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ความคืบหน้ารายวัน / Daily Progress</CardTitle>
            <CardDescription>
              แสดงจำนวนงานที่คงค้างและเสร็จสิ้นในแต่ละวัน (7 วันล่าสุด)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border-border text-foreground p-4 border rounded-lg shadow">
                            <p className="font-bold">วันที่ {label}</p>
                            <p className="text-muted-foreground">งานคงค้าง / Pending: {payload[0]?.value}</p>
                            <p className="text-muted-foreground">งานเสร็จสิ้น / Completed: {payload[1]?.value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line type="monotone" dataKey="pending" stroke={THEME_COLORS.chart4} name="งานคงค้าง / Pending" />
                  <Line type="monotone" dataKey="completed" stroke={THEME_COLORS.chart5} name="เสร็จสิ้น / Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Time Per Production Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>เวลาเฉลี่ยต่อสายการผลิต / Average Time per Production Line</CardTitle>
            <CardDescription>
              แสดงเวลาเฉลี่ยในการผลิตของแต่ละสายการผลิต (เฉพาะงานที่เสร็จสิ้นแล้ว)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={averageTimeStats}>
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" label={{ value: 'นาที / Minutes', angle: -90, position: 'insideLeft', className: "text-muted-foreground" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border-border text-foreground p-4 border rounded-lg shadow">
                            <p className="font-bold">{data?.name}</p>
                            <p className="text-muted-foreground">เวลาเฉลี่ย / Average Time: {Math.floor(data?.averageTime / 60)}h {data?.averageTime % 60}m</p>
                            <p className="text-muted-foreground">จำนวนงานที่เสร็จ / Completed Jobs: {data.totalJobs}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="averageTime"
                    fill={THEME_COLORS.chart2}
                    name="เวลาเฉลี่ย / Average Time"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
