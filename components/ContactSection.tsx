"use client"

import { Button } from "@/components/ui/button"
import { Phone, MapPin, Send } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ContactData } from "@/lib/landing-types"

interface ContactSectionProps {
  contact: ContactData
}

export function ContactSection({ contact }: ContactSectionProps) {
  const { t } = useTranslation()

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">{t("contact_section.title")}</h2>
            <p className="text-lg text-muted-foreground">
              {t("contact_section.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contact.phone && (
              <div className="group bg-background/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center hover:bg-background/80 transition-all hover:-translate-y-1 shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("contact_section.phone")}</h3>
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline text-lg">
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.telegram_link && (
              <div className="group bg-background/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center hover:bg-background/80 transition-all hover:-translate-y-1 shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("contact_section.telegram")}</h3>
                <Button asChild variant="link" className="text-lg p-0 h-auto">
                  <a href={contact.telegram_link} target="_blank" rel="noopener noreferrer">
                    {contact.telegram || t("contact_section.telegram_link")}
                  </a>
                </Button>
              </div>
            )}

            {contact.address && (
              <div className="group bg-background/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center hover:bg-background/80 transition-all hover:-translate-y-1 shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("contact_section.address")}</h3>
                <p className="text-muted-foreground">
                  {contact.address}
                </p>
              </div>
            )}
          </div>

          {!contact.phone && !contact.telegram_link && !contact.address && (
            <div className="text-center p-12 bg-muted/30 rounded-2xl border border-dashed">
              <p className="text-muted-foreground">
                {t("contact_section.no_data")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
