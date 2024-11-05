"use client"
import React, { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  Check,
  PlayCircle,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Phone,
  ArrowUpDown,
  Trash2,
  Edit2,
  Save,
  Download,
  Upload,
  RefreshCcw,
  Search,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { PageContainer } from "@/components/layout/page-container"
import './styles.css'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: number
  customerName: string
  status: string
  timestamp: string
  items: OrderItem[]
  total: number
  isComplimentary: boolean
  queueTime: number
  preparationTime?: number
  customerEmail?: string
  customerPhone?: string
  leadInterest?: boolean
  startTime?: string
  notes?: string
}

interface SearchFilters {
  customerName: string
  orderId: string
  itemName: string
  dateRange: {
    start: string
    end: string
  }
}

const ActiveOrders: React.FC = () => {
  // Basic state
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortCriteria, setSortCriteria] = useState('timestamp')
  const [sortDirection, setSortDirection] = useState('desc')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Search and filter states
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    customerName: '',
    orderId: '',
    itemName: '',
    dateRange: {
      start: '',
      end: ''
    }
  })

  // Order editing states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editedItems, setEditedItems] = useState<OrderItem[]>([])
  const [orderNotes, setOrderNotes] = useState('')

  // Message state for user feedback
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Helper function to show messages
  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }, [])

  // Load orders from localStorage
  const loadOrders = useCallback(() => {
    setIsLoading(true)
    setError(null)
    try {
      const loadedOrders = JSON.parse(
        localStorage.getItem('orders') || '[]'
      ) as Order[]
      setOrders(loadedOrders)
      setAllOrders(loadedOrders)
      setFilteredOrders(loadedOrders)
    } catch {
      setError('Error loading orders. Please try again.')
    }
    setIsLoading(false)
  } , [])


  // Filter and sort orders based on search criteria and filters
  const filterAndSortOrders = useCallback(() => {
    let filtered = orders

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Apply search filters
    if (searchFilters.customerName) {
      filtered = filtered.filter((order) =>
        order.customerName
          .toLowerCase()
          .includes(searchFilters.customerName.toLowerCase())
      )
    }

    if (searchFilters.orderId) {
      filtered = filtered.filter((order) =>
        order.id.toString().includes(searchFilters.orderId)
      )
    }

    if (searchFilters.itemName) {
      filtered = filtered.filter((order) =>
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchFilters.itemName.toLowerCase())
        )
      )
    }

    // Apply date range filter
    if (searchFilters.dateRange.start && searchFilters.dateRange.end) {
      const startDate = new Date(searchFilters.dateRange.start)
      const endDate = new Date(searchFilters.dateRange.end)
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.timestamp)
        return orderDate >= startDate && orderDate <= endDate
      })
    }

    // Sort filtered orders
    const sorted = [...filtered].sort((a, b) => {
      if (sortCriteria === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } else if (sortCriteria === 'preparationTime') {
        return (b.preparationTime || 0) - (a.preparationTime || 0)
      } else if (sortCriteria === 'queueTime') {
        return b.queueTime - a.queueTime
      }
      return 0
    })

    if (sortDirection === 'asc') {
      sorted.reverse()
    }

    setFilteredOrders(sorted)
  }, [orders, statusFilter, searchFilters, sortCriteria, sortDirection])

  // Update filters
  const updateSearchFilters = (
    field: keyof SearchFilters,
    value: string | { start: string; end: string }
  ) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculate new total based on items
  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Handle item editing
  const updateOrderItem = (
    orderId: number,
    itemId: string,
    updates: Partial<OrderItem>
  ) => {
    if (!selectedOrder) return

    const updatedItems = selectedOrder.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    )

    const newTotal = calculateTotal(updatedItems)

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      total: newTotal
    })
  }

  // Effect hooks for initial load and filtering
  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    filterAndSortOrders()
  }, [filterAndSortOrders])

  // Order status management
  const updateOrderStatus = (orderId: number, newStatus: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus }
        if (newStatus === 'Completed' && order.startTime) {
          const endTime = new Date()
          const startTime = new Date(order.startTime)
          updatedOrder.preparationTime =
            (endTime.getTime() - startTime.getTime()) / 1000
        }
        return updatedOrder
      }
      return order
    })

    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    showMessage('Order status updated successfully', 'success')
  }

  // Handle updating order notes
  const handleUpdateOrderNotes = (orderId: number, notes: string) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, notes } : order
    )
    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    showMessage('Order notes updated successfully', 'success')
  }

  // Lead interest tracking
  const recordLeadInterest = (orderId: number, interested: boolean) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, leadInterest: interested } : order
    )

    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    showMessage('Lead interest recorded successfully', 'success')
  }

  // Order cancellation
  const cancelOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const updatedOrders = orders.filter((order) => order.id !== orderId)
      setOrders(updatedOrders)
      const updatedAllOrders = allOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
      setAllOrders(updatedAllOrders)
      localStorage.setItem('orders', JSON.stringify(updatedOrders))
      showMessage('Order cancelled successfully', 'success')
    }
  }

  // Order modification
  const modifyOrder = (orderId: number) => {
    const orderToModify = orders.find((order) => order.id === orderId)
    if (orderToModify) {
      setSelectedOrder(orderToModify)
      setEditedItems([...orderToModify.items])
      setOrderNotes(orderToModify.notes || '')
      setShowOrderDetails(true)
    }
  }

  // Save modified order
  const saveModifiedOrder = () => {
    if (!selectedOrder) return

    const modifiedOrder = {
      ...selectedOrder,
      items: editedItems,
      notes: orderNotes,
      total: calculateTotal(editedItems)
    }

    const updatedOrders = orders.map((order) =>
      order.id === modifiedOrder.id ? modifiedOrder : order
    )

    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    
    // Update notes using the handler
    handleUpdateOrderNotes(modifiedOrder.id, orderNotes)
    
    setShowOrderDetails(false)
    setSelectedOrder(null)
    showMessage('Order updated successfully', 'success')
  }

  // Time formatting
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // PDF generation
  const generatePDF = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF()
    const tableColumn = [
      'Order #',
      'Customer',
      'Status',
      'Total',
      'Queue Time',
      'Prep Time',
      'Notes'
    ]
    const tableRows: (string | number)[][] = []

    allOrders.forEach((order) => {
      const orderData = [
        order.id,
        order.customerName,
        order.status,
        order.isComplimentary ? 'Free' : `$${order.total}`,
        formatTime(order.queueTime),
        order.preparationTime ? formatTime(order.preparationTime) : 'N/A',
        order.notes || 'N/A'
      ]
      tableRows.push(orderData)
    })

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    })

    doc.text('Buf Barista - Complete Order Report', 14, 15)
    doc.save('buf-barista-all-orders.pdf')
  }

  // Data management functions
  const clearAllOrders = () => {
    setShowClearConfirmation(true)
  }

  const confirmClearAllOrders = () => {
    const clearedOrders = allOrders.map((order) =>
      orders.some((activeOrder) => activeOrder.id === order.id)
        ? { ...order, status: 'Cleared' }
        : order
    )
    setAllOrders(clearedOrders)
    setOrders([])
    setFilteredOrders([])
    localStorage.setItem('orders', JSON.stringify([]))
    setShowClearConfirmation(false)
    showMessage('All orders cleared successfully', 'success')
  }

  const cancelClearAllOrders = () => {
    setShowClearConfirmation(false)
  }

  const resetAllData = () => {
    setShowResetConfirmation(true)
  }

  const confirmResetAllData = () => {
    localStorage.clear()
    setOrders([])
    setAllOrders([])
    setFilteredOrders([])
    setShowResetConfirmation(false)
    showMessage('All data reset successfully', 'success')
    window.location.reload()
  }

  const cancelResetAllData = () => {
    setShowResetConfirmation(false)
  }

  const exportData = () => {
    const data = {
      orders: allOrders,
      preferences: JSON.parse(
        localStorage.getItem('systemPreferences') || '{}'
      ),
      inventory: JSON.parse(localStorage.getItem('inventory') || '[]')
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'buf-barista-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showMessage('Data exported successfully', 'success')
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          localStorage.setItem('orders', JSON.stringify(data.orders))
          localStorage.setItem(
            'systemPreferences',
            JSON.stringify(data.preferences)
          )
          localStorage.setItem('inventory', JSON.stringify(data.inventory))
          loadOrders()
          showMessage('Data imported successfully', 'success')
        } catch {
          showMessage(
            'Error importing data. Please check the file format.',
            'error'
          )
        }
      }
      reader.readAsText(file)
    }
  }

  const toggleEditNotes = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setSelectedOrder(order)
      setOrderNotes(order.notes || '')
      setShowOrderDetails(true)
    }
  }

  // Render component
  return (
    <PageContainer>
      <div className="active-orders-container">
        <h1 className="page-title">Active Orders</h1>

        {isLoading && <div className="loading">Loading orders...</div>}
        {error && <div className="error">{error}</div>}

        {/* Search and Filter Section */}
        <div className="search-section">
          <div className="search-inputs">
            <div className="search-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by customer name..."
                value={searchFilters.customerName}
                onChange={(e) =>
                  updateSearchFilters('customerName', e.target.value)
                }
                className="search-input"
              />
            </div>
            <div className="search-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchFilters.orderId}
                onChange={(e) => updateSearchFilters('orderId', e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchFilters.itemName}
                onChange={(e) => updateSearchFilters('itemName', e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="date-range">
            <Calendar size={16} />
            <input
              type="date"
              value={searchFilters.dateRange.start}
              onChange={(e) =>
                updateSearchFilters('dateRange', {
                  ...searchFilters.dateRange,
                  start: e.target.value
                })
              }
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={searchFilters.dateRange.end}
              onChange={(e) =>
                updateSearchFilters('dateRange', {
                  ...searchFilters.dateRange,
                  end: e.target.value
                })
              }
              className="date-input"
            />
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
            className="filter-dropdown"
          >
            <option value="timestamp">Sort by Time</option>
            <option value="preparationTime">Sort by Prep Time</option>
            <option value="queueTime">Sort by Queue Time</option>
          </select>

          <button
            onClick={() =>
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
            }
            className="sort-button"
          >
            <ArrowUpDown size={16} />
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>

          <button onClick={generatePDF} className="pdf-button">
            <Save size={16} />
            Save as PDF
          </button>

          <button onClick={clearAllOrders} className="clear-button">
            <Trash2 size={16} />
            Clear All Orders
          </button>

          <button onClick={resetAllData} className="reset-button">
            <RefreshCcw size={16} />
            Reset All Data
          </button>

          <button onClick={exportData} className="export-button">
            <Download size={16} />
            Export Data
          </button>

          <label className="import-button">
            <Upload size={16} />
            Import Data
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={importData}
            />
          </label>
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${order.status.toLowerCase()}`}
            >
              <div className="order-header">
                <span className="order-number">Order #{order.id}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <div className="customer-name">{order.customerName}</div>
                <div className="order-time">
                  <Clock size={14} className="icon" />
                  {order.timestamp}
                </div>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>
                      {order.isComplimentary
                        ? 'Free'
                        : `$${(item.price * item.quantity).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                Total: {order.isComplimentary ? 'Free' : `$${order.total}`}
              </div>
              <div className="order-metrics">
                <div>Queue Time: {formatTime(order.queueTime)}</div>
                {order.preparationTime && (
                  <div>Preparation Time: {formatTime(order.preparationTime)}</div>
                )}
              </div>

              <div className="customer-contact">
                {order.customerEmail && <Mail size={14} className="icon" />}
                {order.customerPhone && <Phone size={14} className="icon" />}
              </div>

              {/* Order Notes Section */}
              <div className="order-notes-section">
                <div className="notes-header">
                  <FileText size={14} className="icon" />
                  <span>Notes</span>
                  <button
                    onClick={() => toggleEditNotes(order.id)}
                    className="edit-notes-button"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="notes-content">
                  {order.notes ? (
                    <p>{order.notes}</p>
                  ) : (
                    <p className="no-notes">No notes added</p>
                  )}
                </div>
              </div>

              {/* Lead Interest Section */}
              {order.status === 'Completed' && order.leadInterest === undefined && (
                <div className="lead-interest-section">
                  <div className="lead-interest-header">
                    Customer interested in sales pitch?
                  </div>
                  <div className="lead-interest-buttons">
                    <button
                      onClick={() => recordLeadInterest(order.id, true)}
                      className="lead-button yes"
                    >
                      <ThumbsUp size={16} className="icon" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => recordLeadInterest(order.id, false)}
                      className="lead-button no"
                    >
                      <ThumbsDown size={16} className="icon" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              )}

              {order.leadInterest !== undefined && (
                <div
                  className={`lead-status ${
                    order.leadInterest ? 'interested' : 'not-interested'
                  }`}
                >
                  <div className="lead-status-content">
                    <span className="lead-status-label">Lead Status:</span>
                    <span className="lead-status-value">
                      {order.leadInterest ? (
                        <>
                          <ThumbsUp size={16} className="icon" />
                          Interested
                        </>
                      ) : (
                        <>
                          <ThumbsDown size={16} className="icon" />
                          Not Interested
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {order.status !== 'Completed' && (
                <div className="order-actions">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'In Progress')}
                    className="start-button"
                    disabled={order.status === 'In Progress'}
                  >
                    <PlayCircle size={16} className="icon" /> Start
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                    className="complete-button"
                  >
                    <Check size={16} className="icon" /> Complete
                  </button>
                  <button
                    onClick={() => modifyOrder(order.id)}
                    className="modify-button"
                    disabled={order.status === 'Completed'}
                  >
                    <Edit2 size={16} className="icon" /> Modify
                  </button>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="cancel-button"
                    disabled={order.status !== 'Pending'}
                  >
                    <Trash2 size={16} className="icon" /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modals */}
        {showClearConfirmation && (
          <div className="modal">
            <div className="modal-content">
              <h2>Clear All Orders</h2>
              <p>
                Are you sure you want to clear all orders? This action will remove
                orders from the active list but they will still be included in the
                PDF report.
              </p>
              <div className="modal-actions">
                <button
                  onClick={confirmClearAllOrders}
                  className="confirm-button"
                >
                  Yes, Clear All
                </button>
                <button onClick={cancelClearAllOrders} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showResetConfirmation && (
          <div className="modal">
            <div className="modal-content">
              <h2>Reset All Data</h2>
              <p>
                Are you sure you want to reset all data? This action will clear
                all orders, preferences, and inventory data. This action cannot be
                undone.
              </p>
              <div className="modal-actions">
                <button onClick={confirmResetAllData} className="confirm-button">
                  Yes, Reset All Data
                </button>
                <button onClick={cancelResetAllData} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Edit Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="modal">
            <div className="modal-content">
              <h2>Modify Order</h2>
              <div className="order-form">
                <label>
                  Customer Name:
                  <input
                    type="text"
                    value={selectedOrder.customerName}
                    onChange={(e) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        customerName: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Order Notes:
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add notes about the order..."
                    rows={3}
                  />
                </label>

                <div className="items-list">
                  <h3>Order Items</h3>
                  {editedItems.map((item, index) => (
                    <div key={index} className="edit-item">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateOrderItem(selectedOrder.id, item.id, {
                            name: e.target.value
                          })
                        }
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          updateOrderItem(selectedOrder.id, item.id, {
                            quantity: parseInt(e.target.value)
                          })
                        }
                      />
                      <input
                        type="number"
                        value={item.price}
                        step="0.01"
                        min="0"
                        onChange={(e) =>
                          updateOrderItem(selectedOrder.id, item.id, {
                            price: parseFloat(e.target.value)
                          })
                        }
                      />
                      <button
                        onClick={() =>
                          setEditedItems((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="remove-item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={saveModifiedOrder} className="confirm-button">
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowOrderDetails(false)
                    setSelectedOrder(null)
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {message && (
          <div className={`message ${message.type}`}>
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

export default ActiveOrders