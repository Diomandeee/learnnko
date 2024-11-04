import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    name: "Basic",
    id: "basic",
    price: "$29",
    description: "Perfect for small coffee shops just getting started.",
    features: [
      "Up to 500 customer profiles",
      "Basic order tracking",
      "Email support",
      "Basic analytics",
      "1 staff account",
    ],
    featured: false,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$79",
    description: "Ideal for growing coffee shops with multiple staff members.",
    features: [
      "Unlimited customer profiles",
      "Advanced order tracking",
      "Priority support",
      "Advanced analytics",
      "Up to 10 staff accounts",
      "Loyalty program",
      "Custom branding",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "Custom",
    description: "For large coffee shop chains with custom requirements.",
    features: [
      "Everything in Pro",
      "Unlimited staff accounts",
      "24/7 phone support",
      "Custom integrations",
      "Dedicated account manager",
      "Custom analytics",
      "Multi-location support",
    ],
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the plan that best fits your coffee shop&apos;s needs.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "flex flex-col justify-between rounded-3xl bg-background p-8 shadow-sm ring-1 ring-muted xl:p-10",
                tier.featured && "ring-2 ring-primary"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8">{tier.name}</h3>
                  {tier.featured && (
                    <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                      Most popular
                    </p>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.id !== "enterprise" && (
                    <span className="text-sm font-semibold leading-6">/month</span>
                  )}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={tier.featured ? "default" : "outline"}
                className="mt-8"
                size="lg"
              >
                {tier.id === "enterprise" ? "Contact sales" : "Get started"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
