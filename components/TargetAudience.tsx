"use client"

import { useTranslation } from "react-i18next"

export function TargetAudience() {
    const { t } = useTranslation()

    return (
        <section className="py-12 md:py-16 relative overflow-hidden bg-[#eef8fd]">
            <div className="container mx-auto px-6 max-w-5xl">
                <h2 className="text-[#3b82f6] text-xl md:text-[22px] mb-8 text-left uppercase">
                    {t("target_audience.badge", "Kursimiz kimlarga 100% yordam beradi?")}
                </h2>

                <div className="space-y-5">
                    <div className="bg-white rounded-xl p-6 md:px-8 md:py-7 shadow-sm border border-slate-50">
                        <p className="text-slate-800 text-[17px] sm:text-lg font-normal leading-relaxed">
                            1. {t("target_audience.item1", "Avtomaktabni tugatib lekin avtotest imtihoniga topshirishga ikkilanyotgan va qat'iy qaror qilmayotgan bo'lsangiz.")}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 md:px-8 md:py-7 shadow-sm border border-slate-50">
                        <p className="text-slate-800 text-[17px] sm:text-lg font-normal leading-relaxed">
                            2. {t("target_audience.item2", "Vaqtingiz kam, shuning uchun online o'zingiz o'qib, qulay vaqtda tayyorlanmoqchi bo'lsangiz.")}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 md:px-8 md:py-7 shadow-sm border border-slate-50">
                        <p className="text-slate-800 text-[17px] sm:text-lg font-normal leading-relaxed">
                            3. {t("target_audience.item3", "Avval imtihondan yiqilgan bo'lsangiz va bu safar xato qilmay, to'liq tayyorlanmoqchi bo'lsangiz.")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
