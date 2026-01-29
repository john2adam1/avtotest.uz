import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Kirish | Sarvar Avtotest",
    description: "Tizimga kirish va testlarni davom ettirish.",
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
