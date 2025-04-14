import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Department from "@/models/Department"

export async function GET() {
  try {
    await connectToDatabase()
    const departments = await Department.find().sort({ name: 1 })
    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const data = await req.json()
    const department = await Department.create(data)
    return NextResponse.json(department)
  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    )
  }
}
