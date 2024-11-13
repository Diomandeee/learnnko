const siteConfig = {
  name: "BUF BARISTA CRM",
  baseUrl: process.env.NODE_ENV === "production" 
    ? "https://bufbarista-crm.vercel.app"
    : "http://localhost:3000",
} as const

export default siteConfig
