import { Metadata } from "next";
import { ContactForm } from "@/components/contacts/contact-form";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "New Contact | CRM",
  description: "Create a new contact in your CRM",
};

export default function NewContactPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <ContactForm />
      </div>
    </PageContainer>
  );
}
