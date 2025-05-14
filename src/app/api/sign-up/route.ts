import dbConnect from "@/lib/dbConnect"
import bcrypt from "bcryptjs"
import UserModel from "@/model/User"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"

export async function POST(request: Request) {
    await dbConnect()
    try {
        const { email, username, password } = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            Response.json({
                success: false,
                message: "username already exists"
            },
                {
                    status: 400
                })
        }

        const existingUserByEmail = await UserModel.findOne({ email })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                },
                    {
                        status: 400
                    })
            } else {
                const hashedpassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedpassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 360000);
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)


            const newUser = await new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })

            await newUser.save()
        }
        //send verification email
        const emailResponse = await sendVerificationEmail(
            username,
            email,
            verifyCode
        )

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            },
                {
                    status: 500
                })
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please verify your email"
        },
            {
                status: 201
            })
    } catch (error) {
        console.error("Error registering user", error);
        return Response.json({
            success: false,
            message: "Error registering user"
        },
            {
                status: 500
            })
    }
}