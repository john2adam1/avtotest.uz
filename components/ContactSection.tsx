"use client"

import { Button } from "@/components/ui/button"
import { Phone, MapPin, Send } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ContactData } from "@/lib/landing-types"

interface ContactSectionProps {
  contact: ContactData
}

import { useState, useEffect } from "react"

export function ContactSection({ contact }: ContactSectionProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-[#e9f6ff]">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic">{t("contact_section.title")}</h2>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
              {t("contact_section.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contact.phone && (
              <div className="group bg-white rounded-[2.5rem] p-8 text-center border border-slate-100 shadow-xl shadow-blue-500/5 transition-all duration-300 hover:scale-105">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Phone className="h-10 w-10 text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase italic">{t("contact_section.phone")}</h3>
                <a href={`tel:${contact.phone}`} className="text-blue-600 font-black text-xl hover:text-blue-700 transition-all italic tracking-tight">
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.telegram_link && (
              <div className="group bg-white rounded-[2.5rem] p-8 text-center border border-slate-100 shadow-xl shadow-blue-500/5 transition-all duration-300 hover:scale-105">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#0088cc] group-hover:text-white transition-all duration-300">
                  <Send className="h-10 w-10 text-[#0088cc] transition-colors" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase italic">{t("contact_section.telegram")}</h3>
                <Button asChild variant="link" className="p-0 h-auto font-black text-xl text-[#0088cc] hover:text-[#0077bb] transition-colors italic tracking-tight">
                  <a href={contact.telegram_link} target="_blank" rel="noopener noreferrer">
                    {contact.telegram || t("contact_section.telegram_link")}
                  </a>
                </Button>
              </div>
            )}

            {contact.address && (
              <div className="group bg-white rounded-[2.5rem] p-8 text-center border border-slate-100 shadow-xl shadow-blue-500/5 transition-all duration-300 hover:scale-105">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <MapPin className="h-10 w-10 text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase italic">{t("contact_section.address")}</h3>
                <p className="text-lg text-slate-500 font-bold leading-relaxed">
                  {contact.address}
                </p>
              </div>
            )}
          </div>

          {!contact.phone && !contact.telegram_link && !contact.address && (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-xl shadow-blue-500/5 mt-8">
              <p className="text-xl text-slate-400 font-black uppercase italic tracking-widest">
                {t("contact_section.no_data")}
              </p>
            </div>
          )}

          <div className="mt-24 pt-12 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs font-black tracking-widest uppercase italic">
              &copy; {new Date().getFullYear()} Tezkor Avtotest
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
