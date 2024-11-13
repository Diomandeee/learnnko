"use client"

import { useState, useEffect } from 'react'
import { MenuItem } from '@/types/pos'
import { posService } from '@/lib/services/pos-service'
import { CATEGORIES } from '@/constants/pos-data'
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog"
import { 
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Plus, Edit2, Trash2, Save, Coffee, Search } from 'lucide-react'
import { Label } from "@/components/ui/label"

export default function ManagementPage() {
const [menuItems, setMenuItems] = useState<MenuItem[]>([])
const [loading, setLoading] = useState(true)
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
const [searchTerm, setSearchTerm] = useState("")
const [filterCategory, setFilterCategory] = useState<string>("All")

const [newItem, setNewItem] = useState({
  name: '',
  price: '',
  category: '',
  popular: false,
})

useEffect(() => {
  loadMenuItems()
}, [])

const loadMenuItems = async () => {
  try {
    setLoading(true)
    const items = await posService.getMenuItems()
    setMenuItems(items)
    
  } catch (err) {
    console.error("Failed to load menu items:", err)
    toast({
      title: "Error",
      description: "Failed to load menu items",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

const handleAddItem = async () => {
  try {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    await posService.createMenuItem({
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      popular: newItem.popular,
      active: true
    })

    setNewItem({
      name: '',
      price: '',
      category: '',
      popular: false,
    })

    setIsAddDialogOpen(false)
    await loadMenuItems()

    toast({
      title: "Success",
      description: "Menu item added successfully",
    })
  } catch (err) {
    console.error("Failed to add menu item:", err) 
    toast({
      title: "Error",
      description: "Failed to add menu item",
      variant: "destructive",
    })
  }
}

const handleUpdateItem = async (item: MenuItem) => {
  try {
    await posService.updateMenuItem(item.id, item)
    setEditingItem(null)
    await loadMenuItems()

    toast({
      title: "Success",
      description: "Menu item updated successfully",
    })
  } catch (err) {
    console.error("Failed to update menu item:", err)
    toast({
      title: "Error",
      description: "Failed to update menu item",
      variant: "destructive",
    })
  }
}

const handleDeleteItem = async (id: string) => {
  if (!confirm('Are you sure you want to delete this item?')) return

  try {
    await posService.deleteMenuItem(id)
    await loadMenuItems()

    toast({
      title: "Success",
      description: "Menu item deleted successfully",
    })
  } catch (err) {
    console.error("Failed to delete menu item:", err)
    toast({
      title: "Error",
      description: "Failed to delete menu item",
      variant: "destructive",
    })
  }
}

const filteredItems = menuItems.filter(item => {
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesCategory = filterCategory === "All" || item.category === filterCategory
  return matchesSearch && matchesCategory
})

return (
  <PageContainer>
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Manage your menu items, categories, and prices</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to your menu. Fill in all the required information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={value => setNewItem({...newItem, category: value})}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="popular">Popular Item</Label>
                    <Switch
                      id="popular"
                      checked={newItem.popular}
                      onCheckedChange={checked => setNewItem({...newItem, popular: checked})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-[100px]">Price</TableHead>
                    <TableHead className="w-[100px]">Popular</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {editingItem?.id === item.id ? (
                          <Input
                            value={editingItem.name}
                            onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-muted-foreground" />
                            {item.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem?.id === item.id ? (
                          <Select
                            value={editingItem.category}
                            onValueChange={value => setEditingItem({...editingItem, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          item.category
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem?.id === item.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editingItem.price}
                            onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                            className="w-[100px]"
                          />
                        ) : (
                          `$${item.price.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={editingItem?.id === item.id ? editingItem.popular : item.popular}
                          onCheckedChange={checked => {
                            if (editingItem?.id === item.id) {
                              setEditingItem({...editingItem, popular: checked})
                            } else {
                              handleUpdateItem({...item, popular: checked})
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {editingItem?.id === item.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateItem(editingItem)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No menu items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </PageContainer>
)
}
