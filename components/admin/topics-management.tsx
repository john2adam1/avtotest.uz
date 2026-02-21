"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Topic } from "@/lib/types"

export function TopicsManagement() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [title, setTitle] = useState("")
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("topics")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setTopics(data)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setEditingTopic(null)
    setIsPublic(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Mavzu nomini kiriting",
        variant: "destructive",
      })
      return
    }

    if (editingTopic) {
      const { error } = await supabase
        .from("topics")
        .update({
          title: title.trim(),
          is_public: isPublic,
        })
        .eq("id", editingTopic.id)

      if (error) {
        toast({
          title: "Error",
          description: "Mavzuni yangilashda xatolik yuz berdi",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Mavzu muvaffaqiyatli yangilandi",
        })
        resetForm()
        fetchTopics()
      }
    } else {
      const { error } = await supabase.from("topics").insert({
        title: title.trim(),
        is_public: isPublic,
      })

      if (error) {
        toast({
          title: "Error",
          description: "Mavzuni yaratishda xatolik yuz berdi",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Mavzu muvaffaqiyatli yaratildi",
        })
        resetForm()
        fetchTopics()
      }
    }
  }

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic)
    setTitle(topic.title)
    setIsPublic(topic.is_public ?? true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu mavzuni o'chirishni xohlaysizmi? Bu mavzudagi barcha testlar ham o'chib ketadi.")) {
      return
    }

    const { error } = await supabase.from("topics").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Mavzuni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Mavzu muvaffaqiyatli o'chirildi",
      })
      fetchTopics()
    }
  }

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="pb-4 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold uppercase tracking-wide">{editingTopic ? "Mavzuni tahrirlash" : "Mavzu yaratish"}</h2>
          <p className="text-gray-500">
            {editingTopic ? "Mavzu haqida ma'lumotlarni yangilash" : "Yangi mavzu yaratish"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg font-bold">Mavzu nomi</Label>
            <Input
              id="title"
              className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg font-bold"
              placeholder="Mavzu nomini kiriting..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-3 bg-white p-4 border-2 border-gray-300">
            <Checkbox
              id="is-public"
              checked={isPublic}
              className="h-6 w-6 rounded-none border-2 border-gray-400 data-[state=checked]:bg-[#1976d2] data-[state=checked]:border-[#1976d2]"
              onCheckedChange={(v) => setIsPublic(Boolean(v))}
            />
            <Label htmlFor="is-public" className="text-lg font-bold cursor-pointer">Ommaviy (bepul)</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="h-14 px-10 bg-[#1976d2] text-white font-bold text-xl uppercase flex-1">
              {editingTopic ? "Mavzuni tahrirlash" : "Mavzu yaratish"}
            </Button>
            {editingTopic && (
              <Button type="button" variant="outline" className="h-14 px-8 border-2 border-gray-400 font-bold" onClick={resetForm}>
                Bekor qilish
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="pb-4 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold uppercase tracking-wide">Mavzular ro'yxati</h2>
          <p className="text-gray-500 text-lg">Barcha mavzular</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xl font-bold">Mavzular yuklanmoqda...</div>
        ) : topics.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-gray-300 bg-white text-center text-xl font-bold text-gray-500 italic">
            Hozircha mavzular mavjud emas. Birinchi mavzuni yarating!
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic.id} className="flex items-center justify-between border-2 border-gray-300 p-5 bg-white">
                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold">{topic.title}</span>
                  <Badge className={`h-10 px-5 rounded-none text-base font-bold uppercase border-none ${topic.is_public ? "bg-[#3ca64c] text-white" : "bg-red-600 text-white"}`}>
                    {topic.is_public ? "Public" : "Premium"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button className="h-12 w-12 bg-gray-100 text-gray-700 border-2 border-gray-300 flex items-center justify-center p-0" onClick={() => handleEdit(topic)}>
                    <Edit2 className="h-5 w-5" />
                  </Button>
                  <Button className="h-12 w-12 bg-red-50 text-red-600 border-2 border-red-200 flex items-center justify-center p-0" onClick={() => handleDelete(topic.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
