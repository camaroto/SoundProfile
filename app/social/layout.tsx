import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social | SoundProfile",
  robots: { index: false, follow: false },
};

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
