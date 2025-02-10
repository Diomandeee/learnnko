import Link from "next/link"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { Pricing } from "@/components/landing/pricing"
import { Testimonials } from "@/components/landing/testimonials"
import { Button } from "@/components/ui/button"
import { Coffee } from "lucide-react"

export default function LandingPage() {
  return (
    <>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold">Milk Man CRM</span>
            </Link>
          </div>
          {/* <nav className="hidden gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
          </nav> */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            {/* <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link> */}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* <Hero /> */}

        {/* Features Section */}
        {/* <Features /> */}

        {/* Testimonials Section */}
        {/* <Testimonials /> */}

        {/* Pricing Section */}
        {/* <Pricing /> */}

        {/* CTA Section */}
        {/* <section className="border-t bg-muted/50">
          <div className="container py-20 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to transform your coffee shop?</h2>
            <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground">
              Join thousands of coffee shops already using our platform to grow their business.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/register">
                <Button size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section> */}
      </main>

      {/* Footer */}
      {/* <footer className="border-t py-12">
        <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6" />
              <span className="text-lg font-bold">Milk Man</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Making coffee shop management easier and more efficient.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">About</Link></li>
              <li><Link href="#" className="hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms</Link></li>
              <li><Link href="#" className="hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Milk Man. All rights reserved.
          </p>
        </div>
      </footer> */}
    </>
  )
}
