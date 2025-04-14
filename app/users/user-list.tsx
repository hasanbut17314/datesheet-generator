"use client"

import { useState, useEffect } from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Search, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { EditUserDialog } from "./edit-user-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type User = {
    id: string
    name: string
    email: string
    role: "student" | "faculty" | "admin"
    department?: {
        id: string
        name: string
    }
    createdAt: string
}

export function UserList() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const { toast } = useToast()

    // Fetch users data
    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true)
                const response = await fetch("/api/users/all")

                if (!response.ok) {
                    throw new Error("Failed to fetch users")
                }

                const data = await response.json()

                // Transform the data to match our User type
                const formattedUsers = data.map((user: any) => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.departmentId
                        ? {
                            id: user.departmentId._id,
                            name: user.departmentId.name,
                        }
                        : undefined,
                    createdAt: new Date(user.createdAt).toLocaleDateString(),
                }))

                setUsers(formattedUsers)
            } catch (err) {
                console.error("Error fetching users:", err)
                setError("Failed to load users. Please try again.")
                toast({
                    title: "Error",
                    description: "Failed to load users. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [toast])

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    async function handleDeleteUser(user: User) {
        setUserToDelete(user)
        setIsDeleteDialogOpen(true)
    }

    async function confirmDelete() {
        if (!userToDelete) return

        try {
            const response = await fetch(`/api/users/${userToDelete.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete user")
            }

            // Remove the user from the state
            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id))

            toast({
                title: "Success",
                description: "User deleted successfully",
            })
        } catch (err) {
            console.error("Error deleting user:", err)
            toast({
                title: "Error",
                description: "Failed to delete user. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleteDialogOpen(false)
            setUserToDelete(null)
        }
    }

    // Define the columns
    const columns: ColumnDef<User>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const user = row.original
                const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.name}</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                return (
                    <Badge variant={role === "admin" ? "default" : role === "faculty" ? "secondary" : "outline"}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "department.name",
            header: "Department",
            cell: ({ row }) => {
                const department = row.original.department
                return department ? department.name : "N/A"
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Copy ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>Edit User</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-destructive">
                                Delete User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2">Loading users...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center">
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                </Button>
            </div>

            {/* Edit User Dialog */}
            {editingUser && (
                <EditUserDialog
                    user={editingUser}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onUserUpdated={(updatedUser) => {
                        setUsers((prevUsers) => prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
                        setEditingUser(null)
                    }}
                />
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user{" "}
                            <span className="font-semibold">{userToDelete?.name}</span> and all their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
