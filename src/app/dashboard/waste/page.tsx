"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Trash2,
  Plus,
  Coffee,
  Package,
  Save,
  AlertTriangle,
  Minus,
  Search,
  X,
  Check,
  Moon,
  Sun,
  Clock,
  CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { PageContainer } from "@/components/layout/page-container";
import './styles.css';

interface WasteItem {
  id: string
  itemName: string
  category: string
  quantity: number
  timestamp: string
  cost: number
  notes: string
}

interface WasteCategory {
  name: string
  items: string[]
  unit: string
  averageCost: number
}

interface Message {
  type: 'success' | 'error'
  text: string
}

interface WasteLogItem {
  itemName: string
  category: string
  quantity: number
  cost: number
  unit: string
}

const wasteCategories: WasteCategory[] = [
  {
    name: 'Drinks',
    items: ['Hot Coffee', 'Iced Coffee', 'Latte', 'Espresso', 'Tea'],
    unit: 'cups',
    averageCost: 3.5
  },
  {
    name: 'Milk',
    items: ['Whole Milk', '2% Milk', 'Almond Milk', 'Oat Milk', 'Soy Milk'],
    unit: 'oz',
    averageCost: 0.25
  },
  {
    name: 'Food',
    items: ['Pastries', 'Sandwiches', 'Cookies', 'Muffins'],
    unit: 'pieces',
    averageCost: 4
  },
  {
    name: 'Supplies',
    items: ['Cups', 'Lids', 'Straws', 'Napkins', 'Sleeves'],
    unit: 'pieces',
    averageCost: 0.15
  },
  {
    name: 'Syrups',
    items: ['Vanilla', 'Caramel', 'Hazelnut', 'Chocolate'],
    unit: 'pumps',
    averageCost: 0.3
  }
]

const WasteManagement: React.FC = () => {
  const [wasteLog, setWasteLog] = useState<WasteItem[]>([])
  const [currentLog, setCurrentLog] = useState<WasteLogItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [notes, setNotes] = useState('')

  // Load initial data
  useEffect(() => {
    const savedWasteLog = localStorage.getItem('wasteLog')
    if (savedWasteLog) {
      setWasteLog(JSON.parse(savedWasteLog))
    }

    const savedDarkMode = localStorage.getItem('wasteDarkMode')
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Handle dark mode
  useEffect(() => {
    localStorage.setItem('wasteDarkMode', JSON.stringify(isDarkMode))
    document.body.classList.toggle('dark-mode', isDarkMode)
  }, [isDarkMode])

  // Save waste log
  const saveWasteLog = useCallback((newLog: WasteItem[]) => {
    localStorage.setItem('wasteLog', JSON.stringify(newLog))
    setWasteLog(newLog)
  }, [])

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'All') {
      return wasteCategories
    }
    return wasteCategories.filter(
      (category) => category.name === selectedCategory
    )
  }, [selectedCategory])

  // Add item to current log
  const addToLog = useCallback((item: string, category: WasteCategory) => {
    setCurrentLog((prev) => {
      const existingItem = prev.find(
        (logItem) =>
          logItem.itemName === item && logItem.category === category.name
      )

      if (existingItem) {
        return prev.map((logItem) =>
          logItem.itemName === item && logItem.category === category.name
            ? { ...logItem, quantity: logItem.quantity + 1 }
            : logItem
        )
      }

      return [
        ...prev,
        {
          itemName: item,
          category: category.name,
          quantity: 1,
          cost: category.averageCost,
          unit: category.unit
        }
      ]
    })
  }, [])
  // Remove item from log
  const removeFromLog = useCallback((index: number) => {
    setCurrentLog((prev) => {
      const newLog = [...prev]
      const item = newLog[index]

      if (item.quantity > 1) {
        newLog[index] = { ...item, quantity: item.quantity - 1 }
        return newLog
      }

      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // Increase item quantity
  const increaseQuantity = useCallback((index: number) => {
    setCurrentLog((prev) => {
      const newLog = [...prev]
      const item = newLog[index]
      newLog[index] = { ...item, quantity: item.quantity + 1 }
      return newLog
    })
  }, [])

  // Show notification message
  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }, [])

  // Calculate total cost
  const calculateTotalCost = useMemo(() => {
    return currentLog.reduce((sum, item) => sum + item.cost * item.quantity, 0)
  }, [currentLog])

  // Handle log submission
  const handleLogSubmit = useCallback(() => {
    if (currentLog.length === 0) {
      showMessage('Please add items to log', 'error')
      return
    }

    const timestamp = new Date().toISOString()
    const newWasteItems: WasteItem[] = currentLog.map((item) => ({
      id: `${Date.now()}-${Math.random()}`,
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      timestamp,
      cost: item.cost * item.quantity,
      notes
    }))

    const updatedLog = [...newWasteItems, ...wasteLog]
    saveWasteLog(updatedLog)

    setCurrentLog([])
    setNotes('')
    showMessage('Waste items logged successfully', 'success')
  }, [currentLog, notes, wasteLog, saveWasteLog, showMessage])

  return (
    <PageContainer>
    <div className={`waste-container ${isDarkMode ? 'dark-mode' : ''}`}>
          <h1 className="page-title">Waste Management</h1>
      <header className="waste-header">
        <div className="header-left">
          <button className="mode-button">
            <Trash2 size={16} /> Total Cost: ${calculateTotalCost.toFixed(2)}
          </button>
        </div>

        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search waste items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="header-right">
          <span className="current-time">
            <Clock size={16} />
            {format(new Date(), 'HH:mm')}
          </span>
          <span className="current-date">
            <CalendarDays size={16} />
            {format(new Date(), 'MMM dd, yyyy')}
          </span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="mode-button"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="waste-main">
        <section className="waste-log-section">
          <h2 className="section-title">Current Waste Log</h2>

          {!currentLog || currentLog.length === 0 ? (
            <p className="empty-log">No items added to waste log</p>
          ) : (
            <ul className="waste-items">
              {currentLog.map((item, index) => (
                <li key={index} className="waste-item">
                  <span className="item-name">
                    {item.itemName}
                    <span className="item-category">({item.category})</span>
                  </span>
                  <div className="item-controls">
                    <button
                      onClick={() => removeFromLog(index)}
                      className="quantity-button"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="item-quantity">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => increaseQuantity(index)}
                      className="quantity-button"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="item-cost">
                      ${(item.cost * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromLog(index)}
                      className="remove-button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="log-details">
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="log-total">
            <span>Total Cost:</span>
            <span>${calculateTotalCost.toFixed(2)}</span>
          </div>

          <button
            onClick={handleLogSubmit}
            disabled={!currentLog || currentLog.length === 0}
            className="submit-log-button"
          >
            <Save size={16} /> Submit Waste Log
          </button>

          <Link href="/log" passHref>
            <button className="nav-button">
              <Coffee size={16} /> View Waste Log History
            </button>
          </Link>

          <Link href="/pos" passHref>
            <button className="nav-button">
              <Coffee size={16} /> Return to POS
            </button>
          </Link>
        </section>
        <section className="waste-menu-section">
          <div className="category-filters">
            {['All', ...wasteCategories.map((cat) => cat.name)].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-button ${
                    category === selectedCategory ? 'active' : ''
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>

          <div className="menu-grid">
            {filteredCategories.map((category) => (
              <div key={category.name} className="category-section">
                <h3 className="category-title">{category.name}</h3>
                <div className="items-grid">
                  {category.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => addToLog(item, category)}
                      className="waste-menu-item"
                    >
                      <Package className="item-icon" />
                      <h3 className="item-name">{item}</h3>
                      <p className="item-details">
                        ${category.averageCost.toFixed(2)} per {category.unit}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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

export default WasteManagement
