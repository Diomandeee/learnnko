// src/components/coffee-shops/instagram-cell.tsx
"use client"

import { useState } from "react"
import { Instagram, Edit, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { CoffeeShop } from "@prisma/client"

interface InstagramCellProps {
  shop: CoffeeShop
  onUpdate: (value: string) => Promise<void>
}

export function InstagramCell({ shop, onUpdate }: InstagramCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(shop.instagram || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Clean the Instagram handle
      const cleanedValue = editValue
        .trim()
        .replace("@", "")
        .replace("https://www.instagram.com/", "")
        .replace("/", "")

      await onUpdate(cleanedValue)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Instagram handle updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Instagram handle",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatInstagramUrl = (handle: string) => {
    const cleanHandle = handle
      .replace("@", "")
      .replace("https://www.instagram.com/", "")
      .replace("/", "")
    return `https://www.instagram.com/${cleanHandle}`
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Instagram handle"
          className="h-8 w-[200px]"
          disabled={isLoading}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSave()
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setEditValue(shop.instagram || "")
          }}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {shop.instagram ? (
        <Link
          href={formatInstagramUrl(shop.instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <Instagram className="h-4 w-4" />
          {shop.instagram.startsWith("@") ? shop.instagram : `@${shop.instagram}`}
        </Link>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  )
}