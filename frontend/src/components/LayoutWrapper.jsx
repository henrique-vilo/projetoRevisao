"use client";

import { usePathname } from "next/navigation";

import Footer from "./Footer";
import Header from "@/components/Header";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");


  if (isAdminRoute) {
    return children;
  }

  return (
    <>
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}