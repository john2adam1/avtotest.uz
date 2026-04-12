"use client"

import { CheckSquare } from "lucide-react"
import { useTranslation } from "react-i18next"

export function FeaturesGrid() {
    const { t } = useTranslation()
    const features = [
        {
            title: t("features_section.feature1_title", "Test Formatlari"),
            desc1: t("features_section.feature1_desc1", "55 ta rasmiy bilet asosida mukammal tayyorlanish imkoniyati."),
            desc2: t("features_section.feature1_desc2", "O'z bilimingizni har xil yo'llar bilan sinang.")
        },
        {
            title: t("features_section.feature2_title", "Mavzulashtirilgan Testlar"),
            desc1: t("features_section.feature2_desc1", "Mavzular ketma-ketligi bo'yicha qulay test yechish imkoniyati."),
            desc2: t("features_section.feature2_desc2", "O'z bilimingizni har xil yo'llar bilan sinang.")
        },
        {
            title: t("features_section.feature3_title", "Imtihon Formati"),
            desc1: t("features_section.feature3_desc1", "Standart 25 daqiqa, 20 ta savol – xuddi real imtihon kabi."),
            desc2: t("features_section.feature3_desc2", "Natijani darhol bilasiz.")
        },
        {
            title: t("features_section.feature4_title", "Til Tanlash"),
            desc1: t("features_section.feature4_desc1", "O'zbek, Rus va boshqa tillarda test yechish imkoniyati."),
            desc2: t("features_section.feature4_desc2", "Sizga qulay bo'lgan tilni tanlang.")
        },
        {
            title: t("features_section.feature5_title", "Yangi savollar"),
            desc1: t("features_section.feature5_desc1", "100 tadan ortiq yangi savollarga tayyorlanish imkoniyati."),
            desc2: t("features_section.feature5_desc2", "O'z bilimingizni har xil yo'llar bilan sinang.")
        },
        {
            title: t("features_section.feature6_title", "Oson boshlash"),
            desc1: t("features_section.feature6_desc1", "Ism va telefon raqam orqali tez ro'yxatdan o'tish."),
            desc2: t("features_section.feature6_desc2", "Login qilish juda oson.")
        }
    ]

    return (
        <section className="py-12 md:py-16 relative z-10 w-full max-w-[1150px] mx-auto px-6">
            <div className="text-center mb-14">
                <span className="inline-block text-[#38bdf8] font-medium tracking-wide text-sm border-b-2 border-[#2dd4bf] pb-1 uppercase">
                    {t("features_section.badge", "IMKONIYATLAR")}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {features.map((feature, idx) => (
                    <div key={idx} className="bg-white rounded-[1rem] p-6 lg:p-8 shadow-sm border border-slate-50 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-md">
                        <div className="flex items-start justify-center gap-2 mb-4">
                            <CheckSquare className="w-5 h-5 text-blue-600 mt-[3px] shrink-0" strokeWidth={2.5} />
                            <h3 className="text-[#1a5eb8] text-xl md:text-[22px] font-semibold leading-snug tracking-tight">
                                {feature.title}
                            </h3>
                        </div>
                        <p className="text-slate-600 text-[15px] mb-2 font-normal leading-relaxed">
                            {feature.desc1}
                        </p>
                        <p className="text-slate-400 text-[13px] font-normal leading-relaxed">
                            {feature.desc2}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}
