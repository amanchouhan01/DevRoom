import express from 'express'
import Subscriber from '../models/subscriber.model.js'
import { Resend } from 'resend'

const router = express.Router()

const resend = new Resend(process.env.RESEND_API_KEY)

// Subscribe
router.post('/subscribe', async (req, res) => {
    const { email } = req.body

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email required' })
    }

    try {
        await Subscriber.create({ email })

        // Optional: welcome email
        await resend.emails.send({
            from: 'DevRoom <updates@devroom.sbs>',
            to: email,
            subject: 'Welcome to DevRoom updates!',
            html: `<p>Thanks for subscribing! You'll now get the latest updates and features straight to your inbox.</p>`
        })

        res.json({ message: 'Subscribed successfully!' })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You are already subscribed' })
        }
        console.error(err)
        res.status(500).json({ message: 'Something went wrong' })
    }
})

// Broadcast (admin use - jab feature update kare)
router.post('/broadcast', async (req, res) => {
    const { subject, html } = req.body

    if (!subject || !html) {
        return res.status(400).json({ message: 'Subject and content required' })
    }

    try {
        const subscribers = await Subscriber.find()

        for (const sub of subscribers) {
            await resend.emails.send({
                from: 'DevRoom <updates@devroom.sbs>',
                to: sub.email,
                subject,
                html
            })
        }

        res.json({ message: `Sent to ${subscribers.length} subscribers` })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to send broadcast' })
    }
})

export default router