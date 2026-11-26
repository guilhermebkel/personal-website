export type ContactName = "whatsapp" | "linkedin" | "mail" | "github";

export type Contact = {
  name: ContactName;
  label: string;
  href: string;
};

export class ContactUtil {
  static readonly ALL: Contact[] = [
    { name: "whatsapp", label: "WhatsApp", href: "https://whatsapp.guilherr.me" },
    { name: "linkedin", label: "LinkedIn", href: "https://linkedin.guilherr.me" },
    { name: "mail", label: "Email", href: "https://email.guilherr.me" },
    { name: "github", label: "GitHub", href: "https://github.guilherr.me" },
  ];
}
