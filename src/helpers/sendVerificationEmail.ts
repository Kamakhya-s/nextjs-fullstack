import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'mistry message | verification code',
            to: email,
            subject: 'Hello world',
            react: VerificationEmail({ username, otp: verifyCode })
        });

        return {
            success: true,
            message: "Verification email send successfully"
        }
    } catch (emailError) {
        console.error("error sending verification email", emailError)
        return {
            success: false,
            message: "Failed to send verification email"
        }
    }
}