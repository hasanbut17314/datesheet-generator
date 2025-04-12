import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateSheetList } from "@/app/admin/datesheets/datesheet-list"
import { CreateDateSheetForm } from "@/app/admin/datesheets/create-datesheet-form"

// Mock data - in a real app, this would come from your database
const mockUser = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin" as const,
}

export default function AdminDateSheetsPage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage Datesheets</h1>
        <p className="text-muted-foreground">Create, edit, and publish examination schedules.</p>

        <Tabs defaultValue="list" className="mt-6">
          <TabsList>
            <TabsTrigger value="list">Datesheets</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Datesheets</CardTitle>
                <CardDescription>View and manage all examination schedules.</CardDescription>
              </CardHeader>
              <CardContent>
                <DateSheetList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Datesheet</CardTitle>
                <CardDescription>Create a new examination schedule for a department or course.</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateDateSheetForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
