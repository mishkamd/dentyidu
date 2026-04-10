'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Code, Palette } from "lucide-react"
import { toast } from "sonner"
import { createSecurityScript, updateSecurityScript, deleteSecurityScript, toggleSecurityScript } from "@/app/actions/security-scripts"

type Script = {
  id: string
  name: string
  type: string
  content: string
  isActive: boolean
  position: string
  createdAt: string
}

export function SecurityScriptsClient({ initialScripts }: { initialScripts: Script[] }) {
  const [scripts, setScripts] = useState(initialScripts)
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [editScript, setEditScript] = useState<Script | null>(null)

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await createSecurityScript(formData)
      if (result.success) {
        toast.success(result.message)
        setAddOpen(false)
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleEdit(id: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateSecurityScript(id, formData)
      if (result.success) {
        toast.success(result.message)
        setEditScript(null)
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSecurityScript(id)
      if (result.success) {
        toast.success(result.message)
        setScripts(scripts.filter(s => s.id !== id))
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await toggleSecurityScript(id)
      if (result.success) {
        setScripts(scripts.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Adaugă Script</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Script Nou</DialogTitle>
            </DialogHeader>
            <ScriptForm onSubmit={handleAdd} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {scripts.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Code className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Niciun script adăugat încă.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scripts.map((script) => (
            <div key={script.id} className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${script.type === 'css' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {script.type === 'css' ? <Palette className="w-5 h-5" /> : <Code className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900 dark:text-white truncate">{script.name}</p>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{script.type.toUpperCase()}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{script.position}</span>
                </div>
                <p className="text-xs text-zinc-500 truncate font-mono mt-0.5">{script.content.substring(0, 80)}...</p>
              </div>
              <Switch checked={script.isActive} onCheckedChange={() => handleToggle(script.id)} />
              <Button variant="ghost" size="icon" onClick={() => setEditScript(script)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(script.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editScript} onOpenChange={(open) => { if (!open) setEditScript(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editare Script</DialogTitle>
          </DialogHeader>
          {editScript && (
            <ScriptForm
              defaultValues={editScript}
              onSubmit={(fd) => handleEdit(editScript.id, fd)}
              isPending={isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ScriptForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Script
  onSubmit: (formData: FormData) => void
  isPending: boolean
}) {
  const [type, setType] = useState(defaultValues?.type || "css")
  const [position, setPosition] = useState(defaultValues?.position || "head")
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true)

  return (
    <form
      action={(fd) => {
        fd.set("type", type)
        fd.set("position", position)
        fd.set("isActive", String(isActive))
        onSubmit(fd)
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nume</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} placeholder="ex: Google Analytics" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tip</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Poziție</Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="head">Head</SelectItem>
              <SelectItem value="body">Body</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Cod</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={defaultValues?.content}
          placeholder={type === 'css' ? '.my-class { color: red; }' : 'console.log("hello");'}
          className="font-mono text-sm min-h-[200px]"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch id="isActiveSwitch" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActiveSwitch">Activ</Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Se salvează..." : "Salvează"}
        </Button>
      </DialogFooter>
    </form>
  )
}
