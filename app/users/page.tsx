import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserList } from "./user-list"
import { CreateUserForm } from "./create-user-form"
import { redirect } from "next/navigation"
import { User } from "@/lib/types"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Only admin can access this page
    if (session.user.role !== "admin") {
        redirect("/dashboard")
    }

    const user = session.user as User

    return (
        <DashboardShell user={user}>
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground">Manage all users in the system.</p>

                <Tabs defaultValue="list" className="mt-6">
                    <TabsList>
                        <TabsTrigger value="list">All Users</TabsTrigger>
                        <TabsTrigger value="create">Create User</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>User List</CardTitle>
                                <CardDescription>View and manage all users in the system.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserList />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="create" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New User</CardTitle>
                                <CardDescription>Add a new user to the system.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateUserForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardShell>
    )
}
