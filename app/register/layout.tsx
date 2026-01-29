import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Ro'yxatdan o'tish | Sarvar Avtotest",
    description: "Tezkor Avtotest tizimida ro'yxatdan o'ting va bepul imtihon testlarini yeching.",
}

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
