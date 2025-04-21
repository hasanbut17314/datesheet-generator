import { getBatches } from "@/app/actions/batches"
import { getDepartments } from "@/app/actions/departments"
import { BatchesList } from "@/components/BatchesList"
import { DashboardShell } from "@/components/dashboard-shell"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { User } from "@/lib/types"
import { BatchFormWrapper } from "@/components/BatchFormWrapper"

export default async function BatchesPage() {
    const session = await getServerSession(authOptions)
    const batches = await getBatches()
    const departments = await getDepartments()

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
                    <h1 className="text-3xl font-bold">Batches</h1>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <BatchFormWrapper departments={departments} />
                    <BatchesList batches={batches} />
                </div>
            </div>
        </DashboardShell>
    )
}