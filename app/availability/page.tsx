import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"
import { User } from "@/lib/types"
import { FacultyAvailabilityForm } from "./faculty-availability-form"

export default async function FacultyAvailabilityPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Only faculty and admin can access this page
    if (session.user.role !== "faculty" && session.user.role !== "admin") {
        redirect("/dashboard")
    }

    const user = session.user as unknown as User

    await dbConnect()

    // Get all published datesheets relevant to the faculty's department
    const datesheets = await DateSheet.find({
        status: "published",
        ...(user.role === "faculty" && user.departmentId ? { departmentId: user.departmentId } : {})
    }).sort({ startDate: -1 }).limit(10)

    return (
        <DashboardShell user={user}>
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Faculty Availability</h1>
                <p className="text-muted-foreground">
                    Specify your availability for upcoming exam schedules.
                </p>

                {datesheets.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Active Datesheets</CardTitle>
                            <CardDescription>
                                There are no published date sheets available for setting availability.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {datesheets.map((datesheet) => (
                            <Card key={datesheet._id}>
                                <CardHeader>
                                    <CardTitle>{datesheet.name}</CardTitle>
                                    <CardDescription>
                                        {new Date(datesheet.startDate).toLocaleDateString()} - {new Date(datesheet.endDate).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FacultyAvailabilityForm
                                        facultyId={user._id}
                                        dateSheetId={datesheet._id.toString()}
                                        startDate={new Date(datesheet.startDate)}
                                        endDate={new Date(datesheet.endDate)}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    )
}