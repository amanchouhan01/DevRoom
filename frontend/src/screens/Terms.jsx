import { useNavigate } from 'react-router-dom'

const Terms = () => {
    const navigate = useNavigate()



    return (
        <main className='min-h-screen bg-slate-900 text-white px-6 md:px-10 py-16'>
            <div className='max-w-3xl mx-auto'>
                <button onClick={() => navigate(-1)} className='text-sm text-slate-400 hover:text-white mb-8 flex items-center gap-2'>
                    <i className='ri-arrow-left-line'></i> Back
                </button>

                <h1 className='text-3xl md:text-4xl font-bold mb-2'>Terms of Service</h1>
                <p className='text-sm text-slate-500 mb-10'>Last updated: June 13, 2026</p>

                <div className='space-y-8 text-sm text-slate-400 leading-relaxed'>
                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>1. Acceptance of Terms</h2>
                        <p>By accessing or using DevRoom, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>2. Use of the Platform</h2>
                        <p>DevRoom provides a collaborative coding environment with AI assistance powered by Google Gemini. You agree to use the platform only for lawful purposes and not to misuse, disrupt, or attempt unauthorized access to any part of the service.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>3. Account Responsibility</h2>
                        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>4. Content & Projects</h2>
                        <p>You retain ownership of code and content you create on DevRoom. By using collaboration features, you grant collaborators you invite the ability to view and edit your project content.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>5. AI-Generated Content</h2>
                        <p>AI responses are generated automatically and may contain errors. DevRoom does not guarantee the accuracy, security, or fitness of AI-generated code for any particular purpose. Review all AI suggestions before use.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>6. Service Availability</h2>
                        <p>DevRoom is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation of the platform.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>7. Termination</h2>
                        <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior toward the platform or other users.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>8. Changes to Terms</h2>
                        <p>We may update these Terms from time to time. Continued use of DevRoom after changes constitutes acceptance of the revised terms.</p>
                    </section>

                    <section>
                        <h2 className='text-lg font-semibold text-white mb-2'>9. Contact</h2>
                        <p>For questions about these Terms, contact us at <a href="mailto:support@devroom.sbs" className='text-blue-400 hover:underline'>support@devroom.sbs</a>.</p>
                    </section>
                </div>
            </div>
        </main>
    )
}

export default Terms