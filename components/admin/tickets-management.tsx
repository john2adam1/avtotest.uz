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
    let isMounted = true;
    const loadData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_tests(count)")
        .order("created_at", { ascending: false })

      if (!isMounted) return

      if (error) {
        toast({
          title: "Xatolik",
          description: "Biletlarni yuklashda xatolik: " + error.message,
          variant: "destructive"
        })
      }

      if (data) {
        const ticketsWithCounts = data.map(ticket => ({
          ...ticket, test_count: ticket.ticket_tests?.[0]?.count || 0
        }))
        ticketsWithCounts.sort((a, b) => {
          const numA = parseInt(a.title.match(/\d+/)?.[0] || "0", 10)
          const numB = parseInt(b.title.match(/\d+/)?.[0] || "0", 10)
          return numA - numB
        })
        if (isMounted) setTickets(ticketsWithCounts)
      }
      if (isMounted) setLoading(false)
    }

    loadData()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true;
    if (selectedTicket) {
      const loadTests = async () => {
        const tests = await fetchTicketTestsInternal(selectedTicket)
        if (isMounted) setTicketTests(tests)
      }
      loadTests()
    }
    return () => { isMounted = false }
  }, [selectedTicket])

  const fetchTicketTestsInternal = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_tests")
      .select(`
        *,
        tests (*)
      `)
      .eq("ticket_id", ticketId)
      .order("order_index")
    return data || []
  }

  const fetchTickets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("tickets")
      .select("*, ticket_tests(count)")
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Xatolik",
        description: "Biletlarni yuklashda xatolik: " + error.message,
        variant: "destructive"
      })
    }

    if (data) {
      const ticketsWithCounts = data.map(ticket => ({
        ...ticket, test_count: ticket.ticket_tests?.[0]?.count || 0
      }))
      ticketsWithCounts.sort((a, b) => {
        const numA = parseInt(a.title.match(/\d+/)?.[0] || "0", 10)
        const numB = parseInt(b.title.match(/\d+/)?.[0] || "0", 10)
        return numA - numB
      })
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


  const handleTogglePublic = async (ticketId: string, currentStatus: boolean) => {
    // Optimistic update
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, is_public: !currentStatus } : t))
    
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
      // Revert optimistic update on error
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, is_public: currentStatus } : t))
    } else {
      toast({
        title: "Success",
        description: `Bilet ${!currentStatus ? "Public" : "Premium"} holatiga o'tkazildi`,
      })
    }
  }

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Biletlar Boshqaruvi</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Avtomatik yaratilgan biletlarni sozlash</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleGenerateTickets}
            disabled={isGenerating}
            className="h-10 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
            Testlarni Biletlarga Bo'lish
          </Button>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20">
            <BookOpen className="h-4 w-4" />
            <span>Avtomatik rejim faol</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-4 scale-150 opacity-5 rotate-12">
          <BookOpen className="h-10 w-10 text-blue-600" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-slate-600 font-bold text-sm leading-relaxed max-w-2xl">
            Biletlar har 20 ta testdan so'ng avtomatik ravishda yaratiladi.
            Siz biletlarning <span className="text-blue-600 underline decoration-blue-600/30 underline-offset-4">Public/Premium</span> holatini boshqarishingiz mumkin.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight italic">Biletlar Ro'yxati</h3>
            <Badge className="rounded-lg bg-white text-slate-500 border border-slate-100 px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-sm">
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
                    ? "bg-blue-50 border-blue-600 shadow-md"
                    : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm"
                    }`}
                  onClick={() => setSelectedTicket(ticket.id === selectedTicket ? null : ticket.id)}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-sm text-blue-600 border border-slate-100 group-hover:scale-105 transition-transform">
                      {ticket.title.match(/\d+/)?.[0] || ticket.title.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 block tracking-tight uppercase leading-tight">{ticket.title}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        {ticket.test_count || 0} / 20 TEST
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={`h-7 px-2 rounded-lg text-[8px] font-black uppercase border-none tracking-widest ${ticket.is_public ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        }`}
                    >
                      {ticket.is_public ? "Bepul" : "Premium"}
                    </Badge>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-900 border border-slate-100 hover:border-blue-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTogglePublic(ticket.id, !!ticket.is_public)
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 p-0 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100"
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
                  <h3 className="text-lg font-black text-slate-900 tracking-tight italic">Bilet Testlari</h3>
                  <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] mt-0.5 italic">{selectedTicketData?.title}</p>
                </div>
                <Badge className="rounded-lg bg-blue-600 text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20">
                  {ticketTests.length} / 20
                </Badge>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar lg:max-h-[calc(100vh-350px)]">
                {ticketTests.map((tt: any, index: number) => (
                  <div
                    key={tt.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group shadow-sm"
                  >
                    <div className="flex gap-4">
                      <span className="font-black text-blue-600/20 text-xl italic tracking-tighter group-hover:text-blue-600 transition-colors">
                        #{index + 1}
                      </span>
                      <p className="font-bold text-xs text-slate-600 leading-snug line-clamp-2">
                        {tt.tests?.question}
                      </p>
                    </div>
                  </div>
                ))}
                {ticketTests.length === 0 && (
                  <div className="text-center py-20 px-8 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                    <X className="h-10 w-10 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold italic text-sm">Bu biletda hali testlar mavjud emas</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-[400px] bg-white border border-slate-100 rounded-3xl text-center p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <Layers className="h-6 w-6 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight italic">Bilet tanlanmagan</h3>
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
