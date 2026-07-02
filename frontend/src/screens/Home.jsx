import { useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { UserContext } from '../context/user.context'
import axios from '../config/axios.js'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { NotificationContext } from '../context/notification.context'

const Home = () => {
  const { user } = useContext(UserContext)
  const { pendingInvites, respondInvite } = useContext(NotificationContext)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [project, setProject] = useState([])
  const [aiQueriesToday, setAiQueriesToday] = useState(0)

  const navigate = useNavigate()

  const projectsRef = useRef(null)
  const featuresRef = useRef(null)
  const aboutRef = useRef(null)



  const respondToInvite = (projectId, action) => {
    respondInvite(projectId, action)
      .then(() => {
        if (action === 'accept') {
          toast.success('Invite accepted!')
          axios.get('/projects/all').then(res => setProject(res.data.projects)).catch(() => { })
        } else {
          toast.info('Invite declined')
        }
      })
      .catch(err => showApiError(err, 'Failed to respond to invite'))
  }

  // expose refs to window so Navbar can scroll to them
  useEffect(() => {
    window.__homeRefs = { projectsRef, featuresRef, aboutRef }
    return () => { window.__homeRefs = null }
  }, [])

  function showApiError(err, fallback = "Something went wrong") {

    if (err.code === 'ERR_NETWORK' || !navigator.onLine) return

    const data = err.response?.data
    if (data?.errors?.length) data.errors.forEach((er) => toast.error(er.msg))
    else toast.error(data?.message || fallback)
  }

  const now = useMemo(() => Date.now(), [])

  const timeAgo = useCallback((dateString) => {
    if (!dateString) return '—'
    const diff = now - new Date(dateString).getTime()
    if (isNaN(diff)) return '—'
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }, [now])

  const todayString = useMemo(() => new Date(now).toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }), [now])

  const totalCollaborators = useMemo(() => project.reduce((sum, p) => sum + (p.users?.length || 0), 0), [project])

  const lastActiveProject = useMemo(() => project.length > 0
    ? project.reduce((latest, p) => new Date(p.updatedAt) > new Date(latest.updatedAt) ? p : latest)
    : null, [project])


  useEffect(() => {
    axios.get('/projects/ai-queries-today')
      .then(res => setAiQueriesToday(res.data.count))
      .catch(err => showApiError(err, 'Failed to load AI stats'))
  }, [])

  const stats = useMemo(() => [
    { label: 'Total Projects', value: project.length, sub: 'all time', icon: 'ri-folder-line', bg: 'bg-blue-900/40', iconColor: 'text-blue-400', border: 'border-blue-800/30' },
    { label: 'Collaborators', value: totalCollaborators, sub: 'across all projects', icon: 'ri-team-line', bg: 'bg-green-900/40', iconColor: 'text-green-400', border: 'border-green-800/30' },
    { label: 'AI Chats', value: aiQueriesToday, sub: 'Gemini queries today', icon: 'ri-robot-line', bg: 'bg-amber-900/40', iconColor: 'text-amber-400', border: 'border-amber-800/30' },
    {
      label: 'Last Active',
      value: lastActiveProject ? timeAgo(lastActiveProject.updatedAt) : '—',
      sub: lastActiveProject ? `in "${lastActiveProject.name}"` : 'no projects yet',
      icon: 'ri-time-line', bg: 'bg-purple-900/40', iconColor: 'text-purple-400', border: 'border-purple-800/30'
    },
  ], [project, lastActiveProject, totalCollaborators])

  const activityColors = ['blue', 'green', 'amber', 'purple']

  const features = [
    { icon: 'ri-robot-2-line', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/40', title: 'AI-Powered Coding', desc: 'Ask Gemini to generate full file trees, write boilerplate, or debug — all from the chat panel.' },
    { icon: 'ri-team-line', color: 'text-green-400', bg: 'bg-green-900/30 border-green-800/40', title: 'Real-time Collaboration', desc: 'Invite teammates, edit code together, and see changes live with Socket.io-powered sync.' },
    { icon: 'ri-terminal-box-line', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800/40', title: 'In-Browser Terminal', desc: 'Run Node.js projects right in your browser with WebContainers — no setup, no installs.' },
    { icon: 'ri-folders-line', color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-800/40', title: 'Smart File Management', desc: 'Full file tree editor — create, rename, and delete files without leaving the browser.' },
    { icon: 'ri-message-3-line', color: 'text-pink-400', bg: 'bg-pink-900/30 border-pink-800/40', title: 'Persistent Chat', desc: 'Project chat history is saved — pick up conversations where you left off.' },
    { icon: 'ri-shield-keyhole-line', color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-800/40', title: 'Secure OTP Auth', desc: 'Email-based OTP verification keeps your account safe on every login.' },
  ]

  function createProject(event) {
    event.preventDefault()
    axios.post('/projects/create', { name: projectName })
      .then((res) => {
        setProjectName('')
        setIsModalOpen(false)
        setProject(prev => [...prev, res.data])
        toast.success('Project created! 🎉')
      })
      .catch((err) => showApiError(err, 'Failed to create project'))
  }

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return
    axios.delete(`/projects/${projectId}`)
      .then(() => {
        setProject(prev => prev.filter(p => p._id !== projectId))
        const bc = new BroadcastChannel('devroom')
        bc.postMessage({ type: 'project-deleted', projectId })
        bc.close()
        toast.success('Project deleted!')
      })
      .catch((err) => showApiError(err, 'Failed to delete project'))
  }

  useEffect(() => {
    const bc = new BroadcastChannel('devroom')
    bc.onmessage = (event) => {
      if (event.data?.type === 'project-deleted') {
        setProject(prev => {
          const exists = prev.some(p => p._id === event.data.projectId)
          if (exists) toast.info('A project was deleted')
          return prev.filter(p => p._id !== event.data.projectId)
        })
      }
    }
    return () => bc.close()
  }, [])

  const openProject = async (proj) => {
    try {
      const res = await axios.get(`/projects/get-project/${proj._id}`)
      if (!res.data?.project) throw new Error('not found')
      navigate('/project', { state: { project: res.data.project } })
    } catch (err) {
      toast.error('This project no longer exists')
      setProject(prev => prev.filter(p => p._id !== proj._id))
    }
  }

  useEffect(() => {
    const fetchProjects = () => {
      if (!navigator.onLine) return
      axios.get('/projects/all')
        .then((res) => setProject(res.data.projects))
        .catch(err => showApiError(err, 'Failed to load projects'))
    }
    fetchProjects()
    const interval = setInterval(fetchProjects, 2000)
    return () => clearInterval(interval)
  }, [])


  //Animation for right card
  const codeLines = [
    [{ t: 'import ', c: 'text-purple-400' }, { t: 'React', c: 'text-blue-300' }, { t: ' from ', c: 'text-purple-400' }, { t: "'react'", c: 'text-green-400' }],
    [],
    [{ t: 'function ', c: 'text-purple-400' }, { t: 'App', c: 'text-yellow-300' }, { t: '() {', c: 'text-slate-300' }],
    [{ t: '  return (', c: 'text-purple-400' }],
    [{ t: '    <', c: 'text-slate-400' }, { t: 'div', c: 'text-cyan-400' }, { t: ' ', c: 'text-slate-400' }, { t: 'className', c: 'text-amber-300' }, { t: '=', c: 'text-slate-400' }, { t: '"app"', c: 'text-green-400' }, { t: '>', c: 'text-slate-400' }],
    [{ t: '      Hello, DevRoom! 🚀', c: 'text-slate-300' }],
    [{ t: '    </', c: 'text-slate-400' }, { t: 'div', c: 'text-cyan-400' }, { t: '>', c: 'text-slate-400' }],
    [{ t: '  )', c: 'text-slate-300' }],
    [{ t: '}', c: 'text-slate-300' }],
  ]

  const lineLength = (line) => line.reduce((sum, p) => sum + p.t.length, 0)

  const [typedLines, setTypedLines] = useState([])
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  // Typing effect
  useEffect(() => {
    if (lineIndex >= codeLines.length) {
      const t = setTimeout(() => {
        setTypedLines([])
        setLineIndex(0)
        setCharIndex(0)
      }, 2000)
      return () => clearTimeout(t)
    }

    const total = lineLength(codeLines[lineIndex])
    if (charIndex < total) {
      const t = setTimeout(() => setCharIndex(c => c + 1), 18 + Math.random() * 30)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setTypedLines(prev => [...prev, lineIndex])
        setLineIndex(i => i + 1)
        setCharIndex(0)
      }, total === 0 ? 80 : 250)
      return () => clearTimeout(t)
    }
  }, [lineIndex, charIndex])

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 500)
    return () => clearInterval(interval)
  }, [])

  // Renders typed portion of a line with syntax colors
  const renderTypedLine = (parts, typedCount) => {
    if (parts.length === 0) return '\u00A0'
    let remaining = typedCount
    const out = []
    for (let i = 0; i < parts.length; i++) {
      if (remaining <= 0) break
      const part = parts[i]
      const take = Math.min(part.t.length, remaining)
      out.push(<span key={i} className={part.c}>{part.t.slice(0, take)}</span>)
      remaining -= take
    }
    return out.length ? out : '\u00A0'
  }

  return (

    <main className='min-h-screen w-full overflow-x-hidden bg-slate-900 text-white'>

      {/* ── PENDING INVITES BANNER (top) ── */}
      {pendingInvites.length > 0 && (
        <div className='bg-blue-950/60 border-b border-blue-800/40'>
          <div className='max-w-6xl mx-auto px-6 md:px-10 py-3 flex flex-col gap-3'>
            {pendingInvites.map(inv => (
              <div key={inv.projectId} className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 border border-blue-800/40 rounded-xl px-5 py-3'>
                <div className='min-w-0 flex items-center gap-2'>
                  <i className='ri-mail-unread-line text-blue-400 shrink-0'></i>
                  <p className='text-sm text-white break-words'>
                    <span className='font-semibold'>{inv.invitedBy?.name || inv.invitedBy?.email}</span> invited you to <span className='font-semibold'>{inv.projectName}</span>
                  </p>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  <button onClick={() => respondToInvite(inv.projectId, 'reject')} className='px-3 py-1.5 text-xs border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition'>Decline</button>
                  <button onClick={() => respondToInvite(inv.projectId, 'accept')} className='px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition'>Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO GREETING ── */}
      <section className='bg-gradient-to-br from-blue-950/50 via-slate-900 to-slate-900 border-b border-slate-800'>
        <div className='max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-28'>
          <div className='flex flex-col lg:flex-row items-center gap-12'>

            {/* ── LEFT: existing greeting content ── */}
            <div className='flex-1 w-full'>
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/40 border border-blue-800/50 text-blue-400 text-xs font-medium mb-6'>
                <i className='ri-sparkling-line'></i>
                Powered by Google Gemini AI
              </div>
              <h1 className='text-3xl md:text-5xl font-bold leading-tight tracking-tight mb-4'>
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className='text-slate-400 text-base md:text-lg mb-8 max-w-xl'>
                {todayString} — {project.length} active project{project.length !== 1 ? 's' : ''}. Ready to build something great?
              </p>
              <div className='flex flex-wrap gap-3'>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className='flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition cursor-pointer'>
                  <i className='ri-add-line'></i> New Project
                </button>
                <button
                  onClick={() => projectsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className='flex items-center gap-2 px-5 py-2.5 border border-slate-700 hover:border-slate-500 rounded-xl text-sm text-slate-300 hover:text-white transition cursor-pointer'>
                  View Projects
                </button>
              </div>
            </div>

            {/* ── RIGHT: code editor mockup (hidden on mobile) ── */}
            <div className='w-full lg:flex-1 lg:max-w-md'>
              <div className='relative'>
                <div className='rounded-xl border border-slate-700 bg-slate-800/80 shadow-2xl overflow-hidden backdrop-blur h-[260px] sm:h-[300px] flex flex-col'>
                  {/* Title bar */}
                  <div className='flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-700'>
                    <div className='flex gap-1.5'>
                      <span className='w-2.5 h-2.5 rounded-full bg-red-500'></span>
                      <span className='w-2.5 h-2.5 rounded-full bg-yellow-500'></span>
                      <span className='w-2.5 h-2.5 rounded-full bg-green-500'></span>
                    </div>
                    <span className='text-xs text-slate-500 ml-2'>App.jsx</span>
                  </div>
                  {/* Code lines */}
                  <div className='p-5 font-mono text-xs leading-relaxed h-[300px]'>
                    {typedLines.map(idx => (
                      <p key={idx} className='whitespace-pre'>
                        {renderTypedLine(codeLines[idx], lineLength(codeLines[idx]))}
                      </p>
                    ))}

                    {lineIndex < codeLines.length && (
                      <p className='whitespace-pre'>
                        {renderTypedLine(codeLines[lineIndex], charIndex)}
                        <span className={`inline-block w-[2px] h-3.5 bg-blue-400 ml-0.5 align-middle transition-opacity ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                      </p>
                    )}

                    {lineIndex >= codeLines.length && (
                      <p className='mt-2 text-slate-600'>// AI is generating code...</p>
                    )}
                  </div>
                </div>

                {/* Floating badges */}
                <div className='absolute -top-4 -right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/80 border border-green-700/50 text-green-400 text-xs font-medium shadow-lg backdrop-blur'>
                  <i className='ri-checkbox-circle-fill'></i> Build Passing
                </div>
                <div className='absolute -bottom-4 -left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/80 border border-blue-700/50 text-blue-400 text-xs font-medium shadow-lg backdrop-blur'>
                  <i className='ri-robot-2-line'></i> AI Suggestion Ready
                </div>

                {/* Decorative glow blobs */}
                <div className='absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-600/20 blur-2xl -z-10'></div>
                <div className='absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-purple-600/20 blur-2xl -z-10'></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className='max-w-6xl mx-auto px-6 md:px-10 py-10'>

        {/* ── STATS ── */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-12'>
          {stats.map((stat) => (
            <div key={stat.label} className={`bg-slate-800 rounded-xl p-5 border ${stat.border}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.bg}`}>
                <i className={`${stat.icon} text-lg ${stat.iconColor}`}></i>
              </div>
              <p className='text-xs text-slate-400 mb-1'>{stat.label}</p>
              <p className='text-xl md:text-3xl font-semibold'>{stat.value}</p>
              <p className='text-xs text-slate-500 mt-1'>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── PROJECTS SECTION ── */}
        <div ref={projectsRef} className='mb-12'>
          <div className='flex items-center justify-between mb-5'>
            <div>
              <p className='text-xs text-blue-400 uppercase tracking-widest font-medium mb-1'>Your Work</p>
              <h2 className='text-xl font-bold'>Recent Projects</h2>
            </div>
            <button onClick={() => setIsModalOpen(true)} className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition cursor-pointer'>
              <i className='ri-add-line'></i> New
            </button>
          </div>

          {project.length === 0 ? (
            <div className='bg-slate-800 rounded-xl border border-slate-700 border-dashed p-16 text-center'>
              <i className='ri-folder-add-line text-4xl text-slate-600 mb-4 block'></i>
              <p className='text-slate-400 mb-2 font-medium'>No projects yet</p>
              <p className='text-slate-500 text-sm mb-5'>Create your first project and start coding with AI</p>
              <button onClick={() => setIsModalOpen(true)} className='px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition'>
                Create your first project
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {project.map((proj, i) => {
                const color = activityColors[i % activityColors.length]
                return (
                  <div
                    key={proj._id}
                    onClick={() => openProject(proj)}
                    className='bg-slate-800 rounded-xl border border-slate-700 p-5 cursor-pointer hover:border-blue-700/50 hover:bg-slate-750 transition group'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-900/50`}>
                        <i className={`ri-code-s-slash-line text-${color}-400`}></i>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(proj._id) }}
                        className='p-1.5 rounded-lg opacity-100 md:opacity-0  md:group-hover:opacity-100 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition'>
                        <i className='ri-delete-bin-6-line text-sm'></i>
                      </button>
                    </div>
                    <h3 className='font-semibold text-sm mb-1 truncate'>{proj.name}</h3>
                    <p className='text-xs text-slate-400'>{proj.users?.length} member{proj.users?.length !== 1 ? 's' : ''} · {timeAgo(proj.updatedAt)}</p>
                    <div className='mt-4 flex items-center justify-between'>
                      <span className='text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400 border border-blue-700/50'>Active</span>
                      <i className='ri-arrow-right-line text-slate-600 group-hover:text-blue-400 transition'></i>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── FEATURES SECTION ── */}
        <div ref={featuresRef} className='mb-12 py-10 border-t border-slate-800'>
          <div className='text-center mb-10'>
            <p className='text-xs text-blue-400 uppercase tracking-widest font-medium mb-3'>Features</p>
            <h2 className='text-2xl md:text-3xl font-bold mb-3'>Everything in one place</h2>
            <p className='text-slate-400 max-w-lg mx-auto text-sm'>Built for developers who move fast and collaborate closely.</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            {features.map(f => (
              <div key={f.title} className={`rounded-xl p-6 border ${f.bg}`}>
                <i className={`${f.icon} text-2xl ${f.color} block mb-4`}></i>
                <h3 className='font-semibold mb-2'>{f.title}</h3>
                <p className='text-sm text-slate-400 leading-relaxed'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About DevRoom */}
        <section ref={aboutRef} className="px-6 md:px-16 py-20 border-t border-slate-800">
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

            {/* Founder*/}
            <div className="mt-12 pt-10 border-t border-slate-800 text-center">
              <p className="text-xs text-blue-400 uppercase tracking-widest font-medium mb-2">About the Founder</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xl mx-auto">
                DevRoom was created and is maintained by{' '}
                <span className="text-white font-semibold">Aman Chouhan</span>,
                a final-year B.Tech ECE student at JNU Delhi, passionate about
                building developer tools and AI-powered applications.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                <a href="https://github.com/amanchouhan01" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800">
                  <i className="ri-github-line text-base leading-none"></i><span>amanchouhan01</span>
                </a>
                <a href="https://www.linkedin.com/in/aman-chouhan-sde/" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800">
                  <i className="ri-linkedin-line text-base leading-none"></i><span>aman-chouhan-sde</span>
                </a>
                <a href="https://x.com/AmanChouhan01" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800">
                  <i className="ri-twitter-x-line text-base leading-none"></i><span>AmanChouhan01</span>
                </a>
                <a href="https://www.instagram.com/amanchouhxn/" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800">
                  <i className="ri-instagram-line text-base leading-none"></i><span>amanchouhxn</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-md rounded-2xl bg-slate-800 p-6 border border-slate-700 shadow-2xl'>
            <div className='mb-5 flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className='rounded-full p-2 text-slate-400 hover:bg-slate-700 transition'>✕</button>
            </div>
            <form onSubmit={createProject} className='space-y-4'>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-300'>Project Name</label>
                <input
                  type='text'
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder='e.g. auth-service, landing-page'
                  className='w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm outline-none focus:border-blue-500 text-white placeholder-slate-500'
                  required
                />
              </div>
              <div className='flex justify-end gap-3 pt-1'>
                <button type='button' onClick={() => setIsModalOpen(false)} className='rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition'>Cancel</button>
                <button type='submit' className='rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition'>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home