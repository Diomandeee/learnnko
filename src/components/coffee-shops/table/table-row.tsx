"use client"

import { useState } from "react"
import { TableCell, TableRow as UITableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Shield,
  Edit 
} from "lucide-react"
import Link from "next/link"
import { EditableCell } from "../editable-cell"
import { DateCell } from "./date-cell"
import { StarRating } from "./star-rating"
import { CoffeeShop } from "@prisma/client"
import { StageCell } from "./stage-cell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateARR } from "./utils"
import { DeliveryCell } from "./delivery-cell"

interface TableRowProps {
  shop: CoffeeShop
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onUpdate: (field: keyof CoffeeShop, value: any) => Promise<void>
  onDelete: () => void
}

export function TableRow({ 
  shop: initialShop, 
  isSelected, 
  onSelect,
  onUpdate,
  onDelete
}: TableRowProps) {
  const [loading, setLoading] = useState(false)
  const [shop, setShop] = useState(initialShop)

  const handleUpdate = async (field: keyof CoffeeShop, value: any) => {
    setLoading(true)
    try {
      // Validate delivery frequency
      if (field === 'delivery_frequency') {
        const validFrequencies = ["WEEKLY", "BIWEEKLY", "THREE_WEEKS", "FOUR_WEEKS", "FIVE_WEEKS", "SIX_WEEKS"];
        if (value && !validFrequencies.includes(value)) {
          toast({
            title: "Error",
            description: "Invalid delivery frequency",
            variant: "destructive"
          });
          return;
        }
      }
  
      // Validate first delivery week
      if (field === 'first_delivery_week') {
        const weekNum = parseInt(value);
        if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
          toast({
            title: "Error",
            description: "First delivery week must be between 1 and 53",
            variant: "destructive"
          });
          return;
        }
  
        // Ensure delivery frequency is set when setting first delivery week
        if (!shop.delivery_frequency) {
          // Update both fields together
          const updatedData = {
            first_delivery_week: weekNum,
            delivery_frequency: "WEEKLY" // Default to weekly
          };
  
          setShop(prev => ({
            ...prev,
            ...updatedData
          }));
  
          await onUpdate('first_delivery_week', weekNum);
          await onUpdate('delivery_frequency', "WEEKLY");
          
          toast({
            description: "Delivery schedule set to weekly by default"
          });
          
          return;
        }
      }
  
      // Optimistically update the local state
      setShop(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Make the API call
      await onUpdate(field, value);
  
      // Show success message for delivery-related updates
      if (field === 'delivery_frequency' || field === 'first_delivery_week') {
        toast({
          description: `${field.split('_').join(' ')} updated successfully`
        });
      }
  
    } catch (error) {
      // Revert on error
      setShop(prev => ({
        ...prev,
        [field]: initialShop[field]
      }));
  
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive"
      });
  
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return (
    <UITableRow>
      <TableCell>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelect}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Link
          href={`/dashboard/coffee-shops/${shop.id}`}
          className="font-medium hover:underline"
        >
          {shop.title}
        </Link>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.website}
          onUpdate={(value) => handleUpdate('website', value)}
          type="url"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.area}
          onUpdate={(value) => handleUpdate('area', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.address}
          onUpdate={(value) => handleUpdate('address', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2 group cursor-pointer">
          <StarRating
            value={shop.priority || 0}
            onUpdate={(value) => handleUpdate('priority', value)}
            className="group-hover:opacity-100"
            disabled={loading}
          />
        </div>
      </TableCell>

      <TableCell>
        <Badge 
          variant={shop.isPartner ? "success" : "secondary"}
          className="cursor-pointer"
          onClick={() => handleUpdate('isPartner', !shop.isPartner)}
        >
          {shop.isPartner ? (
            <><Shield className="h-4 w-4 mr-1" /> Partner</>
          ) : "Not Partner"}
        </Badge>
      </TableCell>
      <TableCell>
      <StageCell
        stage={shop.stage}
        onUpdate={(value) => handleUpdate('stage', value)}
        disabled={loading}
      />
    </TableCell>

      <TableCell>
        <EditableCell
          value={shop.manager_present}
          onUpdate={(value) => handleUpdate('manager_present', value)}
          type="manager"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.contact_name}
          onUpdate={(value) => handleUpdate('contact_name', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.contact_email}
          onUpdate={(value) => handleUpdate('contact_email', value)}
          type="email"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.owners.map(owner => `${owner.name} (${owner.email})`).join(', ') || null}
          onUpdate={async (value) => {
            const owners = value ? value.split(',').map(owner => {
              const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/);
              if (match) {
                return {
                  name: match[1].trim(),
                  email: match[2].trim()
                };
              }
              return null;
            }).filter(Boolean) : [];
            
            await handleUpdate('owners', owners);
          }}
          type="owners"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell 
          value={shop.volume?.toString() || null}
          onUpdate={(value) => handleUpdate('volume', value)}
          type="volume"
          disabled={loading}
        />
      </TableCell>
      <TableCell>
        <DeliveryCell 
          shop={shop}
          onUpdate={handleUpdate}
          disabled={loading}
        />
      </TableCell>



      <TableCell>
        <EditableCell
          value={shop.first_delivery_week?.toString()}
          onUpdate={(value) => handleUpdate("first_delivery_week", value ? parseInt(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

    <TableCell>
      {shop.volume ? (
        <div className="text-sm">
          ${calculateARR(shop.volume, shop.delivery_frequency).toLocaleString()}
        </div>
      ) : "-"}
    </TableCell>

      <TableCell>
        <DateCell
          date={shop.first_visit ? new Date(shop.first_visit) : null}
          onUpdate={(date) => handleUpdate('first_visit', date)}
          onRemove={() => handleUpdate('first_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DateCell
          date={shop.second_visit ? new Date(shop.second_visit) : null}
          onUpdate={(date) => handleUpdate('second_visit', date)}
          onRemove={() => handleUpdate('second_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DateCell
          date={shop.third_visit ? new Date(shop.third_visit) : null}
          onUpdate={(date) => handleUpdate('third_visit', date)}
          onRemove={() => handleUpdate('third_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Badge
          variant={shop.visited ? "success" : "default"}
          className="cursor-pointer"
          onClick={() => handleUpdate('visited', !shop.visited)}
        >
          {shop.visited ? "Visited" : "Not Visited"}
        </Badge>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.rating?.toString()}
          onUpdate={(value) => handleUpdate('rating', value ? parseFloat(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.reviews?.toString()}
          onUpdate={(value) => handleUpdate('reviews', value ? parseFloat(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.instagram}
          onUpdate={(value) => handleUpdate('instagram', value)}
          type="instagram"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.followers?.toString()}
          onUpdate={(value) => handleUpdate('followers', value ? parseInt(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Badge
          variant={shop.parlor_coffee_leads ? "warning" : "default"}
          className="cursor-pointer"
          onClick={() => handleUpdate('parlor_coffee_leads', !shop.parlor_coffee_leads)}
        >
          {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
        </Badge>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.notes}
          onUpdate={(value) => handleUpdate('notes', value)}
          type="notes"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/coffee-shops/${shop.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={onDelete}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </UITableRow>
  )
}