import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import FacultyAvailability from "@/models/FacultyAvailability"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const searchParams = req.nextUrl.searchParams
        const facultyId = searchParams.get("facultyId")
        const dateSheetId = searchParams.get("dateSheetId")

        if (!facultyId || !dateSheetId) {
            return NextResponse.json({ error: "facultyId and dateSheetId are required" }, { status: 400 })
        }

        // Check if the user is authorized to view this availability
        if (session.user.role !== "admin" && session.user.id !== facultyId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const availability = await FacultyAvailability.findOne({
            facultyId,
            dateSheetId
        })

        return NextResponse.json(availability || null)
    } catch (error) {
        console.error("Error fetching faculty availability:", error)
        return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const data = await req.json()

        // Check if the user is authorized to update this availability
        if (session.user.role !== "admin" && session.user.id !== data.facultyId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Update or create faculty availability
        const availability = await FacultyAvailability.findOneAndUpdate(
            {
                facultyId: data.facultyId,
                dateSheetId: data.dateSheetId
            },
            {
                ...data,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        )

        return NextResponse.json(availability)
    } catch (error) {
        console.error("Error saving faculty availability:", error)
        return NextResponse.json({ error: "Failed to save availability" }, { status: 500 })
    }
}