import { Check, Coffee, LineChart, Users, Star, Clock } from "lucide-react"

const features = [
  {
    name: "Customer Management",
    description: "Keep track of customer preferences, orders, and loyalty points all in one place.",
    icon: Users,
  },
  {
    name: "Order Tracking",
    description: "Monitor orders in real-time and streamline your order fulfillment process.",
    icon: Coffee,
  },
  {
    name: "Analytics & Insights",
    description: "Get detailed insights into your business performance with advanced analytics.",
    icon: LineChart,
  },
  {
    name: "Loyalty Programs",
    description: "Create and manage customer loyalty programs to increase retention.",
    icon: Star,
  },
  {
    name: "Real-time Updates",
    description: "Stay up-to-date with instant notifications and real-time data updates.",
    icon: Clock,
  },
  {
    name: "Performance Tracking",
    description: "Monitor staff performance and optimize your operations.",
    icon: Check,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Run Your Coffee Shop
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Powerful features designed specifically for coffee shop owners and managers.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative bg-background rounded-lg p-8 shadow-sm">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 text-base leading-7 text-muted-foreground">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
