import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Potluck Signup",
  description: "Sign up to bring a dish",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
