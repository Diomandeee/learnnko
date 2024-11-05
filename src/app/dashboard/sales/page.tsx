"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  eachDayOfInterval,
} from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts'
import {
  Download,
  DollarSign,
  TrendingUp,
  Coffee,
  Clock,
  RefreshCw,
  AlertTriangle,
  Loader,
  Users,
  ShoppingCart,
  Percent,
  Award,
} from 'lucide-react'
import { PageContainer } from "@/components/layout/page-container"
import './styles.css'

interface Order {
  id: number
  customerName: string
  total: number
  status: string
  timestamp: string
  items: Array<{
    name: string
    quantity: number
    price: number
    category: string
  }>
  isComplimentary: boolean
  preparationTime?: number
  queueTime: number
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF
  }
}

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'custom'

interface TrendMetrics {
  date: string
  sales: number
  orders: number
  movingAverageSales: number
  movingAverageOrders: number
  salesGrowth: number
  ordersGrowth: number
  trend: 'up' | 'down' | 'stable'
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82ca9d',
  '#ffc658'
]

const Reports: React.FC = () => {
  // State declarations
  const [orders, setOrders] = useState<Order[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'orders'>(
    'sales'
  )

  // Memoized helper functions
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const calculateMovingAverage = useCallback((data: number[], periods: number) => {
    return data.map((_, index) => {
      const start = Math.max(0, index - periods + 1)
      const values = data.slice(start, index + 1)
      return values.reduce((sum, val) => sum + val, 0) / values.length
    })
  }, [])

  // Data fetching
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const storedOrders = JSON.parse(
        localStorage.getItem('orders') || '[]'
      ) as Order[]
      setOrders(storedOrders)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch orders. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Date range handling
  const getDateRange = useCallback(() => {
    const now = new Date()
    switch (timeRange) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom':
        return {
          start: customStartDate
            ? startOfDay(customStartDate)
            : startOfDay(now),
          end: customEndDate ? endOfDay(customEndDate) : endOfDay(now)
        }
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) }
    }
  }, [timeRange, customStartDate, customEndDate])

  // Filtered data
  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange()
    return orders.filter((order) => {
      const orderDate = new Date(order.timestamp)
      return orderDate >= start && orderDate <= end
    })
  }, [orders, getDateRange])

  // Sales data calculations
  const salesData = useMemo(() => {
    const { start, end } = getDateRange()
    const days = eachDayOfInterval({ start, end })
    const data: { [key: string]: { sales: number; orders: number } } = {}

    days.forEach((day) => {
      const date = format(day, 'yyyy-MM-dd')
      data[date] = { sales: 0, orders: 0 }
    })

    filteredOrders.forEach((order) => {
      const date = format(new Date(order.timestamp), 'yyyy-MM-dd')
      if (!data[date]) {
        data[date] = { sales: 0, orders: 0 }
      }
      data[date].sales += order.isComplimentary ? 0 : order.total
      data[date].orders += 1
    })
    return Object.entries(data)
      .map(([date, values]) => ({
        date,
        sales: values.sales,
        orders: values.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredOrders, getDateRange])

  // Enhanced sales trend calculation
  const enhancedSalesTrend = useMemo((): TrendMetrics[] => {
    const baseData = salesData.map((item) => ({
      date: item.date,
      sales: item.sales,
      orders: item.orders
    }))

    const salesValues = baseData.map((item) => item.sales)
    const ordersValues = baseData.map((item) => item.orders)

    const movingAverageSales = calculateMovingAverage(salesValues, 7)
    const movingAverageOrders = calculateMovingAverage(ordersValues, 7)

    return baseData.map((item, index) => {
      const previousSales = salesValues[index - 1] || salesValues[index]
      const previousOrders = ordersValues[index - 1] || ordersValues[index]

      const salesGrowth = ((item.sales - previousSales) / previousSales) * 100
      const ordersGrowth =
        ((item.orders - previousOrders) / previousOrders) * 100

      const trend =
        salesGrowth > 1 ? 'up' : salesGrowth < -1 ? 'down' : 'stable'

      return {
        date: item.date,
        sales: item.sales,
        orders: item.orders,
        movingAverageSales: movingAverageSales[index],
        movingAverageOrders: movingAverageOrders[index],
        salesGrowth,
        ordersGrowth,
        trend
      }
    })
  }, [salesData, calculateMovingAverage])

  // Additional metrics calculations
  const totalSales = useMemo(() => {
    return filteredOrders.reduce(
      (sum, order) => sum + (order.isComplimentary ? 0 : order.total),
      0
    )
  }, [filteredOrders])

  const totalOrders = useMemo(() => filteredOrders.length, [filteredOrders])

  const averageOrderValue = useMemo(() => {
    const paidOrders = filteredOrders.filter((order) => !order.isComplimentary)
    return paidOrders.length > 0 ? totalSales / paidOrders.length : 0
  }, [filteredOrders, totalSales])

// Average preparation time calculation
const averagePreparationTime = useMemo(() => {
  const ordersWithPrepTime = filteredOrders.filter(
    (order) => order.preparationTime !== undefined
  )
  if (ordersWithPrepTime.length === 0) {
    return 0
  }
  return Math.round(
    ordersWithPrepTime.reduce(
      (sum, order) => sum + (order.preparationTime || 0),
      0
    ) / ordersWithPrepTime.length
  )
}, [filteredOrders])

// Sales by category calculation
const salesByCategory = useMemo(() => {
  const categorySales: { [key: string]: number } = {}
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      categorySales[item.category] =
        (categorySales[item.category] || 0) + item.price * item.quantity
    })
  })
  return Object.entries(categorySales).map(([name, value]) => ({
    name,
    value
  }))
}, [filteredOrders])

// Top selling items calculation
const topSellingItems = useMemo(() => {
  const itemCounts: { [key: string]: { quantity: number; revenue: number } } =
    {}
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { quantity: 0, revenue: 0 }
      }
      itemCounts[item.name].quantity += item.quantity
      itemCounts[item.name].revenue += item.price * item.quantity
    })
  })
  return Object.entries(itemCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
}, [filteredOrders])

// Orders by hour calculation
const ordersByHour = useMemo(() => {
  const hourlyOrders: { [key: number]: number } = {}
  filteredOrders.forEach((order) => {
    const hour = new Date(order.timestamp).getHours()
    hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1
  })
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orders: hourlyOrders[i] || 0
  }))
}, [filteredOrders])

// Preparation time vs order value calculation
const preparationTimeVsOrderValue = useMemo(() => {
  return filteredOrders
    .filter((order) => order.preparationTime !== undefined)
    .map((order) => ({
      preparationTime: order.preparationTime || 0,
      orderValue: order.total
    }))
}, [filteredOrders])

// Customer metrics calculations
const uniqueCustomers = useMemo(() => {
  return new Set(filteredOrders.map((order) => order.customerName)).size
}, [filteredOrders])

const repeatCustomerRate = useMemo(() => {
  const customerOrderCounts = filteredOrders.reduce((acc, order) => {
    acc[order.customerName] = (acc[order.customerName] || 0) + 1
    return acc
  }, {} as { [key: string]: number })
  const repeatCustomers = Object.values(customerOrderCounts).filter(
    (count) => count > 1
  ).length
  return uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0
}, [filteredOrders, uniqueCustomers])

// Average items per order calculation
const averageItemsPerOrder = useMemo(() => {
  const totalItems = filteredOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  )
  return totalOrders > 0 ? totalItems / totalOrders : 0
}, [filteredOrders, totalOrders])

// Sales trend calculation
const salesTrend = useMemo(() => {
  const { start, end } = getDateRange()
  const days = eachDayOfInterval({ start, end })
  const salesByDay: { [key: string]: number } = {}

  days.forEach((day) => {
    const date = format(day, 'yyyy-MM-dd')
    salesByDay[date] = 0
  })

  filteredOrders.forEach((order) => {
    const date = format(new Date(order.timestamp), 'yyyy-MM-dd')
    salesByDay[date] += order.isComplimentary ? 0 : order.total
  })

  return Object.entries(salesByDay)
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => a.date.localeCompare(b.date))
}, [filteredOrders, getDateRange])

// Customer retention rate calculation
const customerRetentionRate = useMemo(() => {
  const { start } = getDateRange()
  const previousPeriodStart = subDays(
    start,
    getDateRange().end.getTime() - start.getTime()
  )

  const currentCustomers = new Set(
    filteredOrders.map((order) => order.customerName)
  )
  const previousCustomers = new Set(
    orders
      .filter((order) => {
        const orderDate = new Date(order.timestamp)
        return orderDate >= previousPeriodStart && orderDate < start
      })
      .map((order) => order.customerName)
  )

  const retainedCustomers = [...currentCustomers].filter((customer) =>
    previousCustomers.has(customer)
  ).length
  return previousCustomers.size > 0
    ? (retainedCustomers / previousCustomers.size) * 100
    : 0
}, [filteredOrders, orders, getDateRange])

// Peak hour sales calculation
const peakHourSales = useMemo(() => {
  const hourlyData = filteredOrders.reduce((acc, order) => {
    const hour = new Date(order.timestamp).getHours()
    acc[hour] = (acc[hour] || 0) + (order.isComplimentary ? 0 : order.total)
    return acc
  }, {} as { [key: number]: number })

  if (Object.keys(hourlyData).length === 0) {
    return { hour: 'N/A', sales: 0 }
  }

  const peakHour = Object.entries(hourlyData).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )
  return { hour: peakHour[0], sales: peakHour[1] }
}, [filteredOrders])

// Sales growth rate calculation
const salesGrowthRate = useMemo(() => {
  const { start, end } = getDateRange()
  const periodLength = end.getTime() - start.getTime()
  const previousPeriodStart = new Date(start.getTime() - periodLength)

  const currentPeriodSales = filteredOrders.reduce(
    (sum, order) => sum + (order.isComplimentary ? 0 : order.total),
    0
  )
  const previousPeriodSales = orders
    .filter((order) => {
      const orderDate = new Date(order.timestamp)
      return orderDate >= previousPeriodStart && orderDate < start
    })
    .reduce(
      (sum, order) => sum + (order.isComplimentary ? 0 : order.total),
      0
    )

  return previousPeriodSales !== 0
    ? ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100
    : 100
}, [filteredOrders, orders, getDateRange])

// Category performance calculation
const categoryPerformance = useMemo(() => {
  const categoryData: { [key: string]: { sales: number; orders: number } } =
    {}
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = { sales: 0, orders: 0 }
      }
      categoryData[item.category].sales += item.price * item.quantity
      categoryData[item.category].orders += item.quantity
    })
  })
  return Object.entries(categoryData).map(([category, data]) => ({
    category,
    sales: data.sales,
    orders: data.orders
  }))
}, [filteredOrders])

// Daily sales and orders calculation
const dailySalesAndOrders = useMemo(() => {
  const { start, end } = getDateRange()
  const days = eachDayOfInterval({ start, end })
  const dailyData: {
    [key: string]: { date: string; sales: number; orders: number }
  } = {}

  days.forEach((day) => {
    const date = format(day, 'yyyy-MM-dd')
    dailyData[date] = { date, sales: 0, orders: 0 }
  })

  filteredOrders.forEach((order) => {
    const date = format(new Date(order.timestamp), 'yyyy-MM-dd')
    dailyData[date].sales += order.isComplimentary ? 0 : order.total
    dailyData[date].orders += 1
  })

  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
}, [filteredOrders, getDateRange])

// CSV generation
const generateCSV = useCallback(() => {
  import('jspdf').then((module) => {
    const { jsPDF } = module
    const doc = new jsPDF()
    doc.autoTable({
      head: [['Date', 'Sales', 'Orders']],
      body: dailySalesAndOrders.map((data) => [
        data.date,
        data.sales.toFixed(2),
        data.orders
      ])
    })
    doc.save('sales-report.pdf')
  })
}, [
  dailySalesAndOrders,
  filteredOrders,
  totalSales,
  totalOrders,
  averageOrderValue,
  uniqueCustomers,
  customerRetentionRate,
  averagePreparationTime,
  repeatCustomerRate,
  salesGrowthRate,
  topSellingItems,
  salesByCategory,
  getDateRange,
  formatTime
])

// Loading state
if (isLoading) {
  return (
    <div className="loading-container">
      <Loader size={48} className="spin" />
      <p>Loading report data...</p>
    </div>
  )
}

// Error state
if (error) {
  return (
    <div className="error-container">
      <AlertTriangle size={48} />
      <p>{error}</p>
      <button onClick={fetchOrders} className="retry-button">
        <RefreshCw size={16} /> Retry
      </button>
    </div>
  )
}

return (
  <PageContainer>
    <div className="reports-container">
      <h1 className="page-title">Sales Reports</h1>

      <div className="controls">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="time-range-select"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        {timeRange === 'custom' && (
          <div className="custom-date-range">
            <DatePicker
              selected={customStartDate}
              onChange={(date) => setCustomStartDate(date)}
              selectsStart
              startDate={customStartDate as Date | undefined}
              endDate={customEndDate as Date | undefined}
              maxDate={new Date()}
              placeholderText="Start Date"
              className="custom-date-input"
            />
            <DatePicker
              selected={customEndDate}
              onChange={(date) => setCustomEndDate(date)}
              selectsEnd
              startDate={customStartDate as Date | undefined}
              endDate={customEndDate as Date | undefined}
              minDate={customStartDate as Date | undefined}
              maxDate={new Date()}
              placeholderText="End Date"
              className="custom-date-input"
            />
          </div>
        )}
        <button onClick={fetchOrders} className="refresh-button">
          <RefreshCw size={16} /> Refresh Data
        </button>
        <button onClick={generateCSV} className="download-button">
          <Download size={16} /> Download Report
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Sales</h3>
            <p className="metric-value">${totalSales.toFixed(2)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Coffee size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{totalOrders}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Average Order Value</h3>
            <p className="metric-value">${averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>Avg Preparation Time</h3>
            <p className="metric-value">{formatTime(averagePreparationTime)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <h3>Unique Customers</h3>
            <p className="metric-value">{uniqueCustomers}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Percent size={24} />
          </div>
          <div className="metric-content">
            <h3>Repeat Customer Rate</h3>
            <p className="metric-value">{repeatCustomerRate.toFixed(2)}%</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="metric-content">
            <h3>Avg Items Per Order</h3>
            <p className="metric-value">{averageItemsPerOrder.toFixed(2)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Award size={24} />
          </div>
          <div className="metric-content">
            <h3>Peak Hour Sales</h3>
            <p className="metric-value">
              Hour {peakHourSales.hour}, ${peakHourSales.sales.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card advanced">
          <h3>Sales and Orders Trend Analysis</h3>
          <div className="chart-controls">
            <button
              onClick={() => setSelectedMetric('sales')}
              className={`chart-control-button ${
                selectedMetric === 'sales' ? 'active' : ''
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setSelectedMetric('orders')}
              className={`chart-control-button ${
                selectedMetric === 'orders' ? 'active' : ''
              }`}
            >
              Orders
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={enhancedSalesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (typeof name === 'string' && name.includes('Growth')) {
                    return [`${Number(value).toFixed(2)}%`, name]
                  }
                  return [value, name]
                }}
              />
              <Legend />
              {selectedMetric === 'sales' ? (
                <>
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    fill="#8884d8"
                    name="Sales"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="movingAverageSales"
                    stroke="#82ca9d"
                    name="7-day Moving Average"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="salesGrowth"
                    stroke="#ff7300"
                    name="Growth Rate %"
                  />
                </>
              ) : (
                <>
                  <Bar
                    yAxisId="left"
                    dataKey="orders"
                    fill="#82ca9d"
                    name="Orders"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="movingAverageOrders"
                    stroke="#8884d8"
                    name="7-day Moving Average"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ordersGrowth"
                    stroke="#ff7300"
                    name="Growth Rate %"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="trend-indicators">
            <div className="trend-summary">
              <h4>Trend Analysis</h4>
              <p>
                7-day Moving Average:{' '}
                {selectedMetric === 'sales'
                  ? `$${enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.movingAverageSales.toFixed(2)}`
                  : enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.movingAverageOrders.toFixed(1)}
              </p>
              <p>
                Growth Rate:{' '}
                {selectedMetric === 'sales'
                  ? `${enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.salesGrowth.toFixed(2)}%`
                  : `${enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.ordersGrowth.toFixed(2)}%`}
              </p>
            </div>
          </div>
        </div>
        <div className="chart-card">
            <h3>Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Top Selling Items</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" name="Quantity" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Orders by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Preparation Time vs Order Value</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="preparationTime"
                  name="Preparation Time"
                  tickFormatter={(value) => formatTime(value)}
                />
                <YAxis
                  type="number"
                  dataKey="orderValue"
                  name="Order Value"
                  unit="$"
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'preparationTime') {
                      return [formatTime(value as number), name]
                    }
                    return [value, name]
                  }}
                />
                <Scatter
                  name="Orders"
                  data={preparationTimeVsOrderValue}
                  fill="#8884d8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={categoryPerformance}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar
                  name="Sales"
                  dataKey="sales"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Orders"
                  dataKey="orders"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Daily Sales and Orders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailySalesAndOrders}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="date" scale="band" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  barSize={20}
                  fill="#413ea0"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sales"
                  stroke="#ff7300"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Reports