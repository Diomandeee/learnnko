// components/domain-search.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search } from "lucide-react"
import type { DomainSearchRequest, DomainSearchResponse } from "@/types/api"

interface DomainSearchProps {
  onEmailsFound: (emails: DomainSearchResponse['response']['email_list']) => void
  onCompanyData?: (data: DomainSearchResponse['response']['company_enrichment']) => void
}

export function DomainSearch({ onEmailsFound, onCompanyData }: DomainSearchProps) {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!domain) return

    setLoading(true)
    try {
      const payload: DomainSearchRequest = {
        company: domain,
        limit: 50,
        email_type: "all",
        company_enrichment: true
      }

      const response = await fetch("/api/domain-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data: DomainSearchResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search domain")
      }

      onEmailsFound(data.response.email_list)
      
      if (data.response.company_enrichment) {
        onCompanyData?.(data.response.company_enrichment)
      }

      toast({
        title: "Search completed",
        description: `Found ${data.response.email_list.length} email addresses`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search domain",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter domain (e.g., company.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch()
        }}
      />
      <Button onClick={handleSearch} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="ml-2">Search</span>
      </Button>
    </div>
  )
}