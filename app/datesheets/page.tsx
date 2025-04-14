import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { User } from "@/lib/types"
import { DashboardShell } from "@/components/dashboard-shell"
import { DateSheetList } from "@/components/DateSheetList"
import { CreateDateSheetForm } from "@/components/CreateDateSheetForm"

export default async function DateSheetsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const user: User = {
    _id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    role: session.user.role as User["role"],
    departmentId: session.user.departmentId
  }

  return (
    <DashboardShell user={user}>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Date Sheets</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <CreateDateSheetForm />
          <DateSheetList />
        </div>
      </div>
    </DashboardShell>
  )
}
