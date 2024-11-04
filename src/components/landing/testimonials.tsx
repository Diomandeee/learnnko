import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Owner, The Daily Grind",
    content: "This CRM has transformed how we manage our coffee shop. The customer tracking and loyalty features are invaluable.",
    image: "/avatars/sarah.jpg",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Manager, Coffee Haven",
    content: "The analytics tools have helped us make better business decisions. Our customer satisfaction has improved significantly.",
    image: "/avatars/mike.jpg",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Owner, The Coffee Corner",
    content: "Easy to use and fantastic customer support. It's exactly what our growing coffee shop needed.",
    image: "/avatars/emily.jpg",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by Coffee Shop Owners
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Hear what our customers have to say about their experience.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-2xl bg-background p-8 shadow-sm"
            >
              <div>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-6 text-base leading-7">{testimonial.content}</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-semibold leading-7">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
