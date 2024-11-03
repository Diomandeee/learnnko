"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      leadSource: '',
      notes: '',
    },
  })

  async function onSubmit(data: ContactFormData) {
    setLoading(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to submit form')
      
      form.reset()
      // Add success message
    } catch (error) {
      console.error('Submission error:', error)
      // Add error message
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name *</label>
          <input
            {...form.register('name')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            {...form.register('email')}
            type="email"
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone *</label>
          <input
            {...form.register('phone')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
          {form.formState.errors.phone && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Company</label>
          <input
            {...form.register('company')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            {...form.register('jobTitle')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lead Source</label>
          <select
            {...form.register('leadSource')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          >
            <option value="">Select Source</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="SOCIAL">Social Media</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            {...form.register('notes')}
            className="w-full p-2 border rounded-md"
            rows={4}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
