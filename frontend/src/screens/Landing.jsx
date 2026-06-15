import { useNavigate, useLocation } from 'react-router-dom'
import { useContext, useRef, useEffect } from 'react'
import { UserContext } from '../context/user.context'

const Landing = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const featuresRef = useRef(null)
    const { user } = useContext(UserContext)


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token && user) {
            navigate('/home', { replace: true })
        }
    }, [user])

    useEffect(() => {
        if (location.state?.scrollTo) {
            const el = document.getElementById(location.state.scrollTo)
            el?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [location.state])

    const features = [
        { icon: 'ri-robot-2-line', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/40', title: 'AI-Powered Coding', desc: 'Ask Gemini to generate full file trees, write boilerplate, or debug your code — all from the chat panel.' },
        { icon: 'ri-team-line', color: 'text-green-400', bg: 'bg-green-900/30 border-green-800/40', title: 'Real-time Collaboration', desc: 'Invite teammates, edit code together, and see changes live with Socket.io-powered sync.' },
        { icon: 'ri-terminal-box-line', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800/40', title: 'In-Browser Terminal', desc: 'Run Node.js projects right in your browser with WebContainers — no setup, no installs.' },
        { icon: 'ri-folders-line', color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-800/40', title: 'Smart File Management', desc: 'Organize your project with a full file tree. Create, rename, and delete files without leaving the editor.' },
        { icon: 'ri-message-3-line', color: 'text-pink-400', bg: 'bg-pink-900/30 border-pink-800/40', title: 'Persistent Chat', desc: 'Project chat history is saved — pick up conversations where you left off, even days later.' },
        { icon: 'ri-shield-keyhole-line', color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-800/40', title: 'Secure Auth with OTP', desc: 'Email-based OTP verification keeps your account safe — no weak passwords, no breaches.' },
    ]

    const steps = [
        { number: '01', title: 'Create an account', desc: 'Sign up with your email and verify with OTP.' },
        { number: '02', title: 'Start a project', desc: 'Create a new project and invite collaborators.' },
        { number: '03', title: 'Code with AI', desc: 'Use Gemini AI to scaffold, debug, and ship faster.' },
    ]

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">

            {/* Hero */}
            <section id='home' className="px-6 md:px-16 pt-24 pb-20 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/40 border border-blue-800/50 text-blue-400 text-xs font-medium mb-8">
                    <i className="ri-sparkling-line"></i>
                    Powered by Google Gemini AI
                </div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
                    Code together,{' '}
                    <span className="text-blue-400">ship faster</span>
                    <br />with AI by your side
                </h1>
                <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                    DevRoom is a collaborative coding platform where your team and Gemini AI work in the same room — real-time editor, in-browser terminal, and persistent chat.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
                        Start for free <i className="ri-arrow-right-line"></i>
                    </button>
                    <button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-3.5 border border-slate-700 hover:border-slate-500 rounded-xl text-sm text-slate-300 hover:text-white transition cursor-pointer">
                        See features
                    </button>
                </div>
            </section>

            {/* Dashboard Preview */}
            <section className="px-6 md:px-16 pb-24">
                <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-700">
                        <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                        <div className="flex-1 mx-4 bg-slate-800 rounded-md px-3 py-1 text-xs text-slate-500 text-center">devroom.sbs</div>
                    </div>
                    <div className="p-6 bg-slate-800">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {[
                                { label: 'Total Projects', value: '6', color: 'text-blue-400' },
                                { label: 'Collaborators', value: '12', color: 'text-green-400' },
                                { label: 'AI Chats', value: '34', color: 'text-amber-400' },
                                { label: 'Last Active', value: '2h ago', color: 'text-purple-400' },
                            ].map(s => (
                                <div key={s.label} className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                                    <p className="text-xs text-slate-400 mb-2">{s.label}</p>
                                    <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Recent Projects</p>
                                {['auth-service', 'landing-page', 'api-gateway'].map((name, i) => (
                                    <div key={name} className="flex items-center gap-3 py-2 border-b border-slate-600 last:border-0">
                                        <div className="w-7 h-7 rounded bg-blue-900/50 flex items-center justify-center">
                                            <i className="ri-code-s-slash-line text-blue-400 text-xs"></i>
                                        </div>
                                        <span className="text-sm text-slate-300">{name}</span>
                                        <span className="ml-auto text-xs text-slate-500">{i + 1}h ago</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">AI Chat Preview</p>
                                <div className="space-y-2">
                                    <div className="bg-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300">@ai scaffold a REST API with Express and MongoDB</div>
                                    <div className="bg-blue-900/40 rounded-lg px-3 py-2 text-xs text-blue-300 border border-blue-800/40">✓ Generated 8 files — routes, models, controllers, middleware</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id='features-section' ref={featuresRef} className="px-6 md:px-16 py-20 border-t border-slate-800">
                <div className="max-w-5xl mx-auto">
                    <p className="text-xs text-blue-400 uppercase tracking-widest font-medium text-center mb-3">Features</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Everything your team needs</h2>
                    <p className="text-slate-400 text-center mb-14 max-w-xl mx-auto">Built for developers who move fast and collaborate closely.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {features.map(f => (
                            <div key={f.title} className={`rounded-xl p-6 border ${f.bg}`}>
                                <i className={`${f.icon} text-2xl ${f.color} block mb-4`}></i>
                                <h3 className="font-semibold mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About DevRoom */}
            <section id='about-section' className="px-6 md:px-16 py-20 border-t border-slate-800">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="text-xs text-blue-400 uppercase tracking-widest font-medium mb-3">About DevRoom</p>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Code together, ship faster</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                DevRoom is a collaborative coding platform where your team and Gemini AI work in the same room — real-time editor, in-browser terminal, and persistent chat.
                            </p>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Built with React, Node.js, Socket.io, Redis, WebContainers API, and Google Gemini — DevRoom is designed for speed, collaboration, and developer joy.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Node.js', 'Socket.io', 'Redis', 'MongoDB', 'Gemini AI', 'WebContainers'].map(tag => (
                                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { number: '01', title: 'AI Pair Programming', desc: 'Gemini reviews, writes, and debugs code with you in real time.' },
                                { number: '02', title: 'Live Collaboration', desc: 'Multiple devs, one room — see edits and chat instantly.' },
                                { number: '03', title: 'Zero Setup', desc: 'Run full Node.js projects in-browser via WebContainers.' },
                                { number: '04', title: 'Persistent History', desc: 'Files and chats are saved — pick up anytime.' },
                            ].map(s => (
                                <div key={s.number} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                    <span className="text-blue-400 font-bold text-xs">{s.number}</span>
                                    <h3 className="font-semibold text-sm mt-2 mb-1">{s.title}</h3>
                                    <p className="text-xs text-slate-400">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="px-6 md:px-16 py-20 border-t border-slate-800">

                <div className="max-w-4xl mx-auto">
                    <p className="text-xs text-blue-400 uppercase tracking-widest font-medium text-center mb-3">How it works</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Up and running in minutes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map(s => (
                            <div key={s.number} className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-blue-900/40 border border-blue-800/50 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-blue-400 font-bold text-sm">{s.number}</span>
                                </div>
                                <h3 className="font-semibold mb-2">{s.title}</h3>
                                <p className="text-sm text-slate-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 md:px-16 py-24 border-t border-slate-800">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build together?</h2>
                    <p className="text-slate-400 mb-8">Free to use. No credit card required.</p>
                    <button onClick={() => navigate('/register')} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition text-base cursor-pointer">
                        Create your account →
                    </button>
                </div>
            </section>



        </div>
    )
}

export default Landing