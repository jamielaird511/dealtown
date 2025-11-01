import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Deal | DealTown Queenstown",
  description: "List your venue's deal or happy hour — fast, free submission.",
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}

