import { Router } from 'express'
import { UserService } from '../services/UserService.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserRole } from '@shared/healthcare-types'
import passport from 'passport'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { nationalId, password } = req.body

    if (!nationalId || !password) {
      return res.status(400).json({ error: 'National ID and password are required' })
    }

    const userService = new UserService()
    const user = await userService.validateCredentials(nationalId, password)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    res.json({
      token,
      user: {
        _id: user._id,
        nationalId: user.nationalId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const {
      nationalId,
      email,
      phone,
      firstName,
      lastName,
      password,
      address,
      dateOfBirth,
      gender,
      emergencyContact,
      insuranceInfo,
    } = req.body;

    const role = UserRole.PATIENT; // Force patient role for public registration

    console.log('Registration request received (PII redacted)')

    // Validate required fields
    if (!nationalId || !email || !phone || !firstName || !lastName || !password || !address) {
      return res.status(400).json({
        error: 'Missing required fields: nationalId, email, phone, firstName, lastName, password, address',
      })
    }

    const userService = new UserService()

    // Check if user already exists
    const existingByNationalId = await userService.findByNationalId(nationalId)
    if (existingByNationalId) {
      return res.status(400).json({ error: 'User with this National ID already exists' })
    }

    const existingByEmail = await userService.findByEmail(email)
    if (existingByEmail) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Create base user data - use simple User model without discriminators for now
    const userData: any = {
      nationalId,
      email,
      phone,
      firstName,
      lastName,
      passwordHash: await bcrypt.hash(password, 12),
      address,
      role,
      status: 'active',
    }

    // For now, store role-specific data in the base user model
    // We can refactor to use discriminators later
    if (role === UserRole.PATIENT) {
      if (!dateOfBirth || !gender || !emergencyContact) {
        return res.status(400).json({
          error: 'Patient registration requires dateOfBirth, gender, and emergencyContact',
        })
      }
      userData.dateOfBirth = new Date(dateOfBirth);
      userData.gender = gender;
      userData.emergencyContact = emergencyContact;
      userData.insuranceInfo = insuranceInfo || "";
    }

    console.log('Creating user (data redacted)')

    const user = await userService.create(userData)

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' })

    console.log('User created successfully:', user._id)

    // Create response with user data (including role-specific fields)
    const userResponse: any = {
      _id: user._id,
      nationalId: user.nationalId,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      address: user.address,
    }

    // Add role-specific fields to response
    if (role === UserRole.PATIENT) {
      userResponse.dateOfBirth = (user as any).dateOfBirth;
      userResponse.gender = (user as any).gender;
    }

    res.status(201).json({
      token,
      user: userResponse,
    })
  } catch (error: any) {
    console.error('Registration error details:', error)
    res.status(500).json({
      error: 'Registration failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

// Initiate Google OAuth Flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user: any = req.user
    
    // If user is inactive (missing profile data like nationalId), issue temporary token
    if (user.status === 'inactive') {
      const tempToken = jwt.sign(
        { id: user._id, role: user.role, status: 'inactive' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )
      
      // Redirect to frontend complete-profile page with temp token
      return res.redirect(`${process.env.FRONTEND_URL}/complete-profile?token=${tempToken}`)
    }

    // Fully registered user
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    
    // Redirect to frontend dashboard with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`)
  }
)

// Complete Profile for OAuth users
router.post('/complete-profile', async (req, res) => {
  try {
    // In a real implementation, we would extract the user ID from the temp token via a middleware
    // Here we'll just take it from the body for demonstration, assuming the frontend sends it
    const { userId, nationalId, phone, address, dateOfBirth, gender, emergencyContact } = req.body

    if (!userId || !nationalId || !phone || !address || !dateOfBirth || !gender || !emergencyContact) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const userService = new UserService()
    
    const existing = await userService.findByNationalId(nationalId)
    if (existing && existing._id !== userId) {
      return res.status(400).json({ error: 'National ID is already in use by another account' })
    }

    const updatedUser = await userService.update(userId, {
      nationalId,
      phone,
      address,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      emergencyContact,
      status: 'active'
    } as any)

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const token = jwt.sign(
      { id: updatedUser._id, role: updatedUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({ token, user: updatedUser })
  } catch (error) {
    console.error('Complete profile error:', error)
    res.status(500).json({ error: 'Failed to complete profile' })
  }
})

export { router as authRoutes }
