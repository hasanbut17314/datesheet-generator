import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateSheetTable } from "@/app/datesheets/datesheet-table"
import { DateSheetCalendar } from "@/app/datesheets/datesheet-calendar"

// Mock data - in a real app, this would come from your database
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "student" as const,
}

export default function DateSheetsPage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Datesheets</h1>
        <p className="text-muted-foreground">View and manage your examination schedules.</p>

        <Tabs defaultValue="table" className="mt-6">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Schedule</CardTitle>
                <CardDescription>View your upcoming exams in a table format.</CardDescription>
              </CardHeader>
              <CardContent>
                <DateSheetTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Calendar</CardTitle>
                <CardDescription>View your exams in a calendar format.</CardDescription>
              </CardHeader>
              <CardContent>
                <DateSheetCalendar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
