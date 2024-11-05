"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  Save,
} from 'lucide-react'
import { PageContainer } from "@/components/layout/page-container";
import './styles.css';

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minThreshold: number
  maxThreshold: number
  unitCost: number
  lastRestocked: string
  supplier: string
  location: string
  notes: string
}

interface SortConfig {
  key: keyof InventoryItem
  direction: 'asc' | 'desc'
}

const InventoryManagement: React.FC = () => {
  // State Management
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  )
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Form state for new/edit item
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minThreshold: 0,
    maxThreshold: 0,
    unitCost: 0,
    supplier: '',
    location: '',
    notes: ''
  })

  // Categories derived from inventory items
  const categories = useMemo(() => {
    const uniqueCategories = new Set(inventory.map((item) => item.category))
    return ['All', ...Array.from(uniqueCategories)]
  }, [inventory])

  // Message helper - moved to the top before use
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Load inventory from localStorage
  const loadInventory = useCallback(() => {
    setIsLoading(true)
    try {
      const savedInventory = JSON.parse(
        localStorage.getItem('inventory') || '[]'
      ) as InventoryItem[]
      setInventory(savedInventory)
      setFilteredInventory(savedInventory)
      setError(null)
    } catch (err) {
      setError('Failed to load inventory data')
      console.error('Error loading inventory:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save inventory to localStorage
  const saveInventory = useCallback((items: InventoryItem[]) => {
    try {
      localStorage.setItem('inventory', JSON.stringify(items))
      setInventory(items)
      showMessage('Inventory saved successfully', 'success')
    } catch (err) {
      showMessage('Failed to save inventory', 'error')
      console.error('Error saving inventory:', err)
    }
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  // Filter and sort inventory
  useEffect(() => {
    let filtered = [...inventory]

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      return 0
    })

    setFilteredInventory(filtered)
  }, [inventory, selectedCategory, searchTerm, sortConfig])

  // Handle sort
  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Add new item
  const handleAddItem = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      minThreshold: 0,
      maxThreshold: 0,
      unitCost: 0,
      supplier: '',
      location: '',
      notes: '',
      lastRestocked: new Date().toISOString()
    })
    setSelectedItem(null)
    setIsModalOpen(true)
  }

  // Edit item
  const handleEditItem = (item: InventoryItem) => {
    setFormData(item)
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  // Delete item
  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (selectedItem) {
      const updatedInventory = inventory.filter(
        (item) => item.id !== selectedItem.id
      )
      saveInventory(updatedInventory)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
      showMessage('Item deleted successfully', 'success')
    }
  }

  // Save item (create/update)
  const handleSaveItem = () => {
    if (!formData.name || !formData.category) {
      showMessage('Name and category are required', 'error')
      return
    }

    const newItem: InventoryItem = {
      id: selectedItem?.id || Date.now().toString(),
      name: formData.name || '',
      category: formData.category || '',
      quantity: formData.quantity || 0,
      unit: formData.unit || '',
      minThreshold: formData.minThreshold || 0,
      maxThreshold: formData.maxThreshold || 0,
      unitCost: formData.unitCost || 0,
      supplier: formData.supplier || '',
      location: formData.location || '',
      notes: formData.notes || '',
      lastRestocked: selectedItem?.lastRestocked || new Date().toISOString()
    }

    const updatedInventory = selectedItem
      ? inventory.map((item) => (item.id === selectedItem.id ? newItem : item))
      : [...inventory, newItem]

    saveInventory(updatedInventory)
    setIsModalOpen(false)
    showMessage(
      `Item ${selectedItem ? 'updated' : 'added'} successfully`,
      'success'
    )
  }

  // Export inventory
  const handleExport = () => {
    const dataStr = JSON.stringify(inventory, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = 'inventory-data.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    showMessage('Inventory exported successfully', 'success')
  }

  // Import inventory
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          saveInventory(importedData)
          showMessage('Inventory imported successfully', 'success')
        } catch (err) {
          showMessage('Failed to import inventory data', 'error')
          console.error('Error importing inventory:', err)
        }
      }
      reader.readAsText(file)
    }
  }

  // Check low stock items
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minThreshold)
  }, [inventory])

  return (
    <PageContainer>
    <div className="inventory-container">
        <h1 className="page-title">Inventory Management</h1>
      <header className="header">
        <div className="header-actions">
          <button onClick={handleAddItem} className="add-button">
            <Plus size={16} /> Add Item
          </button>
          <button onClick={handleExport} className="export-button">
            <Download size={16} /> Export
          </button>
          <label className="import-button">
            <Upload size={16} /> Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={loadInventory} className="refresh-button">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      {isLoading && <div className="loading">Loading inventory data...</div>}
      {error && (
        <div className="error">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="filters">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {lowStockItems.length > 0 && (
        <div className="low-stock-alert">
          <AlertCircle size={16} />
          <span>{lowStockItems.length} item(s) are running low on stock</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className="view-all-button"
          >
            View All
          </button>
        </div>
      )}

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('category')}>
                Category{' '}
                {sortConfig.key === 'category' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('quantity')}>
                Quantity{' '}
                {sortConfig.key === 'quantity' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('minThreshold')}>
                Min Threshold{' '}
                {sortConfig.key === 'minThreshold' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('unitCost')}>
                Unit Cost{' '}
                {sortConfig.key === 'unitCost' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('supplier')}>
                Supplier{' '}
                {sortConfig.key === 'supplier' && <ArrowUpDown size={16} />}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr
                key={item.id}
                className={
                  item.quantity <= item.minThreshold ? 'low-stock' : ''
                }
              >
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td>{item.minThreshold}</td>
                <td>${item.unitCost.toFixed(2)}</td>
                <td>{item.supplier}</td>
                <td className="actions">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="edit-button"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="delete-button"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedItem ? 'Edit Item' : 'Add New Item'}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value)
                    })
                  }
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={formData.unit || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., kg, lbs, pcs"
                />
              </div>

              <div className="form-group">
                <label>Min Threshold</label>
                <input
                  type="number"
                  value={formData.minThreshold || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minThreshold: parseInt(e.target.value)
                    })
                  }
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Max Threshold</label>
                <input
                  type="number"
                  value={formData.maxThreshold || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxThreshold: parseInt(e.target.value)
                    })
                  }
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Unit Cost ($)</label>
                <input
                  type="number"
                  value={formData.unitCost || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitCost: parseFloat(e.target.value)
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setIsModalOpen(false)}
                className="cancel-button"
              >
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSaveItem} className="save-button">
                <Save size={16} /> Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="cancel-button"
              >
                <X size={16} /> Cancel
              </button>
              <button onClick={confirmDelete} className="delete-button">
                <Trash2 size={16} /> Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`notification ${message.type}`}>
          {message.type === 'success' ? (
            <Check size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {message.text}
        </div>
      )}


      
    </div>
    </PageContainer>
  )
}

export default InventoryManagement
