import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js';
import { authUser } from '../middleware/auth.middleware.js'
import Project from '../models/project.model.js'


const router = Router();


router.post('/create',
    authMiddleWare.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
)


router.get('/all',
    authMiddleWare.authUser, projectController.getAllProject
)

router.put('/add-user',
    authMiddleWare.authUser,
    body('projectId')
        .notEmpty().withMessage('Project ID is required')
        .isMongoId().withMessage('Project ID must be a valid MongoDB ObjectId'),
    body('users')
        .isArray({ min: 1 }).withMessage('Users must be an array of user IDs'),
    body('users.*')
        .notEmpty().withMessage('Each user ID is required')
        .isMongoId().withMessage('Each user must be a valid MongoDB ObjectId'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectById
)

router.put('/update-file-tree',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
)

router.get('/ai-queries-today', authUser, async (req, res) => {
    try {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const projects = await Project.find({ users: req.user._id })

        let count = 0
        projects.forEach(proj => {
            proj.messages.forEach(msg => {
                if (
                    msg.sender?._id === 'ai' &&
                    new Date(msg.createdAt) >= startOfDay
                ) {
                    count++
                }
            })
        })

        res.json({ count })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch AI queries' })
    }
})

router.delete('/:projectId',
    authMiddleWare.authUser,
    projectController.deleteProject)


router.post('/invite',
    authMiddleWare.authUser,
    body('projectId')
        .notEmpty().withMessage('Project ID is required')
        .isMongoId().withMessage('Project ID must be a valid MongoDB ObjectId'),
    body('userIds')
        .isArray({ min: 1 }).withMessage('userIds must be a non-empty array'),
    body('userIds.*')
        .isMongoId().withMessage('Each userId must be a valid MongoDB ObjectId'),
    projectController.inviteUsers
)


router.post('/invite-email',
    authMiddleWare.authUser,
    body('projectId')
        .notEmpty().withMessage('Project ID is required')
        .isMongoId().withMessage('Project ID must be a valid MongoDB ObjectId'),
    body('email')
        .isEmail().withMessage('Valid email is required'),
    projectController.inviteByEmailController
)


router.get('/invites/pending',
    authMiddleWare.authUser,
    projectController.getPendingInvites
)

router.put('/invites/respond',
    authMiddleWare.authUser,
    body('projectId')
        .notEmpty().withMessage('Project ID is required')
        .isMongoId().withMessage('Project ID must be a valid MongoDB ObjectId'),
    body('action')
        .isIn(['accept', 'reject']).withMessage("action must be 'accept' or 'reject'"),
    projectController.respondInvite
)

router.delete('/:projectId/leave',
    authMiddleWare.authUser,
    projectController.leaveProjectController
)

export default router;