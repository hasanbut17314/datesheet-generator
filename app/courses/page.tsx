import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseList } from "./course-list"
import { CreateCourseForm } from "./create-course-form"
import { redirect } from "next/navigation"
import { User } from "@/lib/types"

export default async function CoursesPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Only admin and faculty can access this page
    if (session.user.role !== "admin" && session.user.role !== "faculty") {
        redirect("/dashboard")
    }

    const user = session.user as User

    return (
        <DashboardShell user={user}>
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                <p className="text-muted-foreground">
                    {session.user.role === "admin" ? "Manage all courses across departments." : "View and manage your courses."}
                </p>

                <Tabs defaultValue="list" className="mt-6">
                    <TabsList>
                        <TabsTrigger value="list">All Courses</TabsTrigger>
                        {session.user.role === "admin" && <TabsTrigger value="create">Create Course</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="list" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course List</CardTitle>
                                <CardDescription>
                                    {session.user.role === "admin" ? "View and manage all courses." : "View courses you're teaching."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CourseList userRole={session.user.role} userId={session.user.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {session.user.role === "admin" && (
                        <TabsContent value="create" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create New Course</CardTitle>
                                    <CardDescription>Add a new course to the system.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CreateCourseForm />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </DashboardShell>
    )
}
