'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError } from '@/components/shared/field-error'
import { useSendContact } from '@/lib/hooks'
import { ApiError } from '@/lib/api'
import type { ContactCategory } from '@/types/api'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().max(20, 'Phone must be at most 20 characters').optional().or(z.literal('')),
  category: z.enum(['GENERAL', 'BILLING', 'DRIVER', 'HOSPITAL', 'FEEDBACK']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be at most 2000 characters'),
  website: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

const CATEGORIES: { value: ContactCategory; label: string }[] = [
  { value: 'GENERAL', label: 'General inquiry' },
  { value: 'BILLING', label: 'Billing & payment' },
  { value: 'DRIVER', label: 'Driver & partner support' },
  { value: 'HOSPITAL', label: 'Hospital coordination' },
  { value: 'FEEDBACK', label: 'Feedback & suggestions' },
]

export function ContactForm() {
  const sendContact = useSendContact()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      category: 'GENERAL',
      message: '',
      website: '',
    },
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await sendContact.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        category: data.category,
        message: data.message.trim(),
        website: data.website || undefined,
      })
      toast.success('Thank you! Your message has been sent to our dispatch & support desk.')
      reset({
        name: '',
        email: '',
        phone: '',
        category: 'GENERAL',
        message: '',
        website: '',
      })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          err.errors.forEach((e) => {
            if (e.field && ['name', 'email', 'phone', 'category', 'message', 'website'].includes(e.field)) {
              setError(e.field as keyof ContactFormValues, { message: e.message })
            }
          })
        } else {
          toast.error(err.message || 'Failed to submit contact message')
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.')
      }
    }
  }

  const inputCls = 'mt-1 bg-gauze border-hairline text-ink'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-paper border border-hairline rounded-2xl p-5 sm:p-6 space-y-4"
      noValidate
    >
      {/* Honeypot field for bot spam */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
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
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="c-phone" className="text-sm font-medium text-ink">
            Phone <span className="text-xs text-slate font-normal">(optional)</span>
          </Label>
          <Input
            id="c-phone"
            type="tel"
            placeholder="+8801700000000"
            {...register('phone')}
            className={inputCls}
          />
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </div>

        <div>
          <Label htmlFor="c-category" className="text-sm font-medium text-ink">
            Category
          </Label>
          <Select
            value={selectedCategory}
            onValueChange={(val) =>
              setValue('category', (val ?? 'GENERAL') as ContactCategory)
            }
          >
            <SelectTrigger id="c-category" className={inputCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <FieldError>{errors.category.message}</FieldError>}
        </div>
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
        {errors.message && <FieldError>{errors.message.message}</FieldError>}
      </div>

      <Button
        type="submit"
        disabled={sendContact.isPending}
        className="w-full h-11"
      >
        {sendContact.isPending ? 'Sending message...' : 'Send message'}
      </Button>
      <p className="text-xs text-slate">
        Our dispatch & support desk responds directly to your email address.
      </p>
    </form>
  )
}

