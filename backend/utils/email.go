package utils

import (
	"fmt"
	"net/smtp"
)

func SendOTPEmail(toEmail string, otp string) error {
	// ⚠️ แก้ไขข้อมูลตรงนี้
	from := "nutpintopro@gmail.com"   // ใส่ Gmail ของนาย
	password := "uxio upcy qprf yrwu" // รหัส App Password 16 หลักที่นายเพิ่งได้มา

	smtpHost := "smtp.gmail.com"
	smtpPort := "587" // ✅ แก้จาก 5876 เป็น 587 (พอร์ตมาตรฐาน SMTP)

	subject := "Subject: PortHub Verification Code\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body := fmt.Sprintf(`
        <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1d7cf2; text-align: center;">PortHub</h2>
            <p>Your verification code is:</p>
            <div style="background: #f1f7ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 8px;">
                %s
            </div>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">This code will expire in 5 minutes.</p>
        </div>
    `, otp)

	message := []byte(subject + mime + body)
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// สั่งส่งเมล
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
	if err != nil {
		return err
	}
	return nil
}
