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
    <section id="contact" className="py-24 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">{t("contact_section.title")}</h2>
            <p className="text-xl text-gray-600 font-medium">
              {t("contact_section.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contact.phone && (
              <div className="bg-gray-50/50 rounded-3xl p-10 text-center border border-gray-100 transition-all hover:bg-gray-50 shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("contact_section.phone")}</h3>
                <a href={`tel:${contact.phone}`} className="text-primary font-bold text-lg hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.telegram_link && (
              <div className="bg-gray-50/50 rounded-3xl p-10 text-center border border-gray-100 transition-all hover:bg-gray-50 shadow-sm">
                <div className="w-16 h-16 bg-[#0088cc]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Send className="h-8 w-8 text-[#0088cc]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("contact_section.telegram")}</h3>
                <Button asChild variant="link" className="text-lg p-0 h-auto font-bold text-[#0088cc] hover:no-underline">
                  <a href={contact.telegram_link} target="_blank" rel="noopener noreferrer">
                    {contact.telegram || t("contact_section.telegram_link")}
                  </a>
                </Button>
              </div>
            )}

            {contact.address && (
              <div className="bg-gray-50/50 rounded-3xl p-10 text-center border border-gray-100 transition-all hover:bg-gray-50 shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t("contact_section.address")}</h3>
                <p className="text-gray-600 font-medium whitespace-pre-line">
                  {contact.address}
                </p>
              </div>
            )}
          </div>

          {!contact.phone && !contact.telegram_link && !contact.address && (
            <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-xl text-gray-500 font-medium">
                {t("contact_section.no_data")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
