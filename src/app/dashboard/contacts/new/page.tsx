import { Metadata } from "next";
import { ContactForm } from "@/components/contacts/contact-form";

export const metadata: Metadata = {
  title: "New Contact | CRM",
  description: "Create a new contact in your CRM",
};

export default function NewContactPage() {
  return <ContactForm />;
}
