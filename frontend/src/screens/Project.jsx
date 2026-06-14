import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage, getSocket } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import { getWebContainer } from "../config/webContainer.js";
import 'highlight.js/styles/nord.css';
import { toast } from 'react-toastify';

function SyntaxHighlightedCode(props) {
    const ref = useRef(null)
    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-')) {
            hljs.highlightElement(ref.current)
            ref.current.removeAttribute('data-highlighted')
        }
    }, [props.className, props.children])
    return <code {...props} ref={ref} />
}

// ── File Tree Node ──
const FileTreeNode = ({ name, node, depth, currentFile, onFileClick, openFolders, toggleFolder, onAddFile, onAddFolder, onDelete, path }) => {
    const isFolder = node && !node.file && typeof node === 'object'
    const isOpen = openFolders.has(path)
    const [hovering, setHovering] = useState(false)

    const extIcon = (name) => {
        const ext = name.split('.').pop()
        return {
            js: 'ri-javascript-line text-yellow-400',
            jsx: 'ri-reactjs-line text-cyan-400',
            ts: 'ri-code-s-slash-line text-blue-400',
            tsx: 'ri-reactjs-line text-blue-400',
            json: 'ri-braces-line text-amber-300',
            css: 'ri-css3-line text-blue-300',
            html: 'ri-html5-line text-orange-400',
            md: 'ri-markdown-line text-slate-400',
        }[ext] || 'ri-file-code-line text-slate-500'
    }

    if (isFolder) {
        return (
            <div>
                <div
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    style={{ paddingLeft: `${depth * 12 + 4}px` }}
                    className='flex items-center group hover:bg-slate-700/60 transition pr-1'>
                    <button
                        onClick={() => toggleFolder(path)}
                        className='flex items-center gap-1 py-1 text-slate-300 grow min-w-0'>
                        <i className={`text-xs text-slate-500 shrink-0 ${isOpen ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}`}></i>
                        <i className={`text-sm shrink-0 ${isOpen ? 'ri-folder-open-line text-amber-400' : 'ri-folder-line text-amber-400'}`}></i>
                        <span className='text-xs truncate ml-1'>{name}</span>
                    </button>
                    {hovering && (
                        <div className='flex items-center gap-0.5 shrink-0'>
                            <button onClick={() => onAddFile(path)} title='New File' className='p-1 rounded hover:bg-slate-600 text-slate-400 hover:text-white transition'>
                                <i className='ri-file-add-line text-xs'></i>
                            </button>
                            <button onClick={() => onAddFolder(path)} title='New Folder' className='p-1 rounded hover:bg-slate-600 text-slate-400 hover:text-white transition'>
                                <i className='ri-folder-add-line text-xs'></i>
                            </button>
                            <button onClick={() => onDelete(path, true)} title='Delete' className='p-1 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition'>
                                <i className='ri-delete-bin-6-line text-xs'></i>
                            </button>
                        </div>
                    )}
                </div>
                {isOpen && Object.entries(node).map(([childName, childNode]) => (
                    <FileTreeNode
                        key={childName}
                        name={childName}
                        node={childNode}
                        depth={depth + 1}
                        currentFile={currentFile}
                        onFileClick={onFileClick}
                        openFolders={openFolders}
                        toggleFolder={toggleFolder}
                        onAddFile={onAddFile}
                        onAddFolder={onAddFolder}
                        onDelete={onDelete}
                        path={`${path}/${childName}`}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            style={{ paddingLeft: `${depth * 12 + 4}px` }}
            className={`flex items-center group pr-1 hover:bg-slate-700/60 transition ${currentFile === path ? 'bg-slate-700 border-l-2 border-blue-500' : ''}`}>
            <button
                onClick={() => onFileClick(path, node)}
                className='flex items-center gap-2 py-1.5 grow min-w-0'>
                <i className={`text-sm shrink-0 ${extIcon(name)}`}></i>
                <span className={`text-xs truncate ${currentFile === path ? 'text-white' : 'text-slate-400'}`}>{name}</span>
            </button>
            {hovering && (
                <button onClick={() => onDelete(path, false)} title='Delete' className='p-1 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition shrink-0'>
                    <i className='ri-delete-bin-6-line text-xs'></i>
                </button>
            )}
        </div>
    )
}

const Project = () => {
    const location = useLocation();
    const initialProject = location.state?.project || {}
    const projectId = initialProject._id

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(initialProject)
    const [message, setMessage] = useState('')
    const { user } = useContext(UserContext)
    const messageBox = useRef(null)
    const [messages, setMessages] = useState(initialProject?.messages || [])

    //const [users, setUsers] = useState([])
    const [searchEmail, setSearchEmail] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)

    const [fileTree, setFileTree] = useState({})
    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])
    const [openFolders, setOpenFolders] = useState(new Set())
    const [explorerOpen, setExplorerOpen] = useState(true)
    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)
    const [runProcess, setRunProcess] = useState(null)
    const [isRunning, setIsRunning] = useState(false)
    const [isInstalling, setIsInstalling] = useState(false)
    const [terminalLogs, setTerminalLogs] = useState([])
    const [showTerminal, setShowTerminal] = useState(false)
    const [previewWidth, setPreviewWidth] = useState(35)
    const isDragging = useRef(false)
    const terminalRef = useRef(null)
    const navigate = useNavigate()
    const webContainerRef = useRef(null)
    const [mobileView, setMobileView] = useState('chat') // 'chat' | 'code'
    const [invitingEmail, setInvitingEmail] = useState(false)

    const [terminalHeight, setTerminalHeight] = useState(192)
    const isDraggingTerminal = useRef(false)
    const codeColumnRef = useRef(null)

    // New file/folder dialog state
    const [newItemDialog, setNewItemDialog] = useState(null) // { type: 'file'|'folder', parentPath: string|null }
    const [newItemName, setNewItemName] = useState('')
    const newItemInputRef = useRef(null)

    useEffect(() => {
        if (newItemDialog && newItemInputRef.current) newItemInputRef.current.focus()
    }, [newItemDialog])

    const addLog = (text, type = 'log') => {
        setTerminalLogs(prev => [...prev, { text, type, time: new Date().toLocaleTimeString() }])
    }

    const formatTime = (msg) => {
        const ts = msg.timestamp || msg.createdAt
        const date = ts ? new Date(ts) : new Date()
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    useEffect(() => {
        if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }, [terminalLogs])

    const toggleFolder = (path) => {
        setOpenFolders(prev => {
            const next = new Set(prev)
            next.has(path) ? next.delete(path) : next.add(path)
            return next
        })
    }

    // Get/set nested node by path
    const getNodeByPath = (tree, pathParts) => {
        let node = tree
        for (const part of pathParts) {
            if (!node[part]) return null
            node = node[part]
        }
        return node
    }

    const setNodeByPath = (tree, pathParts, value) => {
        if (pathParts.length === 0) return value
        const [head, ...rest] = pathParts
        return { ...tree, [head]: setNodeByPath(tree[head] || {}, rest, value) }
    }

    const deleteNodeByPath = (tree, pathParts) => {
        if (pathParts.length === 1) {
            const { [pathParts[0]]: _, ...rest } = tree
            return rest
        }
        const [head, ...rest] = pathParts
        return { ...tree, [head]: deleteNodeByPath(tree[head], rest) }
    }

    const handleAddFile = (parentPath) => {
        setNewItemDialog({ type: 'file', parentPath })
        setNewItemName('')
    }

    const handleAddFolder = (parentPath) => {
        setNewItemDialog({ type: 'folder', parentPath })
        setNewItemName('')
    }

    const handleAddRootFile = () => {
        setNewItemDialog({ type: 'file', parentPath: null })
        setNewItemName('')
    }

    const handleAddRootFolder = () => {
        setNewItemDialog({ type: 'folder', parentPath: null })
        setNewItemName('')
    }


    // WebContainer ke mount() ko apna plain-nested fileTree samajh nahi aata.
    // Ye function har folder ko { directory: {...} } mein wrap karta hai,
    // files ko { file: { contents } } hi rakhta hai.
    const toWebContainerTree = (tree) => {
        if (!tree || typeof tree !== 'object') return {}
        const result = {}
        for (const [name, node] of Object.entries(tree)) {
            if (node && typeof node === 'object' && node.file) {
                // File node — contents string honi chahiye, null/undefined safe-guard
                result[name] = { file: { contents: node.file.contents ?? '' } }
            } else if (node && typeof node === 'object') {
                // Folder node — recursively wrap children
                result[name] = { directory: toWebContainerTree(node) }
            }
            // null/invalid nodes skip ho jaayenge
        }
        return result
    }


    const confirmNewItem = () => {
        if (!newItemName.trim()) return
        const name = newItemName.trim()
        let newTree

        if (newItemDialog.parentPath === null) {
            // root level
            if (newItemDialog.type === 'file') {
                newTree = { ...fileTree, [name]: { file: { contents: '' } } }
            } else {
                newTree = { ...fileTree, [name]: {} }
            }
        } else {
            const pathParts = newItemDialog.parentPath.split('/')
            const parentNode = getNodeByPath(fileTree, pathParts)
            if (newItemDialog.type === 'file') {
                const updated = { ...parentNode, [name]: { file: { contents: '' } } }
                newTree = setNodeByPath(fileTree, pathParts, updated)
            } else {
                const updated = { ...parentNode, [name]: {} }
                newTree = setNodeByPath(fileTree, pathParts, updated)
            }
            // auto open parent folder
            setOpenFolders(prev => new Set([...prev, newItemDialog.parentPath]))
        }

        setFileTree(newTree)
        saveFileTree(newTree)
        setNewItemDialog(null)
        setNewItemName('')

        // auto open new file
        if (newItemDialog.type === 'file') {
            const fullPath = newItemDialog.parentPath ? `${newItemDialog.parentPath}/${name}` : name
            setCurrentFile(fullPath)
            setOpenFiles(prev => [...new Set([...prev, fullPath])])
        }
    }

    const handleDelete = (path, isFolder) => {
        if (!window.confirm(`Delete ${isFolder ? 'folder' : 'file'} "${path.split('/').pop()}"?`)) return
        const pathParts = path.split('/')
        const newTree = deleteNodeByPath(fileTree, pathParts)
        setFileTree(newTree)
        saveFileTree(newTree)
        if (currentFile === path || currentFile?.startsWith(path + '/')) {
            setCurrentFile(null)
            setOpenFiles(prev => prev.filter(f => f !== path && !f.startsWith(path + '/')))
        }
    }

    const handleFileClick = (path) => {
        setCurrentFile(path)
        setOpenFiles(prev => [...new Set([...prev, path])])
        if (window.innerWidth < 768) setExplorerOpen(false)
    }

    const getFileContents = (tree, filePath) => {
        const parts = filePath.split('/')
        const node = getNodeByPath(tree, parts)
        return node?.file?.contents ?? null
    }

    const getClientX = (e) => e.touches ? e.touches[0].clientX : e.clientX
    const getClientY = (e) => e.touches ? e.touches[0].clientY : e.clientY

    const handleDragStart = () => { isDragging.current = true }
    const handleTerminalDragStart = () => { isDraggingTerminal.current = true }

    const handleDrag = (e) => {
        const clientX = getClientX(e)
        const clientY = getClientY(e)

        if (isDragging.current) {
            const container = e.currentTarget.parentElement
            const rect = container.getBoundingClientRect()
            const w = ((rect.right - clientX) / rect.width) * 100
            if (w > 20 && w < 70) setPreviewWidth(w)
        }
        if (isDraggingTerminal.current && codeColumnRef.current) {
            const rect = codeColumnRef.current.getBoundingClientRect()
            const newHeight = rect.bottom - clientY
            const clamped = Math.min(Math.max(newHeight, 100), rect.height - 150)
            setTerminalHeight(clamped)
        }

    }
    const handleDragEnd = () => { isDragging.current = false; isDraggingTerminal.current = false }

    const handleUserClick = (id) => {
        setSelectedUserId(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function inviteCollaborators() {
        toast.promise(
            axios.post('/projects/invite', { projectId, userIds: Array.from(selectedUserId) })
                .then((res) => {
                    setIsModalOpen(false)
                    setSelectedUserId(new Set())
                    const { invited = [], skipped = [] } = res.data
                    if (skipped.length > 0 && invited.length === 0) {
                        toast.info('Selected user(s) already invited or added')
                    } else if (skipped.length > 0) {
                        toast.info(`${invited.length} invite(s) sent, ${skipped.length} skipped`)
                    }
                }),
            { pending: 'Sending invite...', success: 'Invite sent!', error: 'Failed' }
        )
    }

    const inviteByEmail = () => {
        const email = searchEmail.trim()
        if (!email) return

        setInvitingEmail(true)
        axios.post('/projects/invite-email', { projectId, email })
            .then((res) => {
                if (res.data.skipped) {
                    toast.info(res.data.reason || 'Invite already sent')
                } else if (res.data.invited) {
                    toast.success(`Invite sent to ${email}`)
                    setSearchEmail('')
                } else {
                    // existing user invited via normal flow
                    toast.success('Invite sent!')
                    setSearchEmail('')
                }
            })
            .catch(err => toast.error(err.response?.data?.error || 'Failed to send invite'))
            .finally(() => setInvitingEmail(false))
    }

    const messageInputRef = useRef(null)
    const send = () => {
        if (!message.trim()) { toast.error("Message cannot be empty"); return }
        const timestamp = Date.now()
        sendMessage('project-message', { message, sender: user, timestamp })
        setMessages(prev => [...prev, { message, sender: user, timestamp }])
        setMessage("")
        if (messageInputRef.current) messageInputRef.current.style.height = 'auto'
    }

    function WriteAiMessage(message) {
        let obj;
        try {
            if (typeof message === 'string') {
                const start = message.indexOf('{');
                const end = message.lastIndexOf('}');
                obj = JSON.parse(message.slice(start, end + 1));
            } else {
                obj = message; //already an object
            }
        } catch (e) {
            obj = { text: String(message) };
        }
        return (
            <div className='overflow-auto bg-slate-800 text-slate-100 rounded-lg p-3 text-sm'>
                <Markdown children={obj?.text || ''} options={{ overrides: { code: SyntaxHighlightedCode } }} />
            </div>
        )
    }

    useEffect(() => {
        if (messageBox.current) messageBox.current.scrollTop = messageBox.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (!projectId) {
            toast.error('Project does not exist!')
            navigate('/home')
            return
        }

        initializeSocket(project._id)
        getWebContainer().then(container => { setWebContainer(container); webContainerRef.current = container })

        receiveMessage('project-message', data => {
            const withTimeStamp = { ...data, timestamp: data.timestamp ?? Date.now() }

            if (withTimeStamp?.sender?._id === 'ai' && withTimeStamp?.message) {
                try {
                    const parsed = typeof withTimeStamp.message === 'string'
                        ? JSON.parse(withTimeStamp.message)
                        : withTimeStamp.message;

                    const ft = parsed?.fileTree;
                    if (ft && typeof ft === 'object' && !Array.isArray(ft) && Object.keys(ft).length > 0) {
                        //Wait for webContainer to be ready before mounting
                        const mountAndInstall = async () => {
                            const container = webContainerRef.current || await getWebContainer();
                            if (!webContainerRef.current) {
                                webContainerRef.current = container;
                                setWebContainer(container);
                            }
                            await container.mount(toWebContainerTree(ft));
                            setFileTree(ft);
                            autoInstall(ft);
                        }
                        mountAndInstall().catch(e => console.error('Mount error:', e));
                    }
                } catch (e) {
                    console.error('AI parse error:', e);
                }
            }
            setMessages(prev => [...prev, withTimeStamp])
        })

        receiveMessage('collaborator-added', () => {
            axios.get(`/projects/get-project/${projectId}`).then(res => { setProject(res.data.project); toast.info('New collaborator added!') })
        })

        receiveMessage('project-deleted', ({ projectId: dId }) => {
            if (dId === projectId) { toast.error('Project deleted!'); navigate('/home') }
        })
        axios.get(`/projects/get-project/${projectId}`)
            .then(res => {
                if (!res.data?.project) {
                    toast.error('Project does not exist!')
                    navigate('/home')
                    return
                }
                setProject(res.data.project)
                setFileTree(res.data.project.fileTree || {})
                setMessages(res.data.project?.messages || [])
            })
            .catch(err => {
                // 404 ya kuch bhi error -> project nahi mila
                toast.error('Project does not exist!')
                navigate('/home')
            })
        return () => { getSocket()?.off('project-message'); getSocket()?.off('collaborator-added'); getSocket()?.off('project-deleted') }
    }, [])



    // Modal khulne par ya searchEmail type karte time, 400ms baad search trigger
    useEffect(() => {
        if (!isModalOpen) return
        const email = searchEmail.trim()
        if (email.length < 3) { setSearchResults([]); return }

        setSearching(true)
        const timer = setTimeout(() => {
            axios.get('/users/search', { params: { email } })
                .then(res => {
                    // already-added collaborators ko results se filter out
                    const existingIds = new Set(
                        (project.users || []).map(pu => (typeof pu === 'string' ? pu : pu._id)?.toString())
                    )
                    const filtered = res.data.users.filter(u => !existingIds.has(u._id?.toString()))
                    setSearchResults(filtered)
                })
                .catch(() => setSearchResults([]))
                .finally(() => setSearching(false))
        }, 400)

        return () => clearTimeout(timer) // debounce: purana timer cancel
    }, [searchEmail, isModalOpen, project.users])

    // Modal close hone par search reset karo
    useEffect(() => {
        if (!isModalOpen) {
            setSearchEmail('')
            setSearchResults([])
            setSelectedUserId(new Set())
        }
    }, [isModalOpen])

    useEffect(() => {
        if (project._id && Object.keys(fileTree).length > 0) saveFileTree(fileTree)
    }, [fileTree])

    const isValidEmailFormat = (email) => /^\S+@\S+\.\S+$/.test(email)

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', { projectId: project._id, fileTree: ft }).catch(() => { })
    }

    // Auto install when AI generates code
    const autoInstall = async (ft) => {
        if (!webContainerRef.current) {
            toast.error("Container not ready – cannot auto‑install.");
            return;
        }

        const isValid = ft && typeof ft === 'object' &&
            Object.keys(ft).length > 0 &&
            JSON.stringify(ft) !== 'null'

        if (!isValid) {
            addLog('⚠️ Invalid file tree received, skipping mount.', 'error')
            return;
        }


        setShowTerminal(true)
        setTerminalLogs([])
        setIsInstalling(true)
        addLog('🤖 AI generated new code — installing packages...', 'info')
        try {
            await webContainerRef.current.mount(toWebContainerTree(ft))
            addLog('✓ Files mounted.', 'success')
            const installProcess = await webContainerRef.current.spawn("npm", ["install"])
            installProcess.output.pipeTo(new WritableStream({
                write(chunk) { addLog(chunk.trim(), 'log') }
            }))
            await new Promise(resolve => installProcess.exit.then(resolve))
            addLog('✓ Packages installed! Click Run to start the server.', 'success')
        } catch (err) {
            addLog(`Error: ${err.message}`, 'error')
        } finally {
            setIsInstalling(false)
        }
    }

    const handleRun = async () => {
        if (!webContainer) {
            toast.error("WebContainer not ready yet. Please wait.");
            return;
        }

        if (isRunning || isInstalling) {
            runProcess?.kill(); setRunProcess(null); setIsRunning(false); setIsInstalling(false); setIframeUrl(null)
            addLog('Process stopped.', 'error'); return
        }
        setShowTerminal(true); setTerminalLogs([]); setIsInstalling(true)
        addLog('📦 Mounting file system...', 'info')
        await webContainer.mount(toWebContainerTree(fileTree))
        addLog('✓ Files mounted.', 'success')
        addLog('📥 Installing packages... this may take a moment', 'info')
        const installProcess = await webContainer.spawn("npm", ["install"])
        installProcess.output.pipeTo(new WritableStream({ write(chunk) { addLog(chunk.trim(), 'log') } }))
        await new Promise(resolve => installProcess.exit.then(resolve))
        addLog('✓ Packages installed successfully!', 'success')
        addLog('🚀 Starting development server...', 'info')
        setIsInstalling(false); setIsRunning(true)
        if (runProcess) runProcess.kill()
        const tempRunProcess = await webContainer.spawn("npm", ["start"])
        tempRunProcess.output.pipeTo(new WritableStream({ write(chunk) { addLog(chunk.trim(), 'log') } }))
        setRunProcess(tempRunProcess)
        webContainer.on('server-ready', (port, url) => { addLog(`✓ Server ready → ${url}`, 'success'); setIframeUrl(url); setIsRunning(false) })
    }

    const leaveCurrentProject = async () => {
        if (!window.confirm('Leave this project? You will lose access to its chat and files.')) return
        toast.promise(
            axios.delete(`/projects/${projectId}/leave`).then(() => {
                navigate('/home')
            }),
            { pending: 'Leaving...', success: 'Left project', error: 'Failed' }
        )
    }

    const deleteCurrentProject = async () => {
        if (!window.confirm('Delete this project?')) return
        toast.promise(
            axios.delete(`/projects/${projectId}`).then(() => { sendMessage('project-deleted', { projectId }); navigate('/home') }),
            { pending: 'Deleting...', success: 'Deleted!', error: 'Failed' }
        )
    }

    const logColor = { info: 'text-blue-400', success: 'text-green-400', error: 'text-red-400', log: 'text-slate-300' }

    return (
        <main className='h-[calc(100vh-56px)] w-full flex overflow-hidden bg-slate-900'>

            {/* ── LEFT: Chat ── */}
            <section className={`relative flex flex-col h-full w-full md:min-w-[290px] md:max-w-[360px] md:w-[28%] bg-slate-900 border-r border-slate-700 ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                <header className='flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0'>
                    <div>
                        <h2 className='text-sm font-semibold text-white truncate max-w-[140px]'>{project.name || 'Project'}</h2>
                        <p className='text-xs text-slate-400'>{project.users?.length || 0} member{project.users?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <button onClick={() => setMobileView('code')} className='md:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition'>
                            <i className="ri-code-s-slash-line text-xs"></i> Code
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className='flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition'>
                            <i className="ri-user-add-fill text-xs"></i> Add
                        </button>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition'>
                            <i className="ri-group-fill text-base"></i>
                        </button>
                        <button onClick={deleteCurrentProject} className='p-1.5 rounded-lg text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition'>
                            <i className="ri-delete-bin-6-line text-base"></i>
                        </button>
                    </div>
                </header>

                <div ref={messageBox} className='flex flex-col gap-2 p-3 overflow-y-auto grow custom-scroll'>
                    {messages.map((msg, idx) => {
                        const isOwn = msg.sender?._id === user?._id
                        const isAI = msg.sender?._id === 'ai'
                        return (
                            <div key={idx} className={`flex flex-col max-w-[88%] min-w-0 ${isOwn ? 'ml-auto items-end' : 'items-start'}`}>
                                <div className={`rounded-xl px-3 py-2 text-sm max-w-full ${isAI ? 'w-full' : isOwn ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                                    {!isOwn && <span className={`text-[10px] font-semibold block mb-1 ${isAI ? 'text-blue-400' : 'text-emerald-400'}`}>{isAI ? '✦ AI' : msg.sender?.email?.split('@')[0]}</span>}
                                    {isAI ? WriteAiMessage(msg.message) : (
                                        <div className='flex items-end gap-2 min-w-0'>
                                            <span className='leading-relaxed break-words min-w-0'>{msg.message}</span>
                                            <span className='text-[10px] text-slate-300/60 whitespace-nowrap self-end shrink-0'>{formatTime(msg)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className='p-3 border-t border-slate-700 bg-slate-800 shrink-0'>
                    <div className='flex items-end gap-2 bg-slate-700 rounded-2xl border border-slate-600 focus-within:border-blue-500 transition pl-4 pr-2 py-2'>
                        <textarea
                            ref={messageInputRef}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value)
                                e.target.style.height = 'auto'
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    send()
                                }
                            }}
                            rows={1}
                            placeholder='Message or @ai ...'
                            className=' grow bg-transparent text-white text-sm outline-none placeholder-slate-500 resize-none custom-scroll overflow-y-auto max-h-[120px] 
                            leading-relaxed border-0 ring-0 focus:border-0 focus:ring-0 focus:outline-none shadow-none block py-1'
                        />
                        <button onClick={send} className='w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shrink-0'>
                            <i className="ri-send-plane-fill text-sm"></i>
                        </button>
                    </div>
                </div>

                <div className={`absolute top-0 left-0 w-full h-full flex flex-col bg-slate-900 border-r border-slate-700 transition-transform duration-200 z-10 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <header className='flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700'>
                        <h2 className='text-sm font-semibold text-white'>Collaborators</h2>
                        <button onClick={() => setIsSidePanelOpen(false)} className='text-slate-400 hover:text-white'><i className='ri-close-fill text-lg'></i></button>
                    </header>
                    <div className='flex flex-col gap-2 p-3 overflow-y-auto custom-scroll'>
                        {project.users?.map(pu => {
                            const uid = typeof pu === 'string' ? pu : pu._id
                            const uname = typeof pu === 'string' ? pu : (pu.name || pu.email)
                            const isMe = uid?.toString() === user?._id?.toString()
                            return (
                                <div key={uid} className='flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700'>
                                    <div className='w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0'><i className="ri-user-fill text-blue-400 text-sm"></i></div>
                                    <span className='text-sm text-slate-200'>{isMe ? 'You' : uname}</span>
                                </div>
                            )
                        })}
                    </div>

                    <div className='p-3 border-t border-slate-700 mt-auto'>
                        <button onClick={leaveCurrentProject} className='w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition'>
                            <i className='ri-logout-box-r-line'></i> Leave Project
                        </button>
                    </div>
                </div>
            </section>

            {/* ── RIGHT: Editor ── */}
            <section className={`flex grow h-full overflow-hidden flex-col ${mobileView === 'code' ? 'flex' : 'hidden md:flex'}`}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchMove={handleDrag}
                onTouchEnd={handleDragEnd}
            >
                <div className='flex grow overflow-hidden'>

                    {explorerOpen && (
                        <div onClick={() => setExplorerOpen(false)} className='md:hidden fixed inset-0 bg-black/40 z-10'></div>
                    )}

                    {/* ── Explorer Toggle Button (always visible) ── */}
                    <div className={`h-full flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-200 shrink-0 z-20 ${explorerOpen ? 'w-[200px] absolute md:relative inset-y-0 left-0 shadow-2xl md:shadow-none' : 'w-9'}`}>

                        {explorerOpen ? (
                            <>
                                {/* Explorer Header */}
                                <div className='flex items-center justify-between px-2 py-2 border-b border-slate-700 shrink-0'>
                                    <span className='text-[10px] text-slate-500 uppercase tracking-widest font-medium px-1'>Explorer</span>
                                    <div className='flex items-center gap-0.5'>
                                        <button onClick={handleAddRootFile} title='New File' className='p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition'>
                                            <i className='ri-file-add-line text-xs'></i>
                                        </button>
                                        <button onClick={handleAddRootFolder} title='New Folder' className='p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition'>
                                            <i className='ri-folder-add-line text-xs'></i>
                                        </button>
                                        <button onClick={() => setExplorerOpen(false)} title='Close Explorer' className='p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition'>
                                            <i className='ri-layout-left-line text-xs'></i>
                                        </button>
                                    </div>
                                </div>

                                {/* File Tree */}
                                <div className='overflow-y-auto grow custom-scroll py-1'>
                                    {Object.entries(fileTree || {}).map(([name, node]) => (
                                        <FileTreeNode
                                            key={name}
                                            name={name}
                                            node={node}
                                            depth={0}
                                            currentFile={currentFile}
                                            onFileClick={handleFileClick}
                                            openFolders={openFolders}
                                            toggleFolder={toggleFolder}
                                            onAddFile={handleAddFile}
                                            onAddFolder={handleAddFolder}
                                            onDelete={handleDelete}
                                            path={name}
                                        />
                                    ))}

                                    {/* Inline new item input */}
                                    {newItemDialog && (
                                        <div className='flex items-center gap-2 px-3 py-1.5 bg-slate-700/50'>
                                            <i className={`text-xs ${newItemDialog.type === 'file' ? 'ri-file-add-line text-slate-400' : 'ri-folder-add-line text-amber-400'}`}></i>
                                            <input
                                                ref={newItemInputRef}
                                                value={newItemName}
                                                onChange={(e) => setNewItemName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') confirmNewItem()
                                                    if (e.key === 'Escape') setNewItemDialog(null)
                                                }}
                                                onBlur={() => { if (newItemName.trim()) confirmNewItem(); else setNewItemDialog(null) }}
                                                placeholder={newItemDialog.type === 'file' ? 'filename.js' : 'folder'}
                                                className='grow bg-slate-600 text-white text-xs rounded px-2 py-1 outline-none border border-blue-500'
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Collapsed sidebar — just icons */
                            <div className='flex flex-col items-center py-2 gap-2'>
                                <button onClick={() => setExplorerOpen(true)} title='Open Explorer' className='p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition'>
                                    <i className='ri-layout-left-2-line text-sm'></i>
                                </button>
                                <button onClick={() => { setExplorerOpen(true); handleAddRootFile() }} title='New File' className='p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition'>
                                    <i className='ri-file-add-line text-sm'></i>
                                </button>
                                <button onClick={() => { setExplorerOpen(true); handleAddRootFolder() }} title='New Folder' className='p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition'>
                                    <i className='ri-folder-add-line text-sm'></i>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Code Editor ── */}
                    <div className='flex flex-col grow h-full overflow-hidden min-w-0' ref={codeColumnRef}>
                        {/* Tabs + Run */}
                        <div className='flex items-center justify-between bg-slate-900 border-b border-slate-700 shrink-0'>
                            <button onClick={() => setMobileView('chat')} className='md:hidden flex items-center justify-center px-3 py-2.5 text-slate-400 
                            hover:text-white border-r border-slate-700 shrink-0'>
                                <i className='ri-arrow-left-line text-sm'></i>
                            </button>

                            <div className='flex overflow-x-auto [&::-webkit-scrollbar]:hidden grow'>
                                {openFiles.map((file) => (
                                    <div key={file} onClick={() => setCurrentFile(file)}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer border-r border-slate-700 shrink-0 transition ${currentFile === file ? 'bg-slate-800 text-white border-t-2 border-t-blue-500' : 'text-slate-400 hover:bg-slate-800 bg-slate-900'}`}>
                                        <i className='ri-file-code-line text-xs'></i>
                                        <span>{file.split('/').pop()}</span>
                                        <span onClick={(e) => {
                                            e.stopPropagation()
                                            const newOpen = openFiles.filter(f => f !== file)
                                            setOpenFiles(newOpen)
                                            if (currentFile === file) setCurrentFile(newOpen[newOpen.length - 1] || null)
                                        }} className='ml-1 w-4 h-4 flex items-center justify-center rounded text-slate-500 hover:text-white hover:bg-slate-600 text-xs'>✕</span>
                                    </div>
                                ))}
                            </div>

                            <div className='flex items-center gap-2 px-3 shrink-0'>
                                <button onClick={() => setShowTerminal(p => !p)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition ${showTerminal ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                                    <i className='ri-terminal-line'></i>
                                    <span className='hidden sm:inline'>Terminal</span>
                                </button>
                                <button onClick={handleRun}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg transition text-white font-medium ${isInstalling ? 'bg-amber-600 hover:bg-amber-500' : isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}>
                                    {isInstalling ? <><i className='ri-loader-4-line animate-spin'></i> Installing...</>
                                        : isRunning ? <><i className='ri-stop-fill'></i> Stop</>
                                            : <><i className='ri-play-fill'></i> Run</>}
                                </button>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className='flex grow overflow-hidden relative'>
                            {currentFile && getFileContents(fileTree, currentFile) !== null ? (
                                <div className='h-full overflow-auto grow bg-slate-950 custom-scroll'>
                                    <pre className='hljs h-full'>
                                        <code
                                            className='hljs h-full outline-none text-sm'
                                            contentEditable suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const pathParts = currentFile.split('/')
                                                const newTree = setNodeByPath(fileTree, pathParts, { file: { contents: e.target.innerText } })
                                                setFileTree(newTree)
                                                saveFileTree(newTree)
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: hljs.highlight(getFileContents(fileTree, currentFile) || '', { language: 'javascript' }).value
                                            }}
                                            style={{ whiteSpace: 'pre-wrap', paddingBottom: '25rem' }}
                                        />
                                    </pre>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center grow text-slate-600 gap-3'>
                                    <i className='ri-code-s-slash-line text-5xl'></i>
                                    <p className='text-sm'>Select a file to start editing</p>
                                </div>
                            )}
                        </div>

                        {/* Terminal */}
                        {showTerminal && (
                            <div style={{ height: `${terminalHeight}px` }} className='relative border-t border-slate-700 bg-slate-950 flex flex-col shrink-0'>
                                <div
                                    onMouseDown={handleTerminalDragStart}
                                    onTouchStart={handleTerminalDragStart}
                                    className='absolute top-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-500 z-10'
                                />
                                <div className='flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-700'>
                                    <div className='flex items-center gap-2'>
                                        <i className='ri-terminal-line text-slate-400 text-xs'></i>
                                        <span className='text-xs text-slate-400 font-medium'>Terminal</span>
                                        {(isInstalling || isRunning) && (
                                            <span className='flex items-center gap-1 text-xs text-amber-400'>
                                                <i className='ri-loader-4-line animate-spin'></i>
                                                {isInstalling ? 'Installing packages...' : 'Running...'}
                                            </span>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <button onClick={() => setTerminalLogs([])} className='text-xs text-slate-500 hover:text-white transition'>Clear</button>
                                        <button onClick={() => setShowTerminal(false)} className='text-slate-500 hover:text-white transition'><i className='ri-close-fill text-sm'></i></button>
                                    </div>
                                </div>
                                <div ref={terminalRef} className='flex-1 overflow-y-auto p-3 font-mono custom-scroll'>
                                    {terminalLogs.length === 0
                                        ? <p className='text-xs text-slate-600'>Click Run to start...</p>
                                        : terminalLogs.map((log, i) => (
                                            <div key={i} className={`text-xs leading-relaxed ${logColor[log.type]}`}>
                                                <span className='text-slate-600 mr-2'>{log.time}</span>{log.text}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {iframeUrl && webContainer && (
                        <div style={{ width: `${previewWidth}%` }} className='relative flex flex-col h-full border-l border-slate-700 shrink-0'>
                            <div
                                onMouseDown={handleDragStart}
                                onTouchStart={handleDragStart}
                                className='absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition z-10' />
                            <div className='flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-700'>
                                <i className='ri-global-line text-slate-400 text-sm'></i>
                                <input type="text" onChange={(e) => setIframeUrl(e.target.value)} value={iframeUrl}
                                    className='grow text-xs bg-slate-700 text-white rounded-md px-3 py-1.5 outline-none border border-slate-600 focus:border-blue-500' />
                            </div>
                            <iframe src={iframeUrl} className='w-full h-full bg-white' />
                        </div>
                    )}
                </div>
            </section>

            {/* Add Collaborator Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
                    <div className='w-full max-w-md rounded-2xl bg-slate-800 border border-slate-600 overflow-hidden'>
                        <header className='flex items-center justify-between px-5 py-4 border-b border-slate-700'>
                            <h2 className='text-sm font-semibold text-white'>Add Collaborator</h2>
                            <button onClick={() => setIsModalOpen(false)} className='text-slate-400 hover:text-white'><i className="ri-close-large-fill"></i></button>
                        </header>

                        {/* Search input */}
                        <div className='p-4 pb-2'>
                            <div className='relative'>
                                <i className='ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm'></i>
                                <input
                                    type='email'
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    placeholder='Search by email...'
                                    className='w-full bg-slate-700 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 outline-none border border-slate-600 focus:border-blue-500 placeholder-slate-500'
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className='flex flex-col gap-2 px-4 pb-4 max-h-72 overflow-y-auto custom-scroll min-h-[90px]'>
                            {searching && (
                                <p className='text-xs text-slate-500 text-center py-4'>Searching...</p>
                            )}
                            {!searching && searchEmail.trim().length > 0 && searchEmail.trim().length < 3 && (
                                <p className='text-xs text-slate-500 text-center py-4'>Type at least 3 characters</p>
                            )}
                            {!searching && searchEmail.trim().length >= 3 && searchResults.length === 0 && (
                                <div className='flex flex-col items-center gap-2 py-4 text-center'>
                                    <p className='text-xs text-slate-500'>No user found with this email</p>
                                    {isValidEmailFormat(searchEmail.trim()) && (
                                        <>
                                            <p className='text-xs text-slate-600'>This user is not on DevRoom yet</p>
                                            <button
                                                onClick={inviteByEmail}
                                                disabled={invitingEmail}
                                                className='flex items-center gap-2 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition'>
                                                {invitingEmail ? <><i className='ri-loader-4-line animate-spin'></i> Sending...</> : <><i className='ri-mail-send-line'></i> Invite via Email</>}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            {!searching && searchEmail.trim().length === 0 && (
                                <p className='text-xs text-slate-600 text-center py-4'>Start typing an email to search</p>
                            )}

                            {searchResults.map((u) => (
                                <div key={u._id} onClick={() => handleUserClick(u._id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${selectedUserId.has(u._id) ? 'bg-blue-900/50 border-blue-600' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}>
                                    <div className='w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0'><i className="ri-user-fill text-slate-300 text-sm"></i></div>
                                    <span className='text-sm text-slate-200'>{u.email}</span>
                                    {selectedUserId.has(u._id) && <i className='ri-check-fill text-blue-400 ml-auto'></i>}
                                </div>
                            ))}
                        </div>

                        <div className='px-4 py-3 border-t border-slate-700 flex justify-end gap-3'>
                            <button onClick={() => setIsModalOpen(false)} className='px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700'>Cancel</button>
                            <button onClick={inviteCollaborators} disabled={selectedUserId.size === 0}
                                className='px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition'>
                                Invite ({selectedUserId.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project