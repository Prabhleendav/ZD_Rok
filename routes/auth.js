// const router = require("express").Router()
// const bcrypt = require("bcryptjs")
// const jwt = require("jsonwebtoken")
// const { celebrate } = require("celebrate")

// const User = require("../models/User.model")
// const { auth: authSchema } = require("../models/schema")

// router.post("/register", 
// 	celebrate({body: authSchema.register}), 
// 	async (req, res) => {
// 	const { fullname, email, password } = req.body

// 	try {
// 		const passwordHash = await bcrypt.hash(password, 10)
// 		await User.create({ 
// 			fullname, 
// 			email, 
// 			password: passwordHash 
// 		})
// 		res.status(201).json(authResponse.userCreated)

// 	} catch (err) {
// 		console.error(err)
// 		res.status(500).json(authResponse.unexpectedError)
// 	}
// })

// router.post("/login", 
// 	celebrate({ body: authSchema.login }), 
// 	async (req, res) => {
// 	const { email, password } = req.body

// 	const user = await User.findOne({ email })
// 	if (!user) {
// 		return res.status(401).json(authResponse.loginFailed)
// 	}

// 	const isValidLogin = await bcrypt.compare(password, user.password)
// 	if (isValidLogin) {
// 		const jwtToken = jwt.sign(
// 			{
// 				uid: user._id,
// 				isAdmin: user.isAdmin,
// 			}, 
// 			process.env.JWT_SECRET,
// 			{expiresIn: "3d"},
// 		)

// 		return res.json({ 
// 			...authResponse.loginSuccess,
// 			accessToken: jwtToken,
// 		})
// 	} else {
// 		return res.status(401).json(authResponse.loginFailed)
// 	}
// })

// const authResponse = {
// 	userCreated: { 
// 		status: "ok",
// 		message: "user created",
// 	},
// 	loginSuccess: {
// 		status: "ok",
// 		message: "login successful",
// 	},
// 	loginFailed: {
// 		status: "error",
// 		message: "incorrect email or password",
// 	},
// 	unexpectedError: {
// 		status: "error",
// 		message: "an unexpected error occurred",
// 	},
// }

// module.exports = router


const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { celebrate } = require("celebrate")

const User = require("../models/User.model")
const { auth: authSchema } = require("../models/schema")

/* ======================================================
   REGISTER
====================================================== */
router.post(
  "/register",
  celebrate({ body: authSchema.register }),
  async (req, res) => {
    try {
      const { fullname, email, password, isAdmin } = req.body

      // check if user already exists
      const existingUser = await User.findOne({ email }).lean()

      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "email already registered",
        })
      }

      // hash password
      const passwordHash = await bcrypt.hash(password, 8)

      // create user
      await User.create({
        fullname,
        email,
        password: passwordHash,
        isAdmin: isAdmin || false
      })

      return res.status(201).json({
        status: "ok",
        message: "user created",
      })

    } catch (err) {
      console.error("REGISTER ERROR:", err)
      return res.status(500).json({
        status: "error",
        message: "an unexpected error occurred",
      })
    }
  }
)

/* ======================================================
   LOGIN
====================================================== */
router.post(
  "/login",
  celebrate({ body: authSchema.login }),
  async (req, res) => {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email }).select("+password").lean()

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "incorrect email or password",
        })
      }

      const isValid = await bcrypt.compare(password, user.password)

      if (!isValid) {
        return res.status(401).json({
          status: "error",
          message: "incorrect email or password",
        })
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET missing in .env")
      }

      const token = jwt.sign(
        {
          uid: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      )

      return res.json({
        status: "ok",
        message: "login successful",
        accessToken: token,
      })

    } catch (err) {
      console.error("LOGIN ERROR:", err)
      return res.status(500).json({
        status: "error",
        message: "an unexpected error occurred",
      })
    }
  }
)

module.exports = router