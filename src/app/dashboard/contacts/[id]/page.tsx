import { ContactDetails } from "@/components/contacts/contact-details";
import { getContactById } from "@/lib/contacts";
import { notFound } from "next/navigation";

export default async function ContactPage({ params }: { params: { id: string } }) {
  const contact = await getContactById(params.id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ContactDetails initialData={contact} />
    </div>
  );
}
