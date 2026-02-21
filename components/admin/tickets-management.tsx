"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2, Plus, X, BookOpen } from "lucide-react"
import type { Ticket, Test } from "@/lib/types"

interface TicketWithTests extends Ticket {
  test_count?: number
}

export function TicketsManagement() {
  const [tickets, setTickets] = useState<TicketWithTests[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  // Ticket tests management
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [ticketTests, setTicketTests] = useState<any[]>([])

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
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false })

    if (data) {
      // Get test counts for each ticket
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
      <div className="bg-[#1976d2]/5 border-2 border-[#1976d2]/30 p-6 text-[#1976d2] font-bold text-lg">
        <p className="flex items-center gap-2 mb-2">
          <BookOpen className="h-6 w-6" />
          <span>Avtomatik biletlar tizimi faol.</span>
        </p>
        <p className="font-medium opacity-80">Biletlar har 20 ta testdan so'ng avtomatik ravishda yaratiladi va tartiblanadi. Faqat biletning "Public/Premium" holatini o'zgartirishingiz mumkin.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="pb-4 border-b-2 border-gray-300">
            <h2 className="text-2xl font-bold uppercase tracking-wide">Biletlar ro'yxati</h2>
            <p className="text-gray-500">Barcha avtomatik yaratilgan biletlar</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xl font-bold">Biletlar yuklanmoqda...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 bg-white text-xl font-bold text-gray-500">
              Hozircha biletlar mavjud emas. Testlar qo'shilganda biletlar paydo bo'ladi.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`flex items-center justify-between border-2 p-5 cursor-pointer transition-colors ${selectedTicket === ticket.id ? "border-[#1976d2] bg-[#1976d2]/5" : "border-gray-300 bg-white"
                    }`}
                  onClick={() => setSelectedTicket(ticket.id === selectedTicket ? null : ticket.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold uppercase">{ticket.title}</span>
                      <span className="text-lg font-medium text-gray-500">{ticket.test_count || 0}/20 testlar</span>
                    </div>
                    <Badge
                      className={`h-10 px-5 rounded-none text-base font-bold uppercase border-none ${ticket.is_public ? "bg-[#3ca64c] text-white" : "bg-red-600 text-white"}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTogglePublic(ticket.id, !!ticket.is_public)
                      }}
                    >
                      {ticket.is_public ? "Public" : "Premium"}
                    </Badge>
                  </div>
                  <Button
                    className="h-12 px-6 bg-[#1976d2] text-white font-bold uppercase"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTogglePublic(ticket.id, !!ticket.is_public)
                    }}
                  >
                    O'zgartirish
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTicket && (
          <div className="space-y-6">
            <div className="pb-4 border-b-2 border-[#1976d2]/30 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Bilet testlari ({ticketTests.length}/20)</h2>
                <p className="text-[#1976d2] font-bold text-lg">{selectedTicketData?.title}</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
              {ticketTests.map((tt: any, index: number) => (
                <div
                  key={tt.id}
                  className="p-5 border-2 border-gray-300 bg-white text-lg"
                >
                  <div className="flex gap-4">
                    <span className="font-black text-[#1976d2]/40 text-2xl">#{index + 1}</span>
                    <p className="font-bold leading-tight">
                      {tt.tests?.question}
                    </p>
                  </div>
                </div>
              ))}
              {ticketTests.length === 0 && (
                <p className="text-center text-gray-400 py-10 font-bold italic">Biletda testlar mavjud emas</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
