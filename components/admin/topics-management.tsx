"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2, Plus } from "lucide-react"
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
    let isMounted = true;
    const fetchTopics = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: false })

      if (data && isMounted) {
        setTopics(data)
      }
      if (isMounted) setLoading(false)
    }
    fetchTopics()
    return () => { isMounted = false }
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Mavzular</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">O'quv dasturi mavzularini boshqarish</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-slate-500 text-[10px] font-bold uppercase shadow-sm">
          Jami: {topics.length} mavzu
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Topic Creation / Editing Form */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-50 transition-opacity duration-500" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Edit2 className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  {editingTopic ? "Tahrirlash" : "Yaratish"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-500 text-xs ml-1 font-bold uppercase tracking-widest">Mavzu nomi</Label>
                  <Input
                    id="title"
                    className="h-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 text-sm font-bold placeholder:text-slate-400 focus:ring-blue-500/50 focus:border-blue-600 transition-all px-4"
                    placeholder="Mavzu nomini kiriting..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <Label
                  htmlFor="is-public"
                  className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group/check"
                >
                  <Checkbox
                    id="is-public"
                    checked={isPublic}
                    className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all"
                    onCheckedChange={(v) => setIsPublic(Boolean(v))}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-700 select-none">
                      Ommaviy (bepul)
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Bu mavzu barcha uchun ochiq
                    </p>
                  </div>
                </Label>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="h-11 flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all border-none">
                    {editingTopic ? "Saqlash" : "Yaratish"}
                  </Button>
                  {editingTopic && (
                    <Button type="button" variant="ghost" className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold border border-slate-200 transition-all" onClick={resetForm}>
                      X
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Topics List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight italic uppercase">Mavzular Ro'yxati</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Yuklanmoqda...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="py-16 bg-white border border-slate-100 rounded-3xl shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-bold italic">Hozircha mavzular mavjud emas.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {topics.map((topic) => (
                <div key={topic.id} className="group flex items-center justify-between bg-white border border-slate-100 hover:border-blue-200 p-3 pl-4 rounded-2xl transition-all duration-300 hover:translate-x-1 shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-sm text-blue-600 transition-transform group-hover:scale-105">
                      {topic.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 tracking-tight">{topic.title}</span>
                      <Badge className={`h-5 w-fit px-2 rounded-md text-[8px] font-black uppercase tracking-widest border-none mt-1 ${topic.is_public ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {topic.is_public ? "Bepul" : "Premium"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 bg-slate-50 hover:bg-blue-50 text-slate-900 border border-slate-100 hover:border-blue-100 rounded-lg flex items-center justify-center p-0 transition-all"
                      onClick={() => handleEdit(topic)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg flex items-center justify-center p-0 transition-all"
                      onClick={() => handleDelete(topic.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
