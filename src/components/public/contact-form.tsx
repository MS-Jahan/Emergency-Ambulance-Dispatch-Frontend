'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

type ContactFormValues = z.infer<typeof contactSchema>

const SUPPORT_EMAIL = 'support@rapidaid.example'

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = (data: ContactFormValues) => {
    const subject = encodeURIComponent(`Message from ${data.name.trim()}`)
    const body = encodeURIComponent(
      `${data.message.trim()}\n\n— ${data.name.trim()} (${data.email.trim()})`,
    )
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    if (typeof window !== 'undefined') {
      const link = document.createElement('a')
      link.href = mailto
      link.click()
    }
    toast.success('Opening your email app with the message ready')
    reset()
  }

  const inputCls = 'mt-1 bg-gauze border-hairline text-ink'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-paper border border-hairline rounded-2xl p-5 sm:p-6 space-y-4"
      noValidate
    >
      <div>
        <Label htmlFor="c-name" className="text-sm font-medium text-ink">
          Name
        </Label>
        <Input
          id="c-name"
          placeholder="Your full name"
          {...register('name')}
          className={inputCls}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-signal">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="c-email" className="text-sm font-medium text-ink">
          Email
        </Label>
        <Input
          id="c-email"
          type="email"
          placeholder="your.email@example.com"
          {...register('email')}
          className={inputCls}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-signal">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="c-msg" className="text-sm font-medium text-ink">
          Message
        </Label>
        <textarea
          id="c-msg"
          rows={5}
          placeholder="How can our support team assist you?"
          {...register('message')}
          className="mt-1 w-full rounded-2xl border border-hairline bg-gauze px-3 py-2 text-sm text-ink placeholder:text-slate focus:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {errors.message && (
          <p className="mt-1 text-xs text-signal">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11"
      >
        Send message
      </Button>
      <p className="text-xs text-slate">
        Prepares a draft for our dispatch & support desk in your local mail client.
      </p>
    </form>
  )
}
