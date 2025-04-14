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
import { ArrowUpDown, MoreHorizontal, Search, Loader2, Pencil, Trash2 } from "lucide-react"

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
import { EditCourseDialog } from "./edit-course-dialog"
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

// Define the type for our data
type Course = {
    id: string
    code: string
    name: string
    department: {
        id: string
        name: string
    }
    faculty: {
        id: string
        name: string
        email: string
    }
    semester: number
    creditHours: number
}

interface CourseListProps {
    userRole: string
    userId: string
}

export function CourseList({ userRole, userId }: CourseListProps) {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
    const { toast } = useToast()

    // Fetch courses data
    useEffect(() => {
        async function fetchCourses() {
            try {
                setLoading(true)
                // If faculty, only fetch their courses
                const url = userRole === "faculty" ? `/api/courses?facultyId=${userId}` : "/api/courses"
                const response = await fetch(url)

                if (!response.ok) {
                    throw new Error("Failed to fetch courses")
                }

                const data = await response.json()

                // Transform the data to match our Course type
                const formattedCourses = data.map((course: any) => ({
                    id: course._id,
                    code: course.code,
                    name: course.name,
                    department: {
                        id: course.departmentId._id,
                        name: course.departmentId.name,
                    },
                    faculty: {
                        id: course.facultyId._id,
                        name: course.facultyId.name,
                        email: course.facultyId.email,
                    },
                    semester: course.semester,
                    creditHours: course.creditHours,
                }))

                setCourses(formattedCourses)
            } catch (err) {
                console.error("Error fetching courses:", err)
                setError("Failed to load courses. Please try again.")
                toast({
                    title: "Error",
                    description: "Failed to load courses. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [userRole, userId, toast])

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    async function handleDeleteCourse(course: Course) {
        setCourseToDelete(course)
        setIsDeleteDialogOpen(true)
    }

    async function confirmDelete() {
        if (!courseToDelete) return

        try {
            const response = await fetch(`/api/courses/${courseToDelete.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete course")
            }

            // Remove the course from the state
            setCourses((prevCourses) => prevCourses.filter((c) => c.id !== courseToDelete.id))

            toast({
                title: "Success",
                description: "Course deleted successfully",
            })
        } catch (err) {
            console.error("Error deleting course:", err)
            toast({
                title: "Error",
                description: "Failed to delete course. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleteDialogOpen(false)
            setCourseToDelete(null)
        }
    }

    // Define the columns
    const columns: ColumnDef<Course>[] = [
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Course Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "department.name",
            header: "Department",
        },
        {
            accessorKey: "faculty.name",
            header: "Faculty",
            cell: ({ row }) => {
                const faculty = row.original.faculty
                return (
                    <div className="flex flex-col">
                        <span>{faculty.name}</span>
                        <span className="text-xs text-muted-foreground">{faculty.email}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "semester",
            header: "Semester",
            cell: ({ row }) => {
                return <Badge variant="outline">{row.getValue("semester")}</Badge>
            },
        },
        {
            accessorKey: "creditHours",
            header: "Credits",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const course = row.original

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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(course.id)}>Copy ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingCourse(course)}>Edit Course</DropdownMenuItem>
                            {userRole === "admin" && (
                                <DropdownMenuItem onClick={() => handleDeleteCourse(course)} className="text-destructive">
                                    Delete Course
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data: courses,
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
                <span className="ml-2">Loading courses...</span>
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
                        placeholder="Search courses..."
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
                                    No courses found.
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

            {/* Edit Course Dialog */}
            {editingCourse && (
                <EditCourseDialog
                    course={editingCourse}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onCourseUpdated={(updatedCourse) => {
                        setCourses((prevCourses) =>
                            prevCourses.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)),
                        )
                        setEditingCourse(null)
                    }}
                />
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course{" "}
                            <span className="font-semibold">{courseToDelete?.name}</span> and all its data.
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
