"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle } from "lucide-react"
import type { User } from "@/lib/types"

import { adminUpdateUserPassword, adminGrantSubscription, adminRevokeSubscription } from "@/app/admin/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound } from "lucide-react"

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<Record<string, { examAvg: number, ticketAvg: number, topicAvg: number }>>({})
  const [loading, setLoading] = useState(true)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false })
      if (!isMounted) return;

      if (data) {
        setUsers(data)
        const stats = await fetchUserStatsInternal(data.map(u => u.id))
        if (isMounted) setUserStats(stats)
      }
      setLoading(false)
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  const fetchUserStatsInternal = async (userIds: string[]) => {
    const stats: Record<string, { examAvg: number, ticketAvg: number, topicAvg: number }> = {}

    await Promise.all(userIds.map(async (uid) => {
      const [exams, tickets, topics] = await Promise.all([
        supabase.from("exam_statistics").select("percentage").eq("user_id", uid),
        supabase.from("ticket_statistics").select("percentage").eq("user_id", uid),
        supabase.from("topic_statistics").select("percentage").eq("user_id", uid)
      ])

      const calcAvg = (data: any[] | null) => {
        if (!data || data.length === 0) return 0
        const sum = data.reduce((acc, curr) => acc + (curr.percentage || 0), 0)
        return Math.round(sum / data.length)
      }

      stats[uid] = {
        examAvg: calcAvg(exams.data),
        ticketAvg: calcAvg(tickets.data),
        topicAvg: calcAvg(topics.data)
      }
    }))

    return stats
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (data) {
      setUsers(data)
      const stats = await fetchUserStatsInternal(data.map(u => u.id))
      setUserStats(stats)
    }
    setLoading(false)
  }

  const grantSubscription = async (userId: string) => {
    console.log('Granting subscription to user:', userId)

    const result = await adminGrantSubscription(userId, 1)

    if (result.error) {
      console.error('Error granting subscription:', result.error)
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      console.log('Subscription granted successfully')
      toast({
        title: "Success",
        description: "Foydalanuvchi abonemasi muvaffaqiyatli taqdim etildi",
        variant: "default",
      })
      await fetchUsers()
    }
  }

  const revokeSubscription = async (userId: string) => {
    console.log('Revoking subscription for user:', userId)

    const result = await adminRevokeSubscription(userId)

    if (result.error) {
      console.error('Error revoking subscription:', result.error)
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      console.log('Subscription revoked successfully')
      toast({
        title: "Success",
        description: "Foydalanuvchi abonemasi muvaffaqiyatli bekor qilindi",
        variant: "default",
      })
      await fetchUsers()
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Parollar mos kelmadi",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        variant: "destructive",
      })
      return
    }

    setUpdatingPassword(true)
    const result = await adminUpdateUserPassword(selectedUser.id, newPassword)
    setUpdatingPassword(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Parol muvaffaqiyatli yangilandi",
      })
      setResetPasswordOpen(false)
      setNewPassword("")
      setConfirmPassword("")
      setSelectedUser(null)
    }
  }

  const hasActiveSubscription = (user: User) => {
    if (!user.subscription_end) return false
    return new Date(user.subscription_end) > new Date()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Foydalanuvchilar</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Platforma foydalanuvchilarini boshqarish va statistika</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-slate-500 text-xs font-bold shadow-sm">
          Jami: {loading ? "..." : users.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Foydalanuvchilar yuklanmoqda...</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {users.map((user) => (
            <div key={user.id} className="bg-white border border-slate-100 rounded-2xl p-3 transition-all duration-300 hover:border-blue-100 group relative overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute -right-20 -top-20 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex flex-col lg:flex-row lg:items-center gap-4 relative z-10">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{user.email}</p>
                    {user.role === "admin" && (
                      <Badge className="rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0 text-[8px] font-black uppercase">
                        Admin
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-[10px]">
                    <div className="flex items-center gap-1 text-slate-500 font-bold">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      ID: <span className="text-slate-400">{user.id.slice(0, 8)}</span>
                    </div>
                    {user.role !== "admin" && user.subscription_end && (
                      <div className="flex items-center gap-1 text-slate-500 font-bold">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Abonemasi: <span className="text-emerald-600">{new Date(user.subscription_end).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    <div className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[9px] font-black uppercase tracking-wider">
                      {userStats[user.id]?.examAvg || 0}%
                    </div>
                    <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                      {userStats[user.id]?.ticketAvg || 0}%
                    </div>
                    <div className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-[9px] font-black uppercase tracking-wider">
                      {userStats[user.id]?.topicAvg || 0}%
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                  <Button
                    variant="ghost"
                    className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-900 text-[10px] font-bold transition-all border border-slate-100 hover:border-blue-100"
                    onClick={() => {
                      setSelectedUser(user)
                      setResetPasswordOpen(true)
                    }}
                  >
                    <KeyRound className="mr-1.5 h-3 w-3 text-blue-600" />
                    Parol
                  </Button>

                  {user.role !== "admin" && (
                    hasActiveSubscription(user) ? (
                      <div className="flex items-center gap-2">
                        <div className="h-8 px-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center shadow-sm">
                          <CheckCircle2 className="mr-1.5 h-3 w-3" />
                          <span className="font-black uppercase tracking-widest text-[9px]">Aktiv</span>
                        </div>
                        <Button
                          variant="ghost"
                          className="h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[10px] font-bold transition-all"
                          onClick={() => revokeSubscription(user.id)}
                        >
                          Bekor qilish
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center">
                          <XCircle className="mr-1.5 h-3 w-3" />
                          <span className="font-black uppercase tracking-widest text-[9px] text-slate-500">FAOL EMAS</span>
                        </div>
                        <Button
                          size="sm"
                          className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg shadow-lg shadow-blue-500/20 transition-all border-none text-[10px]"
                          onClick={() => grantSubscription(user.id)}
                        >
                          Grant 1 Oy
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="bg-white border-slate-100 rounded-[2.5rem] p-8 shadow-3xl text-slate-900 max-w-md">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tight uppercase italic">Parolni yangilash</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Foydalanuvchi: <span className="text-blue-600 font-bold">{selectedUser?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-500 ml-1 font-bold text-xs uppercase tracking-widest">Yangi parol</Label>
              <Input
                id="new-password"
                type="password"
                className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold px-6"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-500 ml-1 font-bold text-xs uppercase tracking-widest">Parolni tasdiqlash</Label>
              <Input
                id="confirm-password"
                type="password"
                className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold px-6"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-6 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-14 flex-1 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold border border-slate-100 transition-all"
                onClick={() => setResetPasswordOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                className="h-14 flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-50 border-none transition-all active:scale-95"
                disabled={updatingPassword}
              >
                {updatingPassword ? "Saqlanmoqda..." : "Tasdiqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
