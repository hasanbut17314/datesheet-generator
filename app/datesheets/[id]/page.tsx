import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExamList } from "@/app/admin/datesheets/[id]/exam-list"
import { AddExamForm } from "@/app/admin/datesheets/[id]/add-exam-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"
import { User } from "@/lib/types"

export default async function DateSheetDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const user = session.user as User

  await dbConnect()
  const datesheet = await DateSheet.findById(params.id).populate("departmentId", "name")

  if (!datesheet) {
    redirect("/admin/datesheets")
  }

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{datesheet.name}</h1>
            <p className="text-muted-foreground">
              {datesheet.departmentId.name} - Semester {datesheet.semester}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                datesheet.status === "published" ? "default" : datesheet.status === "draft" ? "secondary" : "outline"
              }
            >
              {datesheet.status.charAt(0).toUpperCase() + datesheet.status.slice(1)}
            </Badge>
            {datesheet.status === "draft" && <Button>Publish Datesheet</Button>}
          </div>
        </div>

        <Tabs defaultValue="exams" className="mt-6">
          <TabsList>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="add">Add Exam</TabsTrigger>
            <TabsTrigger value="clashes">Clashes</TabsTrigger>
          </TabsList>
          <TabsContent value="exams" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Exams</CardTitle>
                <CardDescription>Manage the exams in this datesheet.</CardDescription>
              </CardHeader>
              <CardContent>
                <ExamList dateSheetId={params.id} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="add" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Exam</CardTitle>
                <CardDescription>Add a new exam to this datesheet.</CardDescription>
              </CardHeader>
              <CardContent>
                <AddExamForm dateSheetId={params.id} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="clashes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Clashes</CardTitle>
                <CardDescription>View and resolve exam scheduling conflicts.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No clashes detected in this datesheet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
