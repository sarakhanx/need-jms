# Need-JMS-MVP (Job Management System)

## โครงการระบบจัดการงานก่อสร้าง / Construction Job Management System
ระบบจัดการงานก่อสร้างที่ออกแบบมาเพื่อติดตามและจัดการขั้นตอนการผลิตในสายการผลิต โดยมีฟีเจอร์หลักคือการแสดงสถานะงาน การสร้างงานใหม่ และการดูรายละเอียดของแต่ละสายการผลิต

This is a construction job management system designed to track and manage production steps in a production line. Key features include job status visualization, new job creation, and production line detailed views.

## คุณสมบัติหลัก / Key Features

### 1. แดชบอร์ด / Dashboard (src/app/page.tsx)
- แสดงภาพรวมสถานะงานผ่านกราฟต่างๆ / Displays job status overview through various charts
  - กราฟวงกลมแสดงสัดส่วนสถานะงาน / Status Pie Chart (Draft, In Progress, Done)
  - กราฟแท่งแสดงสถานะของแต่ละขั้นตอน / Component Status Bar Chart
  - กราฟเส้นแสดงความคืบหน้ารายวัน / Daily Progress Line Chart
  - กราฟแท่งแสดงเวลาเฉลี่ยของแต่ละสายการผลิต / Average Time Bar Chart

### 2. ฟอร์มสร้างงานใหม่ / Create Job Form (src/components/forms/CreateJob.tsx)
- เลือกรุ่นบ้านพร้อมขั้นตอนที่กำหนดไว้ / Select house models with predefined components
- กรอกรายละเอียดงาน / Input job details
  - ชื่องาน / Job name
  - วันที่เริ่ม / Start date
  - กำหนดส่ง / Deadline
  - ผู้รับผิดชอบ / Responsible person
- เลือกสถานะ / Status selection (Draft, In Progress, Done)

### 3. มุมมองสายการผลิต / Production Line View (src/app/produce-line/[slug]/client.tsx)
- แสดงรายการงานในแต่ละขั้นตอน / Display jobs for each component
- จัดเรียงตามคอลัมน์ต่างๆ / Sortable columns
- อัพเดทสถานะงาน / Status updates
- ระบบแบ่งหน้าและเลือกจำนวนรายการต่อหน้า / Pagination and page size selection

## API Endpoints

### 1. API ดึงข้อมูลงาน / Jobs API (/api/jobs)
- Method: GET
- ดึงข้อมูลงานพร้อมฟิลเตอร์และการจัดเรียง / Fetches job data with filtering and sorting

### 2. API สร้างงานใหม่ / Create Job API (/api/create-job)
- Method: POST
- สร้างงานใหม่พร้อมขั้นตอน / Creates new job with components

### 3. API อัพเดทสถานะ / Update Component Status API (/api/jobs/components/[id])
- Method: PATCH
- อัพเดทสถานะของขั้นตอนในงาน / Updates job component status

## การติดตั้ง / Installation

```bash
# ติดตั้ง dependencies / Install dependencies
npm install

# รันในโหมดพัฒนา / Run in development mode
npm run dev

# สร้างและรันในโหมด production / Build and run in production mode
npm run build
npm start
```

## เทคโนโลยีที่ใช้ / Technologies Used
- Next.js 14 (App Router)
- React
- TypeScript
- Prisma (Database ORM)
- Tailwind CSS
- shadcn/ui
- date-fns (Date formatting)

## การพัฒนา / Development Notes
- ตั้งค่า next.config.ts ให้ถูกต้อง / Configure next.config.ts correctly
- รองรับการแสดงผลบนอุปกรณ์ทุกขนาด / Responsive design for all screen sizes
- มีระบบจัดการ Error พร้อม Toast notifications / Error handling with toast notifications
- ใช้ภาษาไทยและอังกฤษในส่วนติดต่อผู้ใช้ / Bilingual UI (Thai/English)

## โครงสร้างโปรเจค / Project Structure
```
need-jms-mvp/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utility functions
│   ├── types/              # TypeScript types
│   └── styles/             # Global styles
├── prisma/                 # Database schema and migrations
├── public/                 # Static files
└── package.json           # Project dependencies
```

## ผู้พัฒนา / Developer
[Your Name/Team Name]

## License
[Your License]