// types/api.ts
export interface DomainSearchRequest {
    company: string
    limit?: number
    email_type?: 'all' | 'generic' | 'professional'
    company_enrichment?: boolean
  }
  
  export interface DomainSearchEmail {
    email: string
    email_type: 'generic' | 'professional'
    first_name: string | null
    last_name: string | null
    email_anon_id: string
    verification: {
      status: 'VALID' | 'INVALID' | 'CATCH_ALL' | 'UNVERIFIED'
      last_verified_at: string | null
    }
  }
  
  export interface CompanyEnrichment {
    name: string
    is_catch_all: boolean
    size: string
    logo: string | null
    linkedin: string | null
    website: string
    common_email_pattern: string
    industry: string | null
    founded_in: number | null
    description: string | null
    location: {
      country: string
      country_code: string
      state: string | null
      city: string | null
      timezone: string
      timezone_offset: string
      postal_code: string | null
      address: string | null
    }
    anon_id: string
  }
  
  export interface DomainSearchResponse {
    error: boolean
    response: {
      email_list: DomainSearchEmail[]
      company_enrichment?: CompanyEnrichment
      meta: {
        search_id: string
        total_emails: number
        remaining_emails: number
        more_results: boolean
        domain: string
        limit: number
      }
    }
  }