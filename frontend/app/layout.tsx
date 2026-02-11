import type { Metadata } from "next";
import { Inter } from "next/font/google"; // นำเข้าฟอนต์ Inter จาก Google Fonts
import "./globals.css";

// ตั้งค่าฟอนต์ Inter
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", // สร้างตัวแปร CSS ไว้เผื่อเรียกใช้
});

export const metadata: Metadata = {
  title: "PortHub | Your Professional Hub",
  description: "The ultimate professional portfolio hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 1. เพิ่ม className ของ inter เพื่อให้ฟอนต์ทั้งเว็บเปลี่ยนเป็น Inter 
        2. ลบ bg-slate-100 ออก เพราะเราใช้ bg-[#f1f7ff] ในแต่ละหน้าแล้ว 
        3. เพิ่ม antialiased เพื่อให้ตัวอักษรดูคมชัดและเนียนตาขึ้น
      */}
      <body className={`${inter.className} antialiased text-black`}>
        {children}
      </body>
    </html>
  );
}