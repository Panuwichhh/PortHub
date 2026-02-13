import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ตั้งค่าฟอนต์ Inter พร้อมรองรับ CSS Variable
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
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
      {/* 1. เพิ่ม inter.variable เพื่อให้เรียกใช้ฟอนต์ผ่าน CSS ได้เนียนขึ้น
          2. ใส่ bg-[#f1f7ff] ไว้ที่ body เลย เพื่อให้ทุกหน้ามีสีพื้นหลังเดียวกัน ไม่เกิดอาการ "จอขาวแวบ"
          3. antialiased ช่วยให้ตัวอักษรบางและคมชัดขึ้นบน MacOS/Windows
      */}
      <body className={`${inter.variable} ${inter.className} antialiased text-black bg-[#f1f7ff]`}>
        {children}
      </body>
    </html>
  );
}