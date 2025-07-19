"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, FolderOpen, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WordCategoriesProps {
  className?: string
  onCategorySelect?: (slug: string, name: string) => void
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  wordCount: number
}

export function WordCategories({ className, onCategorySelect }: WordCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/nko/dictionary/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
          setFilteredCategories(data.categories || [])
        } else {
          throw new Error('Failed to load categories')
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load word categories",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCategories()
  }, [toast])
  
  // Filter categories when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories)
      return
    }
    
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    setFilteredCategories(filtered)
  }, [searchTerm, categories])

  const handleCategoryClick = (category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category.slug, category.name)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Word Categories</CardTitle>
        <CardDescription>Browse words by category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Search className="h-4 w-4 absolute left-2 top-3 text-muted-foreground" />
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 mr-2 text-primary" />
                      <span>{category.name}</span>
                    </div>
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                      {category.wordCount}
                    </span>
                  </Button>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No categories found matching "{searchTerm}"
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
