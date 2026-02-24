"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2, BookOpen, Sparkles, RefreshCw, Layers, X } from "lucide-react"
import type { Ticket } from "@/lib/types"

interface TicketWithTests extends Ticket {
  test_count?: number
}

export function TicketsManagement() {
  const [tickets, setTickets] = useState<TicketWithTests[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [ticketTests, setTicketTests] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketTests()
    }
  }, [selectedTicket])

  const fetchTickets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Xatolik",
        description: "Biletlarni yuklashda xatolik: " + error.message,
        variant: "destructive"
      })
    }

    if (data) {
      const ticketsWithCounts = await Promise.all(
        data.map(async (ticket) => {
          const { count } = await supabase
            .from("ticket_tests")
            .select("*", { count: "exact", head: true })
            .eq("ticket_id", ticket.id)
          return { ...ticket, test_count: count || 0 }
        })
      )
      setTickets(ticketsWithCounts)
    }
    setLoading(false)
  }

  const handleGenerateTickets = async () => {
    setIsGenerating(true)
    const { error } = await supabase.rpc("divide_tests_into_tickets", { batch_size: 20 })

    if (error) {
      toast({
        title: "Xatolik",
        description: "Biletlarni generatsiya qilishda xatolik: " + error.message,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: "Biletlar muvaffaqiyatli generatsiya qilindi"
      })
      fetchTickets()
    }
    setIsGenerating(false)
  }

  const handleDeleteTicket = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Ushbu biletni o'chirib tashlamoqchimisiz?")) return

    const { error } = await supabase.from("tickets").delete().eq("id", id)

    if (error) {
      toast({
        title: "Xatolik",
        description: "Biletni o'chirishda xatolik: " + error.message,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: "Bilet o'chirib tashlandi"
      })
      if (selectedTicket === id) setSelectedTicket(null)
      fetchTickets()
    }
  }

  const fetchTicketTests = async () => {
    if (!selectedTicket) return

    const { data } = await supabase
      .from("ticket_tests")
      .select(`
        *,
        tests (*)
      `)
      .eq("ticket_id", selectedTicket)
      .order("order_index")

    if (data) {
      setTicketTests(data)
    }
  }

  const handleTogglePublic = async (ticketId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tickets")
      .update({ is_public: !currentStatus })
      .eq("id", ticketId)

    if (error) {
      toast({
        title: "Error",
        description: "Bilet holatini o'zgartirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Bilet ${!currentStatus ? "Public" : "Premium"} holatiga o'tkazildi`,
      })
      fetchTickets()
    }
  }

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Biletlar Boshqaruvi</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">Avtomatik yaratilgan biletlarni sozlash</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleGenerateTickets}
            disabled={isGenerating}
            className="h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
            Testlarni Biletlarga Bo'lish
          </Button>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest">
            <BookOpen className="h-4 w-4" />
            <span>Avtomatik rejim faol</span>
          </div>
        </div>
      </div>

      <div className="glass-dark border border-white/5 p-4 rounded-3xl bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 scale-150 opacity-5 rotate-12">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="p-3 bg-primary/20 rounded-xl">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <p className="text-slate-300 font-bold text-sm leading-relaxed max-w-2xl">
            Biletlar har 20 ta testdan so'ng avtomatik ravishda yaratiladi.
            Siz biletlarning <span className="text-white underline decoration-primary underline-offset-4">Public/Premium</span> holatini boshqarishingiz mumkin.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-white tracking-tight italic">Biletlar Ro'yxati</h3>
            <Badge className="rounded-lg bg-white/5 text-slate-500 border border-white/10 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
              {tickets.length} TA BILET
            </Badge>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 glass-dark border border-white/5 rounded-3xl">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Yuklanmoqda...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-24 glass-dark border border-white/5 rounded-3xl space-y-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 opacity-20">
                <BookOpen className="h-8 w-8 text-slate-700" />
              </div>
              <div className="space-y-2">
                <p className="text-white text-lg font-black italic tracking-tighter uppercase">Hozircha biletlar yo'q</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">Yangi testlar qo'shilganda biletlar avtomatik shakllanadi.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar lg:max-h-[calc(100vh-350px)]">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 cursor-pointer border ${selectedTicket === ticket.id
                      ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  onClick={() => setSelectedTicket(ticket.id === selectedTicket ? null : ticket.id)}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-sm text-primary border border-white/5 group-hover:scale-105 transition-transform">
                      {ticket.title.match(/\d+/)?.[0] || ticket.title.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white block tracking-tight uppercase leading-tight">{ticket.title}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                        {ticket.test_count || 0} / 20 TEST
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={`h-7 px-2 rounded-lg text-[8px] font-black uppercase border-none tracking-widest ${ticket.is_public ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        }`}
                    >
                      {ticket.is_public ? "Bepul" : "Premium"}
                    </Badge>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTogglePublic(ticket.id, !!ticket.is_public)
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20"
                      onClick={(e) => handleDeleteTicket(ticket.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-32 h-fit">
          {selectedTicket ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight italic">Bilet Testlari</h3>
                  <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-0.5 italic">{selectedTicketData?.title}</p>
                </div>
                <Badge className="rounded-lg bg-primary text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                  {ticketTests.length} / 20
                </Badge>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar lg:max-h-[calc(100vh-350px)]">
                {ticketTests.map((tt: any, index: number) => (
                  <div
                    key={tt.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex gap-4">
                      <span className="font-black text-primary/30 text-xl italic tracking-tighter group-hover:text-primary transition-colors">
                        #{index + 1}
                      </span>
                      <p className="font-bold text-xs text-slate-300 leading-snug line-clamp-2">
                        {tt.tests?.question}
                      </p>
                    </div>
                  </div>
                ))}
                {ticketTests.length === 0 && (
                  <div className="text-center py-20 px-8 glass-dark border border-white/5 rounded-3xl space-y-4">
                    <X className="h-10 w-10 text-slate-800 mx-auto" />
                    <p className="text-slate-500 font-bold italic text-sm">Bu biletda hali testlar mavjud emas</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-[400px] glass-dark border border-white/5 rounded-3xl text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Layers className="h-6 w-6 text-slate-800" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white tracking-tight italic">Bilet tanlanmagan</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-[200px]">
                  Bilet ichidagi testlarni ko'rish va tartibini tekshirish uchun ro'yxatdan birini tanlang.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
