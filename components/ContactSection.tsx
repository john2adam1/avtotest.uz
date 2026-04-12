"use client"

import { Phone, MapPin, Send, Facebook, Instagram, Mail } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { ContactData } from "@/lib/landing-types"
import { useState, useEffect } from "react"

interface ContactSectionProps {
  contact: ContactData
}

export function ContactSection({ contact }: ContactSectionProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="contact" className="pt-10 pb-16 relative overflow-hidden bg-[#eef8fd]">
      <div className="container mx-auto px-6 max-w-6xl relative z-10 w-full">

        {/* Contact Top Area */}
        <div className="flex flex-col md:flex-row mb-10 max-w-5xl mx-auto md:relative px-2">
          {/* Title on the left */}
          <div className="md:absolute md:left-0 md:top-0 mb-10 md:mb-0">
            <span className="text-[#0284c7] text-[18px] font-medium inline-block border-b-[2.5px] border-[#2dd4bf] pb-1 cursor-default hover:text-[#0369a1] transition-colors">
              {t("contact_section.biz_bilan_boglanish", "Biz bilan bog'lanish")}
            </span>
          </div>

          {/* Middle part - No Form */}
          <div className="w-full max-w-md mx-auto flex flex-col space-y-4 md:mt-2">
            <a
              href={contact.telegram_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#0088cc] hover:bg-[#0077b5] text-white p-4 rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-blue-100"
            >
              <Send className="w-5 h-5 -ml-1 mt-0.5" />
              <span className="font-semibold text-base tracking-wide">{t("contact_section.telegram_orqali", "Telegram orqali bog'lanish")}</span>
            </a>

            <a
              href={`tel:${contact.phone || "+998785553190"}`}
              className="flex text-center flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-slate-100"
            >
              <Phone className="w-5 h-5 text-blue-500 shrink-0 hidden sm:block" />
              <span className="font-semibold text-base">
                {t("contact_section.telefon_raqamimiz", "Telefon raqamimiz:")} <span className="text-blue-600 font-bold ml-1">{contact.phone || "+998 78 555 31 90"}</span>
              </span>
            </a>
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col md:flex-row justify-between items-start pt-6 max-w-5xl mx-auto gap-12 px-2">
          {/* Left Footer Area */}
          <div className="max-w-md space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="relative w-40 h-10">
                <Image
                  src="/images/logo.jpg"
                  alt="Sarvar AvtoTest"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Text */}
            <p className="text-[#1a202c] text-[13px] leading-relaxed font-medium pb-2">
              {t("contact_section.footer_text", "Sarvar Avtotest — avtomaktab bitiruvchilari va mustaqil tayyorlanmoqchi bo'lganlar uchun O'zbekistonda eng samarali platforma.")}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-[34px] h-[34px] rounded-full border-[1.5px] border-[#93c5fd] flex items-center justify-center text-[#3b82f6] hover:bg-blue-50 transition-colors bg-white">
                <Facebook className="w-4 h-4 fill-current stroke-[0.5]" />
              </a>
              <a href={contact.telegram_link || "#"} className="w-[34px] h-[34px] rounded-full border-[1.5px] border-[#93c5fd] flex items-center justify-center text-[#3b82f6] hover:bg-blue-50 transition-colors bg-white">
                <Send className="w-4 h-4 -ml-0.5 fill-current stroke-[0.5]" />
              </a>
              <a href="#" className="w-[34px] h-[34px] rounded-full border-[1.5px] border-[#93c5fd] flex items-center justify-center text-[#3b82f6] hover:bg-blue-50 transition-colors bg-white">
                <Instagram className="w-4 h-4 stroke-[2]" />
              </a>
            </div>
          </div>

          {/* Right Footer Area */}
          <div className="max-w-sm space-y-4 w-full">
            <span className="text-[#0284c7] text-[15px] font-medium inline-block border-b-[2px] border-[#2dd4bf] pb-0.5">
              {t("contact_section.qoshimcha_malumotlar", "Qo'shimcha ma'lumotlar")}
            </span>

            <ul className="space-y-4 pt-1">
              <li className="flex items-center gap-3">
                <div className="w-[28px] h-[28px] bg-[#0ea5e9] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Phone className="w-3.5 h-3.5 text-white fill-current" />
                </div>
                <span className="text-[#1a202c] text-[13px] font-medium">{t("contact_section.phone", "Telefon raqam")}: {contact.phone || "+998 78 555 31 90"}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-[28px] h-[28px] bg-[#0ea5e9] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </div>
                <span className="text-[#1a202c] text-[13px] font-medium">{t("contact_section.email", "Elektron pochta")}: info@sarvaravtotest.uz</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[28px] h-[28px] bg-[#0ea5e9] rounded-full flex items-center justify-center shrink-0 shadow-sm mt-[1px]">
                  <MapPin className="w-3.5 h-3.5 text-white fill-current" />
                </div>
                <span className="text-[#1a202c] text-[13px] font-medium leading-relaxed">{t("contact_section.address", "Manzil")}: Toshkent, Yashnobod tumani, Aviasozlar 1, 125A</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
