#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_colored $BLUE "Creating updated BufBaristaPOS component (Part 1/3)..."

# Create the POS page component with all imports and state management
cat > "src/app/dashboard/pos/page.tsx" << 'EOF'
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Coffee,
  X,
  DollarSign,
  Gift,
  Moon,
  Sun,
  Search,
  Bell,
  Plus,
  Minus,
  Trash2,
  Star,
  Clock,
  CalendarDays,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageContainer } from "@/components/layout/page-container"
import type { MenuItem, CartItem, CustomerInfo, MilkOption, QuickNote } from '@/types/pos'
import './styles.css'

// Constants for milk options
const milkOptions: MilkOption[] = [
  { name: 'No Milk', price: 0 },
  { name: 'Whole Milk', price: 0 },
  { name: 'Oat Milk', price: 0 }
]

const flavorOptions = [
  'No Flavoring',
  'Vanilla',
  'Caramel',
  'Hazelnut',
  'Raspberry',
  'Pumpkin Spice'
]

const BufBaristaPOS: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  // State
  const [cart, setCart] = useState<CartItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([])
  const [loading, setLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastInitial: '',
    organization: '',
    email: '',
    phone: ''
  })
  const [orderNotes, setOrderNotes] = useState('')
  const [orderNumber, setOrderNumber] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isComplimentaryMode, setIsComplimentaryMode] = useState(true)
  const [queueStartTime, setQueueStartTime] = useState<Date | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [runningTotal, setRunningTotal] = useState(0)
  const [notification, setNotification] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [selectedMilk, setSelectedMilk] = useState(milkOptions[0])
  const [showPopular, setShowPopular] = useState(false)

  // Fetch menu items and quick notes on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [menuResponse, notesResponse] = await Promise.all([
          fetch('/api/pos/menu-items'),
          fetch('/api/pos/quick-notes')
        ])

        if (menuResponse.ok && notesResponse.ok) {
          const menuData = await menuResponse.json()
          const notesData = await notesResponse.json()
          setMenuItems(menuData)
          setQuickNotes(notesData)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        showNotification('Error loading data')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchInitialData()
      setQueueStartTime(new Date())
    }
  }, [session])

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    document.body.classList.toggle('dark-mode', isDarkMode)
  }, [isDarkMode])

  const showNotification = useCallback((message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const categories = useMemo(
    () => ['All', ...new Set(menuItems.map((item) => item.category))],
    [menuItems]
  )

  // Add item to cart
  const addToCart = useCallback((item: MenuItem) => {
    setSelectedItem(item)
    setSelectedFlavor('No Flavoring')
    setSelectedMilk(milkOptions[0])
    setIsCustomizationModalOpen(true)
  }, [])

  // Confirm customization and add to cart
  const confirmCustomization = useCallback(() => {
    if (!selectedItem) return

    const newItem: CartItem = {
      ...selectedItem,
      flavor: selectedFlavor === 'No Flavoring' ? undefined : selectedFlavor,
      milk: selectedMilk,
      quantity: 1
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.flavor === newItem.flavor &&
          item.milk?.name === newItem.milk?.name
      )

      if (existingItemIndex !== -1) {
        return prevCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prevCart, newItem]
    })

    setRunningTotal((prev) => prev + selectedItem.price + selectedMilk.price)
    showNotification(`Added ${selectedItem.name} to cart`)
    setIsCustomizationModalOpen(false)
  }, [selectedItem, selectedFlavor, selectedMilk, showNotification])
EOF

print_colored $BLUE "Creating part 2 of the component..."

cat >> "src/app/dashboard/pos/page.tsx" << 'EOF'
  // Remove item from cart
  const removeFromCart = useCallback((index: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      const item = newCart[index]
      const itemTotal = item.price + (item.milk?.price || 0)

      if (item.quantity > 1) {
        newCart[index] = { ...item, quantity: item.quantity - 1 }
      } else {
        newCart.splice(index, 1)
      }

      setRunningTotal((prev) => prev - itemTotal)
      return newCart
    })
  }, [])

  // Increase item quantity
  const increaseQuantity = useCallback((index: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      const item = newCart[index]
      const itemTotal = item.price + (item.milk?.price || 0)

      newCart[index] = { ...item, quantity: item.quantity + 1 }
      setRunningTotal((prev) => prev + itemTotal)
      return newCart
    })
  }, [])

  // Calculate total
  const calculateTotal = useCallback(() => {
    return isComplimentaryMode
      ? 0
      : cart
          .reduce(
            (sum, item) =>
              sum + (item.price + (item.milk?.price || 0)) * item.quantity,
            0
          )
          .toFixed(2)
  }, [cart, isComplimentaryMode])

  // Place order
  const confirmOrder = useCallback(async () => {
    if (!customerInfo.firstName || !customerInfo.lastInitial || !session) return

    try {
      const orderData = {
        orderNumber,
        customerName: `${customerInfo.firstName} ${customerInfo.lastInitial}.`,
        customerInfo,
        items: cart,
        notes: orderNotes,
        timestamp: new Date().toISOString(),
        status: 'Pending',
        total: parseFloat(calculateTotal()),
        isComplimentary: isComplimentaryMode,
        queueTime: queueStartTime
          ? (new Date().getTime() - queueStartTime.getTime()) / 1000
          : 0,
        startTime: new Date()
      }

      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Failed to create order')

      // Reset state after successful order
      setCart([])
      setCustomerInfo({
        firstName: '',
        lastInitial: '',
        organization: '',
        email: '',
        phone: ''
      })
      setOrderNotes('')
      setOrderNumber((prev) => prev + 1)
      setQueueStartTime(new Date())
      setRunningTotal(0)
      setIsModalOpen(false)
      showNotification('Order placed successfully!')
    } catch (error) {
      console.error('Error placing order:', error)
      showNotification('Error placing order')
    }
  }, [
    customerInfo,
    cart,
    orderNumber,
    orderNotes,
    isComplimentaryMode,
    queueStartTime,
    session,
    showNotification,
    calculateTotal
  ])

  // Handle quick notes
  const addQuickNote = useCallback((note: string) => {
    setOrderNotes((prev) => (prev ? `${prev}\n${note}` : note))
  }, [])

  // Save quick note
  const saveQuickNote = useCallback(async (content: string) => {
    try {
      const response = await fetch('/api/pos/quick-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) throw new Error('Failed to save quick note')

      const newNote = await response.json()
      setQuickNotes((prev) => [...prev, newNote])
      showNotification('Quick note saved!')
    } catch (error) {
      console.error('Error saving quick note:', error)
      showNotification('Error saving quick note')
    }
  }, [showNotification])

  // Filter menu items
  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          (selectedCategory === 'All' || item.category === selectedCategory) &&
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!showPopular || item.popular)
      ),
    [menuItems, selectedCategory, searchTerm, showPopular]
  )

EOF

print_colored $BLUE "Creating the final part of the component with the render logic..."

cat >> "src/app/dashboard/pos/page.tsx" << 'EOF'
  if (status === "loading" || loading) {
    return (
      <PageContainer>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

  return (
    <PageContainer>
      <div className={`pos-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <header className="pos-header">
          <div className="header-left">
            <Link href="/waste" passHref>
              <Button className="waste-button">
                <Trash2 />
                Waste
              </Button>
            </Link>
            <Button 
              onClick={() => {
                setIsComplimentaryMode(!isComplimentaryMode)
                showNotification(`Switched to ${isComplimentaryMode ? 'Pop-up' : 'Complimentary'} mode`)
              }} 
              className="mode-button"
            >
              {isComplimentaryMode ? <Gift /> : <DollarSign />}
              {isComplimentaryMode ? 'Complimentary' : 'Pop-up'}
            </Button>
            <Button
              onClick={() => setShowPopular(!showPopular)}
              className={`mode-button ${showPopular ? 'active' : ''}`}
            >
              <Star />
              Popular
            </Button>
          </div>

          <div className="search-container">
            <Search />
            <input
              type="text"
              placeholder="Search menu..."
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
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="mode-button"
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </Button>
          </div>
        </header>

        <main className="pos-main">
          <section className="cart-section">
            <h2 className="section-title">Cart</h2>
            
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <ul className="cart-items">
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    <span className="item-name">
                      {item.name}
                      {item.milk && (
                        <span className="item-customization">
                          {' '}({item.milk.name})
                        </span>
                      )}
                      {item.flavor && (
                        <span className="item-customization">
                          {' '}with {item.flavor}
                        </span>
                      )}
                    </span>
                    <div className="item-controls">
                      <Button
                        onClick={() => removeFromCart(index)}
                        className="quantity-button"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="item-quantity">{item.quantity}</span>
                      <Button
                        onClick={() => increaseQuantity(index)}
                        className="quantity-button"
                      >
                        <Plus size={16} />
                      </Button>
                      <span className="item-price">
                        {isComplimentaryMode
                          ? ''
                          : `$${(
                              (item.price + (item.milk?.price || 0)) *
                              item.quantity
                            ).toFixed(2)}`}
                      </span>
                      <Button
                        onClick={() => removeFromCart(index)}
                        className="remove-item"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="order-notes-section">
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add notes about this order..."
                className="notes-input"
              />
              <div className="quick-notes">
                <div className="quick-note-chips">
                  {quickNotes.map((note, index) => (
                    <Button
                      key={index}
                      onClick={() => addQuickNote(note.content)}
                      className="quick-note-chip"
                    >
                      {note.content}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="cart-total">
              <span>Total:</span>
              <span>{isComplimentaryMode ? '' : `$${calculateTotal()}`}</span>
            </div>

            <Button
              onClick={() => cart.length > 0 && setIsModalOpen(true)}
              disabled={cart.length === 0}
              className="place-order-button"
            >
              Place Order
            </Button>

            <div className="cart-actions">
              <Link href="/dashboard/orders" passHref>
                <Button className="view-orders-button">View Orders</Button>
              </Link>
              <Link href="/dashboard/sales" passHref>
                <Button className="view-orders-button">View Reports</Button>
              </Link>
            </div>
          </section>

          <section className="menu-section">
            <div className="category-filters">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-button ${
                    category === selectedCategory ? 'active' : ''
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="menu-grid">
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="menu-item"
                >
                  <Coffee className="item-icon" />
                  <h3 className="item-name">
                    {item.name}
                    {item.popular && <Star className="popular-icon" size={16} />}
                  </h3>
                  <p className="item-price">
                    {isComplimentaryMode ? '' : `$${item.price.toFixed(2)}`}
                  </p>
                </Button>
              ))}
            </div>
          </section>
        </main>

        {/* Customization Modal */}
        {isCustomizationModalOpen && selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Customize {selectedItem.name}</h3>

              <div className="customization-section">
                <h4 className="section-subtitle">Select Milk</h4>
                <div className="milk-options">
                  {milkOptions.map((milk) => (
                    <Button
                      key={milk.name}
                      onClick={() => setSelectedMilk(milk)}
                      className={`milk-button ${
                        selectedMilk.name === milk.name ? 'selected' : ''
                      }`}
                    >
                      <span>{milk.name}</span>
                      {milk.price > 0 && (
                        <span className="milk-price">
                          +${milk.price.toFixed(2)}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="customization-section">
                <h4 className="section-subtitle">Select Flavor</h4>
                {flavorOptions.map((flavor) => (
                  <Button
                    key={flavor}
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`flavor-button ${
                      selectedFlavor === flavor ? 'selected' : ''
                    }`}
                  >
                    {flavor}
                  </Button>
                ))}
              </div>

              <div className="modal-buttons">
                <Button
                  onClick={() => setIsCustomizationModalOpen(false)}
                  className="modal-button cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmCustomization}
                  className="modal-button confirm"
                  disabled={!selectedFlavor}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Customer Information</h3>
              <input
                type="text"
                value={customerInfo.firstName}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, firstName: e.target.value })
                }
                placeholder="First Name"
                className="modal-input"
              />
              <input
                type="text"
                value={customerInfo.lastInitial}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    lastInitial: e.target.value
                  })
                }
                placeholder="Last Name Initial"
                className="modal-input"
              />
              <input
                type="text"
                value={customerInfo.organization}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    organization: e.target.value
                  })
                }
                placeholder="Organization (Optional)"
                className="modal-input"
              />
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    email: e.target.value
                  })
                }
                placeholder="Email (Optional)"
                className="modal-input"
              />
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    phone: e.target.value
                  })
                }
                placeholder="Phone (Optional)"
                className="modal-input"
              />
              <div className="modal-buttons">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="modal-button cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmOrder}
                  className="modal-button confirm"
                  disabled={!customerInfo.firstName || !customerInfo.lastInitial}
                >
                  Confirm Order
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="notification">
            <Bell size={16} />
            {notification}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default BufBaristaPOS
EOF


print_colored $GREEN "POS component creation complete!"
print_colored $BLUE "Next steps:"
echo "1. Add proper error handling for API calls"
echo "2. Implement retry logic for failed operations"
echo "3. Add offline support"
echo "4. Add proper loading skeletons"
echo "5. Add unit tests"

Would you like me to help with any of these next steps?

