export type ProjectDetail = {
  title: string;
  category: string;
  desc: string;
  img: string;
  detail?: {
    fullDescription: string;
    features: string[];
    images?: string[];
  };
};

export const mockUser = {
  name: "Cho Yi Hyun",
  role: "Senior UI/UX Designer",
  phone: "097-5XX-XXXX",
  email: "choyihyun1@gmail.com",
  university: "Stanford University",
  faculty: "Engineering",
  major: "Software Engineering",
  gpax: "4.00",
  skills: ["Wireframe", "Python", "Communication", "Research", "Planning"],
  interests: "Website Developer, Full-Stack Developer, Backend / Frontend Developer, UX/UI Designer",
  projects: [
    {
      title: "UniConnect",
      category: "Web Application",
      desc: "แอปพลิเคชันที่ออกแบบมาเพื่อสร้างชุมชนออนไลน์สำหรับนักศึกษาภายในมหาวิทยาลัย ช่วยให้การแลกเปลี่ยนความรู้เป็นเรื่องง่าย...",
      img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
      detail: {
        fullDescription: `รายละเอียดโปรเจกต์: "UniConnect" เป็นแอปพลิเคชันที่ออกแบบมาเพื่อสร้างชุมชนออนไลน์สำหรับนักศึกษาภายในมหาวิทยาลัย ช่วยให้การแลกเปลี่ยนความรู้ การถาม-ตอบ และการทำงานกลุ่มเป็นเรื่องง่าย แอปฯ นี้เกิดขึ้นจากปัญหาที่นักศึกษาหลายคนต้องหาคู่ทำงานกลุ่มหรือแหล่งติวในมหาวิทยาลัยอย่างไม่เป็นระบบ`,
        features: [
          "Community Feed: ฟีดรวมโพสต์ คำถาม และประกาศจากเพื่อนนักศึกษา",
          "Study Group Matching: ค้นหาและสร้างกลุ่มเรียนตามวิชาและความสนใจ",
          "Q&A Forum: ถาม-ตอบวิชาการและแชร์โน้ต",
          "Event & Workshop: ลงทะเบียนและรับการแจ้งเตือนกิจกรรมในมหาวิทยาลัย",
        ],
        images: [
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200",
        ],
      },
    },
    {
      title: "Leaf & Bloom",
      category: "Mobile Design",
      desc: "โมบายแอปพลิเคชันที่ช่วยให้ผู้รักการปลูกต้นไม้ในร่ม สามารถดูแลและวิเคราะห์สุขภาพต้นไม้ได้ผ่าน AI...",
      img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600",
      detail: {
        fullDescription: `รายละเอียดโปรเจกต์: "Leaf & Bloom" เป็นโมบายแอปพลิเคชันที่ออกแบบมาเพื่อช่วยให้ผู้ที่รักการปลูกต้นไม้ในร่ม (Indoor Gardeners) สามารถดูแลต้นไม้ของตนเองให้เจริญเติบโตได้ดี แอปฯ นี้เกิดขึ้นจากปัญหาที่คนส่วนใหญ่มักลืมรดนํ้าต้นไม้ หรือไม่ทราบวิธีการดูแลที่ถูกต้องสำหรับต้นไม้แต่ละชนิด`,
        features: [
          "My Jungle Dashboard: หน้าจอรวมที่แสดงสถานะสุขภาพของต้นไม้",
          "Smart Reminders: ระบบแจ้งเตือนอัตโนมัติเมื่อถึงเวลารดนํ้า ใส่ปุ๋ย",
          "Plant Care Guide Database: ฐานข้อมูลวิธีการดูแลต้นไม้ยอดนิยม",
          "Progress Journal: ฟังก์ชันถ่ายภาพเก็บพัฒนาการของต้นไม้",
        ],
        images: [
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200",
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=1200",
        ],
      },
    },
  ] as ProjectDetail[],
};
