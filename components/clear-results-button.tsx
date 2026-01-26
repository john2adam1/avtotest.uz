"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { clearUserResults } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"

export function ClearResultsButton() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const handleClear = async () => {
        setLoading(true)
        try {
            const result = await clearUserResults()
            if (result.error) {
                toast({
                    title: t("errors.error", "Xatolik"),
                    description: t("errors.deleteFailed", "O'chirishda xatolik yuz berdi"),
                    variant: "destructive",
                })
            } else {
                toast({
                    title: t("common.success", "Muvaffaqiyatli"),
                    description: t("dashboard.resultsCleared", "Barcha test natijalari tozalandi"),
                })
            }
        } catch (error) {
            toast({
                title: t("errors.error", "Xatolik"),
                description: t("errors.general", "Tizim xatoligi"),
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("dashboard.clearResults", "Natijalarni tozalash")}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("dashboard.clearResultsConfirm", "Haqiqatan ham o'chirmoqchimisiz?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("dashboard.clearResultsDescription", "Bu amal barcha test natijalaringizni (biletlar, mavzular va imtihonlar) o'chirib yuboradi. Bu amalni ortga qaytarib bo'lmaydi.")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel", "Bekor qilish")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {loading ? t("common.loading", "O'chirilmoqda...") : t("common.yes", "Ha, o'chirish")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
