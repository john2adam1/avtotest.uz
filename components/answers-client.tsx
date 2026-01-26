"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"
import type { Test } from "@/lib/types"

interface AnswersClientProps {
    tests: Test[]
}

export function AnswersClient({ tests }: AnswersClientProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredTests = tests.filter((test) =>
        test.question.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Savol qidirish..."
                    className="pl-10 bg-white border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                    <Card key={test.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-white rounded-xl">
                        <CardContent className="p-0">
                            <div className="aspect-video relative bg-gray-50 flex items-center justify-center">
                                {test.image_url ? (
                                    <Image
                                        src={test.image_url}
                                        alt="Test"
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-300 text-sm">Rasm yo'q</div>
                                )}
                            </div>
                            <div className="p-5 space-y-4">
                                <h3 className="font-bold text-gray-800 line-clamp-3 leading-snug h-[4.5rem]">
                                    {test.question}
                                </h3>
                                <div className="space-y-1.5">
                                    {test.answers.map((answer, index) => {
                                        const isCorrect = index === test.correct_answer
                                        return (
                                            <div
                                                key={index}
                                                className={`
                          p-2 rounded-md text-sm font-medium border
                          ${isCorrect
                                                        ? "bg-green-50 border-green-200 text-green-700"
                                                        : "bg-gray-50 border-gray-100 text-gray-500"}
                        `}
                                            >
                                                <span className="inline-block w-6 font-bold">{index + 1}.</span>
                                                {answer}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTests.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    Hech qanday savol topilmadi.
                </div>
            )}
        </div>
    )
}
