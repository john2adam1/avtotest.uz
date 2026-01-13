"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle } from "lucide-react"
import type { User } from "@/lib/types"

import { adminUpdateUserPassword } from "@/app/admin/actions"
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
    const subscriptionEnd = new Date()
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

    const { error } = await supabase
      .from("users")
      .update({ subscription_end: subscriptionEnd.toISOString() })
      .eq("id", userId)

    if (error) {
      toast({
        title: "Error",
        description: "Foydalanuvchi abonemasi muvaffaqiyatli taqdim etilmadi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Foydalanuvchi abonemasi muvaffaqiyatli taqdim etildi",
        variant: "default",
      })
      fetchUsers()
    }
  }

  const revokeSubscription = async (userId: string) => {
    const { error } = await supabase.from("users").update({ subscription_end: null }).eq("id", userId)

    if (error) {
      toast({
        title: "Error",
        description: "Foydalanuvchi abonemasi muvaffaqiyatli bekor qilindi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Foydalanuvchi abonemasi muvaffaqiyatli bekor qilindi",
        variant: "default",
      })
      fetchUsers()
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
    <Card>
      <CardHeader>
        <CardTitle>Foydalanuvchi boshqarish</CardTitle>
        <CardDescription>Foydalanuvchi abonemalarini va kirishlarini boshqarish</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between rounded-lg border p-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.email}</p>
                  {user.role === "admin" && <Badge variant="secondary">Admin</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {user.subscription_end && (
                    <span>Abonemasi: {new Date(user.subscription_end).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200">
                    Imtihon: {userStats[user.id]?.examAvg || 0}%
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-200">
                    Bilet: {userStats[user.id]?.ticketAvg || 0}%
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded dark:bg-purple-900 dark:text-purple-200">
                    Mavzu: {userStats[user.id]?.topicAvg || 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user)
                    setResetPasswordOpen(true)
                  }}
                >
                  <KeyRound className="mr-1 h-3 w-3" />
                  Parol
                </Button>

                {hasActiveSubscription(user) ? (
                  <>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Aktiv
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => revokeSubscription(user.id)}>
                      Bekor qilish
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Abonemasi yo'q
                    </Badge>
                    <Button variant="default" size="sm" onClick={() => grantSubscription(user.id)}>
                      Abonemani taqdim etish (1 oy)
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Parolni o'zgartirish</DialogTitle>
              <DialogDescription>
                Foydalanuvchi: {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Yangi parol</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Parolni tasdiqlash</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetPasswordOpen(false)}>Bekor qilish</Button>
                <Button type="submit" disabled={updatingPassword}>
                  {updatingPassword ? "Yangilanmoqda..." : "Saqlash"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  )
}
