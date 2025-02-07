"use client"

import { TableHead } from "@/components/ui/table"
import { SortHeader } from "./sort-header"
import { CoffeeShop } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"

interface TableHeaderProps {
  sortConfig: {
    key: keyof CoffeeShop | null
    direction: 'asc' | 'desc'
  }
  onSort: (key: keyof CoffeeShop) => void
  selectedAll?: boolean
  onSelectAll?: (checked: boolean) => void
}

export function TableHeader({ 
  sortConfig, 
  onSort,
  selectedAll,
  onSelectAll
}: TableHeaderProps) {
  return (
    <>
      <TableHead className="w-12">
        <Checkbox 
          checked={selectedAll}
          onCheckedChange={onSelectAll}
        />
      </TableHead>
      
      <TableHead>
        <SortHeader 
          label="Name"
          sortKey="title"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Website"
          sortKey="website"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Area"
          sortKey="area"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Address"
          sortKey="address"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Priority"
          sortKey="priority"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Partner Status</TableHead>
      <TableHead>
        <SortHeader 
          label="Stage"
          sortKey="stage"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>
      <TableHead>
        <SortHeader 
          label="Manager Present"
          sortKey="manager_present"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Contact Name"
          sortKey="contact_name"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Contact Email"
          sortKey="contact_email"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Owners"
          sortKey="owners"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Volume"
          sortKey="volume"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>


      <TableHead>
        <SortHeader 
          label="Delivery Frequency"
          sortKey="delivery_frequency"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      


      <TableHead>ARR</TableHead>

      <TableHead>
        <SortHeader 
          label="First Visit"
          sortKey="first_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Second Visit"
          sortKey="second_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Third Visit"
          sortKey="third_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Status</TableHead>

      <TableHead>
        <SortHeader 
          label="Rating"
          sortKey="rating"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Reviews"
          sortKey="reviews"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Instagram"
          sortKey="instagram"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Followers"
          sortKey="followers"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Lead</TableHead>

      <TableHead>
        <SortHeader 
          label="Notes"
          sortKey="notes"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead className="w-[100px]">Actions</TableHead>
    </>
  )
}
