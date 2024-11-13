// "use client"
// import React, { useState, useEffect, useCallback, useMemo } from 'react'
// import {
//  Coffee,
//  X,
//  DollarSign,
//  Gift,
//  Moon,
//  Sun,
//  Search,
//  Bell,
//  Plus,
//  Minus,
//  Trash2,
//  Star,
//  Clock,
//  CalendarDays,
//  Loader2
// } from 'lucide-react'
// import Link from 'next/link'
// import {Button} from '@/components/ui/button'
// import { format } from 'date-fns'
// import { PageContainer } from "@/components/layout/page-container"
// import { posService } from '@/lib/services/pos-service'
// import './styles.css'
// import { MenuItem, MilkOption, CartItem, CustomerInfo } from '@/types/pos'

// // Constants
// const flavorOptions = [
//  'No Flavoring',
//  'Vanilla',
//  'Caramel',
//  'Hazelnut',
//  'Raspberry',
//  'Pumpkin Spice'
// ]

// const milkOptions: MilkOption[] = [
//  { name: 'No Milk', price: 0 },
//  { name: 'Whole Milk', price: 0 },
//  { name: 'Oat Milk', price: 0 }
// ]

// const BufBaristaPOS: React.FC = () => {
//  // Basic state
//  const [cart, setCart] = useState<CartItem[]>([])
//  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
//  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
//    firstName: '',
//    lastInitial: '',
//    organization: '',
//    email: '',
//    phone: ''
//  })
//  const [orderNotes, setOrderNotes] = useState('')
//  const [orderNumber, setOrderNumber] = useState(1)
//  const [selectedCategory, setSelectedCategory] = useState('All')
//  const [isComplimentaryMode, setIsComplimentaryMode] = useState(true)
//  const [queueStartTime, setQueueStartTime] = useState<Date | null>(null)
//  const [isDarkMode, setIsDarkMode] = useState(false)
//  const [searchTerm, setSearchTerm] = useState('')
//  const [quickNotes, setQuickNotes] = useState<string[]>([])
//  const [isLoading, setIsLoading] = useState(true)

//  // Modal states
//  const [isModalOpen, setIsModalOpen] = useState(false)
//  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)
//  const [notification, setNotification] = useState<string | null>(null)
//  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
//  const [selectedFlavor, setSelectedFlavor] = useState('')
//  const [selectedMilk, setSelectedMilk] = useState(milkOptions[0])
//  const [showPopular, setShowPopular] = useState(false)

//  // Initial data loading
//  useEffect(() => {
//    const loadInitialData = async () => {
//      setIsLoading(true)
//     const prefs = {
//       lastOrderNumber: 1,
//       darkMode: false,
//       complimentaryMode: true
//     };

//     try {
//       const lastOrderNumber = prefs.lastOrderNumber || 1;
//       setOrderNumber((lastOrderNumber as number) + 1);
//       setIsDarkMode(prefs.darkMode || false);
//       setIsComplimentaryMode(prefs.complimentaryMode || true);

//       setQueueStartTime(new Date());
//     } catch (error) {
//        console.error('Error loading initial data:', error)
//        showNotification('Error loading some data. Using fallback options.')
       
//        // Load from localStorage as fallback
//        const savedQuickNotes = localStorage.getItem('quickNotes')
//        if (savedQuickNotes) {
//          setQuickNotes(JSON.parse(savedQuickNotes))
//        }

//        const lastOrderNumber = localStorage.getItem('lastOrderNumber')
//        if (lastOrderNumber) {
//          setOrderNumber(parseInt(lastOrderNumber) + 1)
//        }

//        const savedDarkMode = localStorage.getItem('darkMode')
//        if (savedDarkMode) {
//          setIsDarkMode(JSON.parse(savedDarkMode))
//        }

//        const savedComplimentaryMode = localStorage.getItem('complimentaryMode')
//        if (savedComplimentaryMode) {
//          setIsComplimentaryMode(JSON.parse(savedComplimentaryMode))
//        }
//      } finally {
//        setIsLoading(false)
//      }
//    }

//    loadInitialData()
//  }, [])

//  // Save preferences
//  useEffect(() => {
//    posService.savePreference('darkMode', isDarkMode)
//    document.body.classList.toggle('dark-mode', isDarkMode)
//  }, [isDarkMode])

//  useEffect(() => {
//    posService.savePreference('complimentaryMode', isComplimentaryMode)
//  }, [isComplimentaryMode])

//  const categories = useMemo(
//    () => ['All', ...new Set(menuItems.map((item) => item.category))],
//    [menuItems]
//  )

//  const showNotification = useCallback((message: string) => {
//    setNotification(message)
//    setTimeout(() => setNotification(null), 3000)
//  }, [])

//  const addToCart = useCallback((item: MenuItem) => {
//    setSelectedItem(item)
//    setSelectedFlavor('No Flavoring')

//    // Set default milk based on specific drinks and categories
//    const noMilkDrinks = ['Espresso', 'Americano']
//    const defaultMilk = noMilkDrinks.includes(item.name)
//      ? milkOptions.find((milk) => milk.name === 'No Milk') || milkOptions[0]
//      : item.category === 'Coffee' || item.category === 'Specialty'
//      ? milkOptions.find((milk) => milk.name === 'Whole Milk') || milkOptions[0]
//      : milkOptions[0]

//    setSelectedMilk(defaultMilk)
//    setIsCustomizationModalOpen(true)
//  }, [])

//  const confirmCustomization = useCallback(() => {
//    if (!selectedItem) return

//    const newItem: CartItem = {
//      ...selectedItem,
//      flavor: selectedFlavor === 'No Flavoring' ? undefined : selectedFlavor,
//      milk: selectedMilk,
//      quantity: 1
//    }

//    setCart((prevCart) => {
//      const existingItemIndex = prevCart.findIndex(
//        (item) =>
//          item.id === newItem.id &&
//          item.flavor === newItem.flavor &&
//          item.milk?.name === newItem.milk?.name
//      )

//      if (existingItemIndex !== -1) {
//        return prevCart.map((item, index) =>
//          index === existingItemIndex
//            ? { ...item, quantity: item.quantity + 1 }
//            : item
//        )
//      }

//      return [...prevCart, newItem]
//    })

//    showNotification(
//      `Added ${selectedItem.name} with ${selectedMilk.name}${
//        selectedFlavor !== 'No Flavoring' ? ` and ${selectedFlavor}` : ''
//      } to cart`
//    )

//    setIsCustomizationModalOpen(false)
//  }, [selectedItem, selectedFlavor, selectedMilk, showNotification])

//  const removeFromCart = useCallback((index: number) => {
//    setCart((prevCart) => {
//      const newCart = [...prevCart]
//      if (newCart[index].quantity > 1) {
//        newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 }
//      } else {
//        newCart.splice(index, 1)
//      }
//      return newCart
//    })
//  }, [])

//  const increaseQuantity = useCallback((index: number) => {
//    setCart((prevCart) => {
//      const newCart = [...prevCart]
//      newCart[index] = { ...newCart[index], quantity: newCart[index].quantity + 1 }
//      return newCart
//    })
//  }, [])

//  const calculateTotal = useCallback(() => {
//    return isComplimentaryMode
//       ? '0.00'
//       : cart.reduce(
//           (total, item) =>
//             total + (item.price + (item.milk?.price || 0)) * item.quantity,
//           0
//         ).toFixed(2)
//   }
// , [cart, isComplimentaryMode])

//  const handlePlaceOrder = useCallback(() => {
//    if (cart.length === 0) return
//    setIsModalOpen(true)
//  }, [cart])

//  const addQuickNote = useCallback(async (note: string) => {
//    setOrderNotes((prev) => (prev ? `${prev}\n${note}` : note))
//    try {
//      await posService.createQuickNote(note)
//      const notes = await posService.getQuickNotes()
//      setQuickNotes(notes.map(note => note.content))
//    } catch (error) {
//      console.error('Error saving quick note:', error)
//    }
//  }, [])

//  const confirmOrder = useCallback(async () => {
//    if (!customerInfo.firstName || !customerInfo.lastInitial) return

//    const orderStartTime = new Date()
//    const newOrder = {
//      orderNumber,
//      customerName: `${customerInfo.firstName} ${customerInfo.lastInitial}.`,
//      customerInfo,
//      items: cart,
//      notes: orderNotes,
//      status: 'PENDING',
//      total: parseFloat(calculateTotal()),
//      isComplimentary: isComplimentaryMode,
//      queueTime: queueStartTime
//        ? (orderStartTime.getTime() - queueStartTime.getTime()) / 1000
//        : 0,
//      startTime: orderStartTime
//    }

//    try {
//      await posService.createOrder({ ...newOrder, id: '', userId: '' })
     
//      setCart([])
//      setCustomerInfo({
//        firstName: '',
//        lastInitial: '',
//        organization: '',
//        email: '',
//        phone: ''
//      })
//      setOrderNotes('')
//      setOrderNumber(orderNumber + 1)
//      setQueueStartTime(new Date())
//      setIsModalOpen(false)
//      showNotification('Order placed successfully!')
//    } catch (error) {
//      console.error('Error creating order:', error)
//      showNotification('Error creating order. Please try again.')
//    }
//  }, [
//    customerInfo,
//    cart,
//    orderNumber,
//    calculateTotal,
//    isComplimentaryMode,
//    queueStartTime,
//    showNotification,
//    orderNotes
//  ])

//  const filteredMenuItems = useMemo(
//    () =>
//      menuItems.filter(
//        (item) =>
//          (selectedCategory === 'All' || item.category === selectedCategory) &&
//          item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
//          (!showPopular || item.popular)
//      ),
//    [selectedCategory, searchTerm, showPopular, menuItems]
//  )

//  const handleKeyPress = useCallback(
//    (e: KeyboardEvent) => {
//      if (e.key === 'Enter' && e.ctrlKey) {
//        handlePlaceOrder()
//      }
//    },
//    [handlePlaceOrder]
//  )

//  useEffect(() => {
//    window.addEventListener('keydown', handleKeyPress)
//    return () => {
//      window.removeEventListener('keydown', handleKeyPress)
//    }
//  }, [handleKeyPress])

//  const toggleServiceMode = useCallback(() => {
//    setIsComplimentaryMode((prev) => !prev)
//    showNotification(
//      `Switched to ${isComplimentaryMode ? 'Pop-up' : 'Complimentary'} mode`
//    )
//  }, [isComplimentaryMode, showNotification])

//  if (isLoading) {
//    return (
//      <PageContainer>
//        <div className="flex items-center justify-center min-h-screen">
//          <div className="flex flex-col items-center space-y-4">
//            <Loader2 className="w-8 h-8 animate-spin" />
//            <p className="text-lg">Loading POS system...</p>
//          </div>
//        </div>
//      </PageContainer>
//    )
//  }

//  return (
//    <PageContainer>
//      <div className={`pos-container ${isDarkMode ? 'dark-mode' : ''}`}>
//        <h1 className="page-title">Point of Sale</h1>

//        <header className="pos-header">
//          <div className="header-left">
//            <Link href="/waste" passHref>
//              <button className="waste-button">
//                <Trash2 />
//                Waste
//              </button>
//            </Link>
//            <button onClick={toggleServiceMode} className="mode-button">
//              {isComplimentaryMode ? <Gift /> : <DollarSign />}
//              {isComplimentaryMode ? 'Complimentary' : 'Pop-up'}
//            </button>
//            <button
//              onClick={() => setShowPopular(!showPopular)}
//              className={`mode-button ${showPopular ? 'active' : ''}`}
//            >
//              <Star />
//              Popular
//            </button>
//          </div>

//          <div className="search-container">
//            <Search />
//            <input
//              type="text"
//              placeholder="Search menu..."
//              value={searchTerm}
//              onChange={(e) => setSearchTerm(e.target.value)}
//              className="search-input"
//            />
//          </div>

//          <div className="header-right">
//            <span className="current-time">
//              <Clock size={16} />
//              {format(new Date(), 'HH:mm')}
//            </span>
//            <span className="current-date">
//              <CalendarDays size={16} />
//              {format(new Date(), 'MMM dd, yyyy')}
//            </span>
//            <button
//              onClick={() => setIsDarkMode(!isDarkMode)}
//              className="mode-button"
//            >
//              {isDarkMode ? <Sun /> : <Moon />}
//            </button>
//          </div>
//        </header>

//        <main className="pos-main">
//          <section className="cart-section">
//            <h2 className="section-title">Cart</h2>

//            {cart.length === 0 ? (
//              <p className="empty-cart">Your cart is empty</p>
//            ) : (
//              <ul className="cart-items">
//                {cart.map((item, index) => (
//                  <li key={index} className="cart-item">
//                    <span className="item-name">
//                      {item.name}
//                      {item.milk && (
//                        <span className="item-customization">
//                          {' '}
//                          ({item.milk.name})
//                        </span>
//                      )}
//                      {item.flavor && (
//                        <span className="item-customization">
//                          {' '}
//                          with {item.flavor}
//                        </span>
//                      )}
//                    </span>
//                    <div className="item-controls">
//                      <button
//                        onClick={() => removeFromCart(index)}
//                        className="quantity-button"
//                      >
//                        <Minus size={16} />
//                        </button>
//                      <span className="item-quantity">{item.quantity}</span>
//                      <button
//                        onClick={() => increaseQuantity(index)}
//                        className="quantity-button"
//                      >
//                        <Plus size={16} />
//                      </button>
//                      <span className="item-price">
//                        {isComplimentaryMode
//                          ? ''
//                          : `$${(
//                              (item.price + (item.milk?.price || 0)) *
//                              item.quantity
//                            ).toFixed(2)}`}
//                      </span>
//                      <Button
//                        onClick={() => removeFromCart(index)}
//                        className="remove-item"
//                      >
//                        <X size={16} />
//                      </Button>
//                    </div>
//                  </li>
//                ))}
//              </ul>
//            )}

//            <div className="order-notes-section">
//              <textarea
//                value={orderNotes}
//                onChange={(e) => setOrderNotes(e.target.value)}
//                placeholder="Add notes about this order..."
//                className="notes-input"
//              />
//              <div className="quick-notes">
//                <div className="quick-note-chips">
//                  {quickNotes.map((note, index) => (
//                    <button
//                      key={index}
//                      onClick={() => addQuickNote(note)}
//                      className="quick-note-chip"
//                    >
//                      {note}
//                    </button>
//                  ))}
//                </div>
//              </div>
//            </div>

//            <div className="cart-total">
//              <span>Total:</span>
//              <span>{isComplimentaryMode ? '' : `$${calculateTotal()}`}</span>
//            </div>

//            <button
//              onClick={handlePlaceOrder}
//              disabled={cart.length === 0}
//              className="place-order-button"
//            >
//              Place Order
//            </button>

//            <Link href="/dashboard/orders" passHref>
//              <button className="view-orders-button">View Orders</button>
//            </Link>
//            <Link href="/dashboard/sales" passHref>
//              <button className="view-orders-button">View Reports</button>
//            </Link>
//          </section>

//          <section className="menu-section">
//            <div className="category-filters">
//              {categories.map((category) => (
//                <button
//                  key={category}
//                  onClick={() => setSelectedCategory(category)}
//                  className={`category-button ${
//                    category === selectedCategory ? 'active' : ''
//                  }`}
//                >
//                  {category}
//                </button>
//              ))}
//            </div>

//            <div className="menu-grid">
//              {filteredMenuItems.map((item) => (
//                <button
//                  key={item.id}
//                  onClick={() => addToCart(item)}
//                  className="menu-item"
//                >
//                  <Coffee className="item-icon" />
//                  <h3 className="item-name">
//                    {item.name}
//                    {item.popular && <Star className="popular-icon" size={16} />}
//                  </h3>
//                  <p className="item-price">
//                    {isComplimentaryMode ? '' : `$${item.price.toFixed(2)}`}
//                  </p>
//                </button>
//              ))}
//            </div>
//          </section>
//        </main>

//        {/* Customer Information Modal */}
//        {isModalOpen && (
//          <div className="modal-overlay">
//            <div className="modal-content">
//              <h3 className="modal-title">Customer Information</h3>
//              <input
//                type="text"
//                value={customerInfo.firstName}
//                onChange={(e) =>
//                  setCustomerInfo({ ...customerInfo, firstName: e.target.value })
//                }
//                placeholder="First Name"
//                className="modal-input"
//              />
//              <input
//                type="text"
//                value={customerInfo.lastInitial}
//                onChange={(e) =>
//                  setCustomerInfo({
//                    ...customerInfo,
//                    lastInitial: e.target.value
//                  })
//                }
//                placeholder="Last Name Initial"
//                className="modal-input"
//              />
//              <input
//                type="text"
//                value={customerInfo.organization}
//                onChange={(e) =>
//                  setCustomerInfo({
//                    ...customerInfo,
//                    organization: e.target.value
//                  })
//                }
//                placeholder="Organization (Optional)"
//                className="modal-input"
//              />
//              <input
//                type="email"
//                value={customerInfo.email}
//                onChange={(e) =>
//                  setCustomerInfo({
//                    ...customerInfo,
//                    email: e.target.value
//                  })
//                }
//                placeholder="Email (Optional)"
//                className="modal-input"
//              />
//              <input
//                type="tel"
//                value={customerInfo.phone}
//                onChange={(e) =>
//                  setCustomerInfo({
//                    ...customerInfo,
//                    phone: e.target.value
//                  })
//                }
//                placeholder="Phone (Optional)"
//                className="modal-input"
//              />
//              <div className="modal-buttons">
//                <button
//                  onClick={() => setIsModalOpen(false)}
//                  className="modal-button cancel"
//                >
//                  Cancel
//                </button>
//                <button onClick={confirmOrder} className="modal-button confirm">
//                  Confirm Order
//                </button>
//              </div>
//            </div>
//          </div>
//        )}

//        {/* Customization Modal */}
//        {isCustomizationModalOpen && selectedItem && (
//          <div className="modal-overlay">
//            <div className="modal-content">
//              <h3 className="modal-title">Customize {selectedItem.name}</h3>

//              <div className="customization-section">
//                <h4 className="section-subtitle">Select Milk</h4>
//                <div className="milk-options">
//                  {milkOptions.map((milk) => (
//                    <button
//                      key={milk.name}
//                      onClick={() => setSelectedMilk(milk)}
//                      className={`milk-button ${
//                        selectedMilk.name === milk.name ? 'selected' : ''
//                      }`}
//                    >
//                      <span>{milk.name}</span>
//                      {milk.price > 0 && (
//                        <span className="milk-price">
//                          +${milk.price.toFixed(2)}
//                        </span>
//                      )}
//                    </button>
//                  ))}
//                </div>
//              </div>

//              <div className="customization-section">
//                <h4 className="section-subtitle">Select Flavor</h4>
//                {flavorOptions.map((flavor) => (
//                  <button
//                    key={flavor}
//                    onClick={() => setSelectedFlavor(flavor)}
//                    className={`flavor-button ${
//                      selectedFlavor === flavor ? 'selected' : ''
//                    }`}
//                  >
//                    {flavor}
//                  </button>
//                ))}
//              </div>

//              <div className="modal-buttons">
//                <button
//                  onClick={() => setIsCustomizationModalOpen(false)}
//                  className="modal-button cancel"
//                >
//                  Cancel
//                </button>
//                <button
//                  onClick={confirmCustomization}
//                  className="modal-button confirm"
//                  disabled={!selectedFlavor}
//                >
//                  Add to Cart
//                </button>
//              </div>
//            </div>
//          </div>
//        )}

//        {/* Notification */}
//        {notification && (
//          <div className="notification">
//            <Bell size={16} />
//            {notification}
//          </div>
//        )}
//      </div>
//    </PageContainer>
//  )
// }

// export default BufBaristaPOS
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
  CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import {Button} from '../../../components/ui/button'
import { format } from 'date-fns'
import { PageContainer } from "@/components/layout/page-container"
import './styles.css'

// Types
interface MenuItem {
  id: number
  name: string
  price: number
  category: string
  popular: boolean
}

interface MilkOption {
  name: string
  price: number
}

interface CartItem extends MenuItem {
  quantity: number
  flavor?: string
  milk?: MilkOption
}

interface CustomerInfo {
  firstName: string
  lastInitial: string
  organization: string
  email: string
  phone: string
}

// Constants
const menuItems = [
  { id: 1, name: 'Espresso', price: 2.5, category: 'Coffee', popular: true },
  { id: 2, name: 'Americano', price: 3.0, category: 'Coffee', popular: false },
  { id: 3, name: 'Latte', price: 3.5, category: 'Coffee', popular: true },
  { id: 4, name: 'Cappuccino', price: 3.5, category: 'Coffee', popular: true },
  {
    id: 5,
    name: 'Flat White',
    price: 3.5,
    category: 'Coffee',
    popular: false
  },
  { id: 6, name: 'Cortado', price: 3.5, category: 'Coffee', popular: false },
  {
    id: 7,
    name: 'Caramel Crunch Crusher',
    price: 4.5,
    category: 'Specialty',
    popular: true
  },
  {
    id: 8,
    name: 'Vanilla Dream Latte',
    price: 4.5,
    category: 'Specialty',
    popular: false
  },
  {
    id: 9,
    name: 'Hazelnut Heaven Cappuccino',
    price: 4.5,
    category: 'Specialty',
    popular: false
  }
]

const flavorOptions = [
  'No Flavoring',
  'Vanilla',
  'Caramel',
  'Hazelnut',
  'Raspberry',
  'Pumpkin Spice'
]

const milkOptions: MilkOption[] = [
  { name: 'No Milk', price: 0 },
  { name: 'Whole Milk', price: 0 },
  { name: 'Oat Milk', price: 0 }
]

const BufBaristaPOS: React.FC = () => {
  // Basic state
  const [cart, setCart] = useState<CartItem[]>([])
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
  const [quickNotes, setQuickNotes] = useState<string[]>([])

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [selectedMilk, setSelectedMilk] = useState(milkOptions[0])
  const [showPopular, setShowPopular] = useState(false)

  // Load saved quick notes
  useEffect(() => {
    const savedQuickNotes = localStorage.getItem('quickNotes')
    if (savedQuickNotes) {
      setQuickNotes(JSON.parse(savedQuickNotes))
    }
  }, [])

  // Save quick notes
  useEffect(() => {
    localStorage.setItem('quickNotes', JSON.stringify(quickNotes))
  }, [quickNotes])

  const categories = useMemo(
    () => ['All', ...new Set(menuItems.map((item) => item.category))],
    []
  )

  useEffect(() => {
    const lastOrderNumber = localStorage.getItem('lastOrderNumber')
    if (lastOrderNumber) {
      setOrderNumber(parseInt(lastOrderNumber) + 1)
    }

    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode))
    }

    const savedComplimentaryMode = localStorage.getItem('complimentaryMode')
    if (savedComplimentaryMode) {
      setIsComplimentaryMode(JSON.parse(savedComplimentaryMode))
    }

    setQueueStartTime(new Date())
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    document.body.classList.toggle('dark-mode', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem(
      'complimentaryMode',
      JSON.stringify(isComplimentaryMode)
    )
  }, [isComplimentaryMode])

  const showNotification = useCallback((message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const addToCart = useCallback((item: MenuItem) => {
    setSelectedItem(item)
    setSelectedFlavor('No Flavoring')

    // Set default milk based on specific drinks and categories
    const noMilkDrinks = ['Espresso', 'Americano']
    const defaultMilk = noMilkDrinks.includes(item.name)
      ? milkOptions.find((milk) => milk.name === 'No Milk') || milkOptions[0]
      : item.category === 'Coffee' || item.category === 'Specialty'
      ? milkOptions.find((milk) => milk.name === 'Whole Milk') || milkOptions[0]
      : milkOptions[0]

    setSelectedMilk(defaultMilk)
    setIsCustomizationModalOpen(true)
  }, [])

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

    showNotification(
      `Added ${selectedItem.name} with ${selectedMilk.name}${
        selectedFlavor !== 'No Flavoring' ? ` and ${selectedFlavor}` : ''
      } to cart`
    )

    setIsCustomizationModalOpen(false)
  }, [selectedItem, selectedFlavor, selectedMilk, showNotification])

  const removeFromCart = useCallback((index: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      if (newCart[index].quantity > 1) {
        newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 }
      } else {
        newCart.splice(index, 1)
      }
      return newCart
    })
  }, [])

  const increaseQuantity = useCallback((index: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      newCart[index] = { ...newCart[index], quantity: newCart[index].quantity + 1 }
      return newCart
    })
  }, [])

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

  const handlePlaceOrder = useCallback(() => {
    if (cart.length === 0) return
    setIsModalOpen(true)
  }, [cart])

  const addQuickNote = useCallback((note: string) => {
    setOrderNotes((prev) => (prev ? `${prev}\n${note}` : note))
  }, [])

  const confirmOrder = useCallback(() => {
    if (!customerInfo.firstName || !customerInfo.lastInitial) return

    const orderStartTime = new Date()
    const newOrder = {
      id: orderNumber,
      customerName: `${customerInfo.firstName} ${customerInfo.lastInitial}.`,
      customerInfo: { ...customerInfo },
      items: [...cart],
      notes: orderNotes,
      timestamp: orderStartTime.toLocaleString(),
      status: 'Pending',
      total: calculateTotal(),
      isComplimentary: isComplimentaryMode,
      queueTime: queueStartTime
        ? (orderStartTime.getTime() - queueStartTime.getTime()) / 1000
        : 0,
      startTime: orderStartTime
    }

    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const updatedOrders = [newOrder, ...existingOrders]
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    localStorage.setItem('lastOrderNumber', orderNumber.toString())

    setCart([])
    setCustomerInfo({
      firstName: '',
      lastInitial: '',
      organization: '',
      email: '',
      phone: ''
    })
    setOrderNotes('')
    setOrderNumber(orderNumber + 1)
    setQueueStartTime(new Date())
    setIsModalOpen(false)
    showNotification('Order placed successfully!')
  }, [
    customerInfo,
    cart,
    orderNumber,
    calculateTotal,
    isComplimentaryMode,
    queueStartTime,
    showNotification,
    orderNotes
  ])

  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          (selectedCategory === 'All' || item.category === selectedCategory) &&
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!showPopular || item.popular)
      ),
    [selectedCategory, searchTerm, showPopular]
  )

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handlePlaceOrder()
      }
    },
    [handlePlaceOrder]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const toggleServiceMode = useCallback(() => {
    setIsComplimentaryMode((prev) => !prev)
    showNotification(
      `Switched to ${isComplimentaryMode ? 'Pop-up' : 'Complimentary'} mode`
    )
  }, [isComplimentaryMode, showNotification])

  return (
    <PageContainer>
      <div className={`pos-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <h1 className="page-title">Point of Sale</h1>

        <header className="pos-header">
          <div className="header-left">
            <Link href="/waste" passHref>
              <button className="waste-button">
                <Trash2 />
                Waste
              </button>
            </Link>
            <button onClick={toggleServiceMode} className="mode-button">
              {isComplimentaryMode ? <Gift /> : <DollarSign />}
              {isComplimentaryMode ? 'Complimentary' : 'Pop-up'}
            </button>
            <button
              onClick={() => setShowPopular(!showPopular)}
              className={`mode-button ${showPopular ? 'active' : ''}`}
            >
              <Star />
              Popular
            </button>
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
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="mode-button"
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
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
                          {' '}
                          ({item.milk.name})
                        </span>
                      )}
                      {item.flavor && (
                        <span className="item-customization">
                          {' '}
                          with {item.flavor}
                        </span>
                      )}
                    </span>
                    <div className="item-controls">
                      <button
                        onClick={() => removeFromCart(index)}
                        className="quantity-button"
                      >
                        <Minus size={16} />
                        </button>
                      <span className="item-quantity">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(index)}
                        className="quantity-button"
                      >
                        <Plus size={16} />
                      </button>
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
                    <button
                      key={index}
                      onClick={() => addQuickNote(note)}
                      className="quick-note-chip"
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="cart-total">
              <span>Total:</span>
              <span>{isComplimentaryMode ? '' : `$${calculateTotal()}`}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0}
              className="place-order-button"
            >
              Place Order
            </button>

            <Link href="/dashboard/orders" passHref>
              <button className="view-orders-button">View Orders</button>
            </Link>
            <Link href="/dashboard/sales" passHref>
              <button className="view-orders-button">View Reports</button>
            </Link>
          </section>

          <section className="menu-section">
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-button ${
                    category === selectedCategory ? 'active' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="menu-grid">
              {filteredMenuItems.map((item) => (
                <button
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
                </button>
              ))}
            </div>
          </section>
        </main>

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
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="modal-button cancel"
                >
                  Cancel
                </button>
                <button onClick={confirmOrder} className="modal-button confirm">
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customization Modal */}
        {isCustomizationModalOpen && selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Customize {selectedItem.name}</h3>

              <div className="customization-section">
                <h4 className="section-subtitle">Select Milk</h4>
                <div className="milk-options">
                  {milkOptions.map((milk) => (
                    <button
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
                    </button>
                  ))}
                </div>
              </div>

              <div className="customization-section">
                <h4 className="section-subtitle">Select Flavor</h4>
                {flavorOptions.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`flavor-button ${
                      selectedFlavor === flavor ? 'selected' : ''
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>

              <div className="modal-buttons">
                <button
                  onClick={() => setIsCustomizationModalOpen(false)}
                  className="modal-button cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCustomization}
                  className="modal-button confirm"
                  disabled={!selectedFlavor}
                >
                  Add to Cart
                </button>
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