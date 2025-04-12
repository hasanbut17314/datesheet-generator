import { getServerSession } from "next-auth/next"
import { CalendarClock, Clock, FileText, AlertTriangle } from "lucide-react"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dbConnect from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Course from "@/models/Course"
import ClashReport from "@/models/ClashReport"

async function getUpcomingExams(userId: string, role: string) {
  await dbConnect()

  let exams = []

  if (role === "student") {
    // For students, get exams from their courses
    // This is a simplified approach - in a real app, you'd have a student-course relationship
    exams = await Exam.find({
      date: { $gte: new Date() },
      status: "scheduled",
    })
      .populate({
        path: "courseId",
        select: "name code",
      })
      .populate("dateSheetId", "name")
      .sort({ date: 1 })
      .limit(10)
  } else if (role === "faculty") {
    // For faculty, get exams for courses they teach
    const facultyCourses = await Course.find({ facultyId: userId }).select("_id")
    const courseIds = facultyCourses.map((course) => course._id)

    exams = await Exam.find({
      courseId: { $in: courseIds },
      date: { $gte: new Date() },
      status: "scheduled",
    })
      .populate({
        path: "courseId",
        select: "name code",
      })
      .populate("dateSheetId", "name")
      .sort({ date: 1 })
      .limit(10)
  } else if (role === "admin") {
    // For admins, get all upcoming exams
    exams = await Exam.find({
      date: { $gte: new Date() },
      status: "scheduled",
    })
      .populate({
        path: "courseId",
        select: "name code",
      })
      .populate("dateSheetId", "name")
      .sort({ date: 1 })
      .limit(10)
  }

  return exams
}

async function getClashReports(userId: string, role: string) {
  await dbConnect()

  let clashReports = []

  if (role === "student") {
    // For students, get their own clash reports
    clashReports = await ClashReport.find({
      studentId: userId,
      status: "pending",
    }).countDocuments()
  } else if (role === "admin") {
    // For admins, get all pending clash reports
    clashReports = await ClashReport.find({
      status: "pending",
    }).countDocuments()
  }

  return clashReports
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const upcomingExams = await getUpcomingExams(session.user.id, session.user.role)
  const pendingClashReports = await getClashReports(session.user.id, session.user.role)

  // Calculate total exam hours
  const totalExamHours = upcomingExams.reduce((total, exam) => {
    const startTime = new Date(`2000-01-01T${exam.startTime}:00`)
    const endTime = new Date(`2000-01-01T${exam.endTime}:00`)
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    return total + durationHours
  }, 0)

  // Get the next exam date
  const nextExam = upcomingExams[0]
  const nextExamDate = nextExam ? new Date(nextExam.date) : null
  const today = new Date()
  const daysUntilNextExam = nextExamDate
    ? Math.ceil((nextExamDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <DashboardShell user={session.user}>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}. Here&apos;s an overview of your upcoming exams.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingExams.length}</div>
              <p className="text-xs text-muted-foreground">
                {nextExamDate
                  ? `Next exam in ${daysUntilNextExam} day${daysUntilNextExam !== 1 ? "s" : ""}`
                  : "No upcoming exams"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  upcomingExams.reduce((courses, exam) => {
                    const courseId = exam.courseId._id.toString()
                    if (!courses.includes(courseId)) {
                      courses.push(courseId)
                    }
                    return courses
                  }, []).length
                }
              </div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exam Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExamHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Total duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Clashes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingClashReports}</div>
              <p className="text-xs text-muted-foreground">
                {pendingClashReports === 0
                  ? "No conflicts detected"
                  : `${pendingClashReports} pending report${pendingClashReports !== 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="mt-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
            <TabsTrigger value="all">All Exams</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
                <CardDescription>View your upcoming exams and their details.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingExams.length > 0 ? (
                    upcomingExams.map((exam) => (
                      <div
                        key={exam._id.toString()}
                        className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {exam.courseId.code} - {exam.courseId.name}
                          </h3>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:gap-4">
                            <div className="flex items-center gap-1">
                              <CalendarClock className="h-4 w-4" />
                              <span>{new Date(exam.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {exam.startTime} - {exam.endTime}
                              </span>
                            </div>
                            <div>Venue: {exam.venue}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}</Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">No upcoming exams found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Exams</CardTitle>
                <CardDescription>View all your exams for this semester.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">You can view and filter all your exams here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
