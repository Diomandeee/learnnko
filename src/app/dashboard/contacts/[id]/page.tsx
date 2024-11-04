import { ContactDetails } from "@/components/contacts/contact-details";
import { getContactById } from "@/lib/contacts";
import { notFound } from "next/navigation";


// @ts-expect-error - Page props typing conflict with Next.js types
export default async function ContactPage(props: Props) {
  const contact = await getContactById(props.params.id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ContactDetails initialData={contact} />
    </div>
  );
}