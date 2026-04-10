"use client"

import { useActionState, useState } from "react"
import { updateConsultationContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import Image from "next/image"

const initialState = {
    message: "",
    errors: {} as Record<string, string[]>,
    success: false,
}

type ConsultationContent = {
    title?: string
    description?: string
    buttonText?: string
    consultationTime?: string
    consultationLiveText?: string
    consultationFreeText?: string
    feature1?: string
    feature2?: string
    feature3?: string
    videoCallImage?: string
    doctorImage?: string
}

export function ConsultationContentForm({
    initialData,
    locale = "ro",
}: {
    initialData: ConsultationContent
    locale?: string
}) {
    const [state, formAction, isPending] = useActionState(updateConsultationContent, initialState)
    const [videoCallImageDeleted, setVideoCallImageDeleted] = useState(false)
    const [doctorImageDeleted, setDoctorImageDeleted] = useState(false)

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            {state.message && (
                <div className={`p-4 rounded-xl border ${state.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    <p className="text-sm font-bold uppercase tracking-wider">{state.message}</p>
                </div>
            )}

            {/* Texte principale */}
            <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                <h3 className="text-zinc-900 dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Texte Principale</h3>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Secțiune</Label>
                        <Input
                            name="title"
                            defaultValue={initialData.title}
                            placeholder="Evaluare Online"
                            className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere</Label>
                        <Textarea
                            name="description"
                            defaultValue={initialData.description}
                            placeholder="Trimite radiografia ta și primește un plan preliminar de tratament..."
                            className="min-h-[80px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Text Buton</Label>
                        <Input
                            name="buttonText"
                            defaultValue={initialData.buttonText}
                            placeholder="Solicită Plan Tratament"
                            className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                <h3 className="text-zinc-900 dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Caracteristici (Lista cu ✓)</h3>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Caracteristică 1</Label>
                        <Input
                            name="feature1"
                            defaultValue={initialData.feature1}
                            placeholder="Plan de tratament detaliat"
                            className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Caracteristică 2</Label>
                        <Input
                            name="feature2"
                            defaultValue={initialData.feature2}
                            placeholder="Estimare de cost transparentă"
                            className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Caracteristică 3</Label>
                        <Input
                            name="feature3"
                            defaultValue={initialData.feature3}
                            placeholder="Asistență organizare călătorie"
                            className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                </div>
            </div>

            {/* Badge-uri și imagini */}
            <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                <h3 className="text-zinc-900 dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Badge-uri și Imagini</h3>
                <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Oră (Badge)</Label>
                            <Input
                                name="consultationTime"
                                defaultValue={initialData.consultationTime}
                                placeholder="12:45 PM"
                                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Text Live</Label>
                            <Input
                                name="consultationLiveText"
                                defaultValue={initialData.consultationLiveText}
                                placeholder="Consultație Live"
                                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Text Gratuit</Label>
                            <Input
                                name="consultationFreeText"
                                defaultValue={initialData.consultationFreeText}
                                placeholder="100% Gratuit"
                                className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Imagine Video Call (Fundal)</Label>
                        {initialData.videoCallImage && !videoCallImageDeleted && (
                            <div className="h-40 w-full relative overflow-hidden mb-2 rounded-xl border border-gray-200 dark:border-white/10 group">
                                <Image src={initialData.videoCallImage} alt="Video Call" fill className="object-cover" />
                                <button type="button" onClick={() => setVideoCallImageDeleted(true)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <Input
                            type="file"
                            name="videoCallImageFile"
                            accept="image/*, .svg, image/svg+xml"
                            className="cursor-pointer file:cursor-pointer bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                        <input type="hidden" name="existingVideoCallImage" value={!videoCallImageDeleted && initialData.videoCallImage ? initialData.videoCallImage : ""} />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Imagine Doctor (Picture-in-Picture)</Label>
                        {initialData.doctorImage && !doctorImageDeleted && (
                            <div className="h-40 w-40 relative overflow-hidden mb-2 rounded-xl border border-gray-200 dark:border-white/10 group">
                                <Image src={initialData.doctorImage} alt="Doctor" fill className="object-cover" />
                                <button type="button" onClick={() => setDoctorImageDeleted(true)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <Input
                            type="file"
                            name="doctorImageFile"
                            accept="image/*, .svg, image/svg+xml"
                            className="cursor-pointer file:cursor-pointer bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                        <input type="hidden" name="existingDoctorImage" value={!doctorImageDeleted && initialData.doctorImage ? initialData.doctorImage : ""} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                <Button variant="admin_primary_strong" size="admin_submit" type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? "Se salvează..." : "Salvează Modificările"}
                </Button>
            </div>
        </form>
    )
}
