"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DomainSearch } from "./domain-search"
import {
  ArrowLeft,
  Building,
  Globe,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  User,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import type { DomainSearchEmail } from "@/types/api"

function EmailEditRow({ 
  email, 
  index, 
  onUpdate,
  onDelete  // Add this prop
}: { 
  email: any, 
  index: number, 
  onUpdate: (index: number, updates: { first_name?: string, last_name?: string }) => void,
  onDelete: (index: number) => void  // Add this type
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(email.first_name || '')
  const [lastName, setLastName] = useState(email.last_name || '')

  const handleSave = () => {
    onUpdate(index, {
      first_name: firstName || null,
      last_name: lastName || null
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center gap-4 flex-1">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-[150px]"
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-[150px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setIsEditing(false)
              setFirstName(email.first_name || '')
              setLastName(email.last_name || '')
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <div className="flex items-center gap-4">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{email.email}</div>
          <div 
            className="text-sm text-muted-foreground cursor-pointer hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            {firstName || lastName ? (
              `${firstName} ${lastName}`
            ) : (
              "Click to add name"
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={email.email_type === "professional" ? "default" : "secondary"}>
          {email.email_type}
        </Badge>
        <Badge variant={
          email.verification.status === "VALID" ? "success" :
          email.verification.status === "INVALID" ? "destructive" :
          "secondary"
        }>
          {email.verification.status}
        </Badge>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(index)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Form Schemas
const emailSchema = z.object({
  email: z.string().email(),
  email_type: z.enum(["generic", "professional"]),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  verification: z.object({
    status: z.string(),
    last_verified_at: z.string().nullable()
  })
})

const companyDataSchema = z.object({
  size: z.string().nullish(),
  industry: z.string().nullish(),
  founded_in: z.number().nullish(),
  description: z.string().nullish(),
  linkedin: z.string().nullish()
}).optional()

const coffeeShopSchema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  area: z.string().min(2, "Area is required"),
  website: z.string().optional(),
  manager_present: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  followers: z.number().optional(),
  store_doors: z.string().optional(),
  volume: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().optional(),
  price_type: z.string().optional(),
  type: z.string().optional(),
  types: z.array(z.string()).default([]),
  latitude: z.number(),
  longitude: z.number(),
  is_source: z.boolean().default(false),
  parlor_coffee_leads: z.boolean().default(false),
  notes: z.string().optional(),
  emails: z.array(emailSchema).default([]),
  company_data: companyDataSchema
}).transform((data) => ({
  ...data,
  volume: data.volume ? data.volume.toString() : undefined,
  followers: data.followers ? Number(data.followers) : undefined,
  rating: data.rating ? Number(data.rating) : undefined,
  reviews: data.reviews ? Number(data.reviews) : undefined
}))

type FormData = z.infer<typeof coffeeShopSchema>

// Main Form Component
export function NewCoffeeShopForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [geocodeLoading, setGeocodeLoading] = useState(false)

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(coffeeShopSchema),
    defaultValues: {
      is_source: false,
      parlor_coffee_leads: false,
      types: [],
      latitude: 0,
      longitude: 0,
      emails: [],
    },
  })

  // Handle address geocoding
  const handleAddressBlur = async () => {
    const address = form.getValues("address")
    if (address) {
      setGeocodeLoading(true)
      try {
        console.log("Geocoding address:", address)
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        )
        const data = await response.json()
        console.log("Geocoding response:", data)
        
        if (data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location
          console.log("Setting coordinates:", { lat, lng })
          form.setValue("latitude", lat)
          form.setValue("longitude", lng)
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        toast({
          title: "Geocoding Error",
          description: "Failed to get coordinates from address",
          variant: "destructive"
        })
      } finally {
        setGeocodeLoading(false)
      }
    }
  }

  // Handle emails found from domain search
  const handleEmailsFound = useCallback((emails: DomainSearchEmail[]) => {
    console.log("Emails found:", emails)
    form.setValue('emails', emails)
  }, [form])

  // Handle company data from domain search
  const handleCompanyData = useCallback((data: any) => {
    console.log("Company data received:", data)
    form.setValue('company_data', {
      size: data.size,
      industry: data.industry,
      founded_in: data.founded_in,
      description: data.description,
      linkedin: data.linkedin
    })
    if (data.website) {
      form.setValue('website', data.website)
    }
  }, [form])

  // Form submission handler
  async function onSubmit(data: FormData) {
    console.log("Form submission started with data:", data);
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!data.title || !data.address || !data.area) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
  
      // Create coffee shop
      const response = await fetch("/api/coffee-shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create coffee shop");
      }
  
      const createdShop = await response.json();
      console.log("Coffee shop created successfully:", createdShop);
  
      // Add discovered emails as people
      if (data.emails?.length > 0) {
        let successCount = 0;
        
        for (const email of data.emails) {
          try {
            const personResponse = await fetch("/api/people", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                firstName: email.first_name || undefined,
                lastName: email.last_name || undefined,
                email: email.email,
                emailType: email.email_type,
                verificationStatus: email.verification.status,
                lastVerifiedAt: email.verification.last_verified_at,
                company: data.title, // Add company name
                coffeeShopId: createdShop.id
              })
            });
  
            if (personResponse.ok) {
              successCount++;
            }
          } catch (error) {
            console.error(`Failed to add person for email ${email.email}:`, error);
          }
        }
  
        if (successCount > 0) {
          toast({
            title: "People Added",
            description: `Successfully added ${successCount} people from discovered emails`
          });
        }
      }
  
      toast({
        title: "Success",
        description: "Coffee shop created successfully"
      });
  
      router.push(`/dashboard/coffee-shops/${createdShop.id}`);
      router.refresh();
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create coffee shop",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Validation error handler
  const onError = (errors: any) => {
    console.error("Form validation errors:", errors)
    toast({
      title: "Validation Error",
      description: "Please check the form for errors",
      variant: "destructive"
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/coffee-shops"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to coffee shops
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Coffee Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
          <form 
              // Change this line
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
            {/* Domain Search Section */}
            <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Domain Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <DomainSearch 
                    onEmailsFound={handleEmailsFound}
                    onCompanyData={handleCompanyData}
                  />
                </CardContent>
              </Card>

              {/* Basic Information */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Coffee Shop Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input placeholder="Business district, neighborhood, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address and Location */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Full address"
                          {...field}
                          onBlur={handleAddressBlur}
                        />
                        {geocodeLoading && (
                          <div className="absolute right-2 top-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {geocodeLoading && (
                      <FormDescription>Loading coordinates...</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coordinates */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="40.7128" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="any"
                          placeholder="-74.0060"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                {/* Domain Search Results */}
                {form.watch('emails')?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Found Email Addresses</CardTitle>
                      <CardDescription>
                        Edit names if needed. These emails will be added as people after the coffee shop is created.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.watch('emails').map((email, index) => (
                        <EmailEditRow
                          key={index}
                          email={email}
                          index={index}
                          onUpdate={(index, updates) => {
                            const emails = [...form.watch('emails')];
                            emails[index] = {
                              ...emails[index],
                              ...updates
                            };
                            form.setValue('emails', emails);
                          }}
                          onDelete={(index) => {
                            const emails = [...form.watch('emails')];
                            emails.splice(index, 1);
                            form.setValue('emails', emails);
                          }}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

              {/* Company Data */}
              {form.watch('company_data') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Company Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {form.watch('company_data.size') && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium">Company Size</label>
                            <p className="text-sm text-muted-foreground">
                              {form.watch('company_data.size')}
                            </p>
                          </div>
                        </div>
                      )}
                      {form.watch('company_data.industry') && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <label className="text-sm font-medium">Industry</label>
                            <p className="text-sm text-muted-foreground">
                              {form.watch('company_data.industry')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {form.watch('company_data.description') && (
                      <div className="mt-4">
                        <label className="text-sm font-medium">Description</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {form.watch('company_data.description')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="manager_present"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager Present</FormLabel>
                      <FormControl>
                        <Input placeholder="Manager's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact person's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Social and Business Info */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Handle</FormLabel>
                      <FormControl>
                        <Input placeholder="@handle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Followers</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (Weekly)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value || /^\d*\.?\d*$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the weekly volume
                      </FormDescription>
                      {field.value && (
                        <FormDescription>
                          Annual Revenue: ${((parseFloat(field.value) * 52) * 18).toLocaleString()}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Information */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="store_doors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Doors</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reviews"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Reviews</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes about this coffee shop..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Flags */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_source"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Source Location</FormLabel>
                        <FormDescription>
                          Mark this as a source/partner location
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parlor_coffee_leads"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Potential Lead</FormLabel>
                        <FormDescription>
                          Mark this as a potential lead
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => router.push('/dashboard/coffee-shops')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Coffee Shop"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}