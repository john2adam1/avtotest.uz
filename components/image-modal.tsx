"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"

interface ImageModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    altText?: string
}

export function ImageModal({ isOpen, onClose, imageUrl, altText }: ImageModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-transparent border-none flex items-center justify-center">
                <DialogTitle className="sr-only">
                    {altText || "Rasm ko'rinishi"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Kattalashtirilgan rasm ko'rinishi
                </DialogDescription>
                <div className="relative w-full h-full min-h-[50vh] flex items-center justify-center pointer-events-none">
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
                        <Image
                            src={imageUrl}
                            alt={altText || "Full screen image"}
                            fill
                            unoptimized
                            className="object-contain"
                            quality={100}
                            onClick={onClose}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
