export type UserRole = "student" | "admin" | "faculty"

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  departmentId?: string
}

export interface Department {
  _id: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: string
  code: string
  name: string
  departmentId: string
  facultyId: string
  semester: number
  creditHours: number
}

export interface Exam {
  id: string
  courseId: string
  date: Date
  startTime: string
  endTime: string
  venue: string
  type: "midterm" | "final" | "quiz" | "other"
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
}

export interface ClashReport {
  id: string
  studentId: string
  examIds: string[]
  description: string
  status: "pending" | "resolved" | "rejected"
  createdAt: Date
  resolvedAt?: Date
}

export interface DateSheet {
  id: string
  name: string
  departmentId: string
  semester: number
  startDate: Date
  endDate: Date
  status: "draft" | "published" | "archived"
  exams: Exam[]
}
