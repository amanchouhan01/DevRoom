import { useNavigate } from 'react-router-dom'

const Privacy = () => {
    const navigate = useNavigate()


    return (
        <main className='min-h-screen bg-slate-900 text-white px-6 md:px-10 py-16'>
            <div className='max-w-3xl mx-auto'>
                <button onClick={() => navigate(-1)} className='text-sm text-slate-400 hover:text-white mb-8 flex items-center gap-2'>
                    <i className='ri-arrow-left-line'></i> Back
                </button>

                <h1 className='text-3xl md:text-4xl font-bold mb-2'>Privacy Policy</h1>
                <p className='text-sm text-slate-500 mb-10'>Last updated: June 13, 2026</p>

                <div className='space-y-8 text-sm text-slate-400 leading-relaxed'>
                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>1. Information We Collect</h2>
                        <p>We collect information you provide directly, such as your name and email address during registration, and content you create within projects (code, chat messages, file trees).</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>2. How We Use Your Information</h2>
                        <p>We use your information to provide and improve DevRoom's services, authenticate your account via OTP, enable collaboration features, and communicate updates if you subscribe to our newsletter.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>3. AI Processing</h2>
                        <p>When you interact with the AI assistant (Gemini), your messages and relevant project context may be sent to Google's Gemini API to generate responses. Please avoid sharing sensitive personal information in AI chats.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>4. Data Storage</h2>
                        <p>Your account information and project data are stored securely in our database (MongoDB). We take reasonable measures to protect your data from unauthorized access.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>5. Cookies & Sessions</h2>
                        <p>We use cookies and local storage to maintain your login session. These are essential for the platform to function and are not used for advertising purposes.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>6. Third-Party Services</h2>
                        <p>DevRoom uses third-party services including Google Gemini (AI), Resend (email delivery), and WebContainers (in-browser code execution). These services have their own privacy policies governing data they process.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>7. Data Sharing</h2>
                        <p>We do not sell your personal data. Project data is only shared with collaborators you explicitly invite to your projects.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>8. Newsletter</h2>
                        <p>If you subscribe to our newsletter, your email is stored solely for sending updates. You can unsubscribe at any time.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>9. Your Rights</h2>
                        <p>You may request access to, correction of, or deletion of your personal data by contacting us at <a href="mailto:support@devroom.sbs" className='text-blue-400 hover:underline'>support@devroom.sbs</a>.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>10. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy periodically. Significant changes will be communicated via the platform or email.</p>
                    </section>
                </div>
            </div>
        </main>
    )
}

export default Privacy