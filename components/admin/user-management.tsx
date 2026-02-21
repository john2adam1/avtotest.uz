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
    <div className="space-y-6">
      <div className="pb-4 border-b-2 border-gray-300">
        <h2 className="text-2xl font-bold">Foydalanuvchi boshqarish</h2>
        <p className="text-gray-500">Foydalanuvchi abonemalarini va kirishlarini boshqarish</p>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between border-2 border-gray-300 p-6 bg-white">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold">{user.email}</p>
                {user.role === "admin" && <Badge variant="secondary" className="rounded-none bg-gray-200">Admin</Badge>}
              </div>
              <div className="text-lg text-gray-600">
                {user.subscription_end && (
                  <span>Abonemasi: {new Date(user.subscription_end).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex gap-4 text-sm font-bold mt-2">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 border border-blue-200">
                  Imtihon: {userStats[user.id]?.examAvg || 0}%
                </span>
                <span className="bg-green-50 text-green-700 px-3 py-1 border border-green-200">
                  Bilet: {userStats[user.id]?.ticketAvg || 0}%
                </span>
                <span className="bg-purple-50 text-purple-700 px-3 py-1 border border-purple-200">
                  Mavzu: {userStats[user.id]?.topicAvg || 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-6">
              <Button
                variant="outline"
                className="h-12 px-6 border-2 border-[#1976d2] text-[#1976d2] bg-white"
                onClick={() => {
                  setSelectedUser(user)
                  setResetPasswordOpen(true)
                }}
              >
                <KeyRound className="mr-2 h-5 w-5" />
                Parol
              </Button>

              {hasActiveSubscription(user) ? (
                <>
                  <Badge variant="default" className="h-12 px-4 rounded-none bg-[#3ca64c] text-white border-none flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Aktiv
                  </Badge>
                  <Button variant="outline" className="h-12 px-6 border-2 border-red-600 text-red-600 bg-white" onClick={() => revokeSubscription(user.id)}>
                    Bekor qilish
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="destructive" className="h-12 px-4 rounded-none bg-red-600 text-white border-none flex items-center">
                    <XCircle className="mr-2 h-5 w-5" />
                    Abonemasi yo'q
                  </Badge>
                  <Button className="h-12 px-6 bg-[#1976d2] text-white" onClick={() => grantSubscription(user.id)}>
                    Abonemani taqdim etish (1 oy)
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="rounded-none border-4 border-[#1976d2]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Parolni o'zgartirish</DialogTitle>
            <DialogDescription className="text-lg">
              Foydalanuvchi: {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password">Yangi parol</Label>
              <Input
                id="new-password"
                type="password"
                className="h-12 rounded-none border-2 border-gray-300"
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
                className="h-12 rounded-none border-2 border-gray-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" className="h-12 px-8 border-2 border-gray-400" onClick={() => setResetPasswordOpen(false)}>Bekor qilish</Button>
              <Button type="submit" className="h-12 px-8 bg-[#1976d2] text-white" disabled={updatingPassword}>
                {updatingPassword ? "Yangilanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
