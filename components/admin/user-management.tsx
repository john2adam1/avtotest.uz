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
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (data) {
      setUsers(data)
      fetchUserStats(data.map(u => u.id))
    }
    setLoading(false)
  }

  const fetchUserStats = async (userIds: string[]) => {
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

    setUserStats(stats)
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

  if (loading) {
    return <div>Yuklanmoqda...</div>
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Foydalanuvchilar</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">Platforma foydalanuvchilarini boshqarish va statistika</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs font-bold">
          Jami: {users.length}
        </div>
      </div>

      <div className="grid gap-2">
        {users.map((user) => (
          <div key={user.id} className="glass-dark border border-white/5 rounded-2xl p-3 transition-all duration-300 hover:border-white/10 group relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 relative z-10">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-black text-white tracking-tight">{user.email}</p>
                  {user.role === "admin" && (
                    <Badge className="rounded-md bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 px-1.5 py-0 text-[8px] font-black uppercase">
                      Admin
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap text-[10px]">
                  <div className="flex items-center gap-1 text-slate-500 font-bold">
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    ID: <span className="text-slate-400">{user.id.slice(0, 8)}</span>
                  </div>
                  {user.subscription_end && (
                    <div className="flex items-center gap-1 text-slate-500 font-bold">
                      <span className="w-1 h-1 rounded-full bg-success" />
                      Abonemasi: <span className="text-success">{new Date(user.subscription_end).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  <div className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-wider">
                    {userStats[user.id]?.examAvg || 0}%
                  </div>
                  <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                    {userStats[user.id]?.ticketAvg || 0}%
                  </div>
                  <div className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider">
                    {userStats[user.id]?.topicAvg || 0}%
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-white/5 pt-3 lg:pt-0 lg:pl-4">
                <Button
                  variant="ghost"
                  className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold transition-all border border-white/5"
                  onClick={() => {
                    setSelectedUser(user)
                    setResetPasswordOpen(true)
                  }}
                >
                  <KeyRound className="mr-1.5 h-3 w-3 text-primary" />
                  Parol
                </Button>

                {hasActiveSubscription(user) ? (
                  <div className="flex items-center gap-2">
                    <div className="h-8 px-3 rounded-lg bg-success/10 border border-success/20 text-success flex items-center shadow-lg shadow-success/5">
                      <CheckCircle2 className="mr-1.5 h-3 w-3" />
                      <span className="font-black uppercase tracking-widest text-[9px]">Aktiv</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-8 px-3 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-[10px] font-bold transition-all"
                      onClick={() => revokeSubscription(user.id)}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-8 px-3 rounded-lg bg-slate-900/50 border border-white/5 text-slate-500 flex items-center">
                      <XCircle className="mr-1.5 h-3 w-3" />
                      <span className="font-black uppercase tracking-widest text-[9px] text-slate-600">FAOL EMAS</span>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 px-4 bg-primary hover:bg-primary/90 text-white font-black rounded-lg shadow-lg shadow-primary/20 transition-all border-none text-[10px]"
                      onClick={() => grantSubscription(user.id)}
                    >
                      Grant 1 Oy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="glass-dark border-white/10 rounded-[2.5rem] p-8 shadow-3xl text-white max-w-md">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tight">Parolni yangilash</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Foydalanuvchi: <span className="text-white font-bold">{selectedUser?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300 ml-1">Yangi parol</Label>
              <Input
                id="new-password"
                type="password"
                className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary/50 focus:border-primary transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300 ml-1">Parolni tasdiqlash</Label>
              <Input
                id="confirm-password"
                type="password"
                className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary/50 focus:border-primary transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-6 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-14 flex-1 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold"
                onClick={() => setResetPasswordOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                className="h-14 flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50"
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
