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
import { Trash2, Edit2, Plus, X } from "lucide-react"
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
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 mb-6">
        <p className="font-medium">ℹ️ Avtomatik biletlar tizimi faol.</p>
        <p>Biletlar har 20 ta testdan so'ng avtomatik ravishda yaratiladi va tartiblanadi. Faqat biletning "Public/Premium" holatini o'zgartirishingiz mumkin.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Biletlar ro'yxati</CardTitle>
            <CardDescription>Barcha avtomatik yaratilgan biletlar</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Biletlar yuklanmoqda...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Hozircha biletlar mavjud emas. Testlar qo'shilganda biletlar paydo bo'ladi.
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${selectedTicket === ticket.id ? "border-primary bg-primary/5" : ""
                      }`}
                    onClick={() => setSelectedTicket(ticket.id === selectedTicket ? null : ticket.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{ticket.title}</span>
                        <span className="text-xs text-muted-foreground">{ticket.test_count || 0}/20 testlar</span>
                      </div>
                      <Badge
                        variant={ticket.is_public ? "outline" : "destructive"}
                        className="cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePublic(ticket.id, !!ticket.is_public)
                        }}
                      >
                        {ticket.is_public ? "Public" : "Premium"}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation()
                      handleTogglePublic(ticket.id, !!ticket.is_public)
                    }}>
                      O'zgartirish
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTicket && (
          <Card>
            <CardHeader>
              <CardTitle>Bilet testlari ({ticketTests.length}/20)</CardTitle>
              <CardDescription>{selectedTicketData?.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {ticketTests.map((tt: any, index: number) => (
                  <div
                    key={tt.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium">#{index + 1}</p>
                      <p className="text-muted-foreground">
                        {tt.tests?.question}
                      </p>
                    </div>
                  </div>
                ))}
                {ticketTests.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Biletda testlar mavjud emas</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
