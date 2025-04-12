import type { IExam } from "@/models/Exam"

export interface ExamClash {
  type: "time" | "venue" | "student"
  exams: IExam[]
}

export function detectClashes(exams: IExam[]): ExamClash[] {
  const clashes: ExamClash[] = []

  // Check for time and venue clashes
  for (let i = 0; i < exams.length; i++) {
    for (let j = i + 1; j < exams.length; j++) {
      const exam1 = exams[i]
      const exam2 = exams[j]

      // Check if exams are on the same day
      if (exam1.date.toDateString() === exam2.date.toDateString()) {
        // Check for time overlap
        const exam1Start = exam1.startTime
        const exam1End = exam1.endTime
        const exam2Start = exam2.startTime
        const exam2End = exam2.endTime

        if ((exam1Start <= exam2End && exam1End >= exam2Start) || (exam2Start <= exam1End && exam2End >= exam1Start)) {
          // Time clash
          clashes.push({
            type: "time",
            exams: [exam1, exam2],
          })

          // Check for venue clash
          if (exam1.venue === exam2.venue) {
            clashes.push({
              type: "venue",
              exams: [exam1, exam2],
            })
          }
        }
      }
    }
  }

  return clashes
}
