import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"
import type { User } from "./database"
import { sql } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(username: string, email: string, password: string): Promise<User> {
  const passwordHash = await hashPassword(password)

  const [user] = await sql`
    INSERT INTO users (username, email, password_hash, display_name)
    VALUES (${username}, ${email}, ${passwordHash}, ${username})
    RETURNING id, username, email, display_name, avatar_url, bio, created_at
  `

  return user as User
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const [user] = await sql`
    SELECT * FROM users WHERE email = ${email}
  `

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    bio: user.bio,
    created_at: user.created_at,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await sql`
    SELECT id, username, email, display_name, avatar_url, bio, created_at
    FROM users WHERE id = ${id}
  `

  return (user as User) || null
}

export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  return getUserById(decoded.userId)
}