import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';
import Project from '../models/project.model.js';


export const createProject = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    try {

        const { name } = req.body;
        const userId = req.user._id;

        const newProject = await projectService.createProject({ name, userId });

        res.status(201).json(newProject);
    } catch (err) {
        console.log(err);

        if (err.code === 11000) {
            return res.status(400).json({ message: 'Project name already exists' });
        }
        res.status(400).json({ message: err.message });
    }

}

export const getAllProject = async (req, res) => {
    try {
        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: req.user._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}



export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        const updatedProject = await projectService.addUsersToProject({
            projectId,
            users,
            userId: req.user._id
        });

        return res.status(200).json(updatedProject);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}


export const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await projectService.getProjectById({
            projectId
        });

        return res.status(200).json({
            project
        })


    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findByIdAndDelete(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                messages: "Project Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const inviteUsers = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { projectId, userIds } = req.body;
        const result = await projectService.inviteUsersToProject({
            projectId,
            targetUserIds: userIds,
            inviter: req.user
        });
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}

export const getPendingInvites = async (req, res) => {
    try {
        const invites = await projectService.getMyPendingInvites({ userId: req.user._id })
        return res.status(200).json({ invites })
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const respondInvite = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { projectId, action } = req.body;
        const project = await projectService.respondToInvite({
            projectId,
            userId: req.user._id,
            action
        })
        return res.status(200).json({ project })
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const leaveProjectController = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectService.leaveProject({
            projectId,
            userId: req.user._id
        })
        return res.status(200).json({ project })
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}


export const inviteByEmailController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { projectId, email } = req.body
        const result = await projectService.inviteByEmail({ projectId, email, inviter: req.user })
        return res.status(200).json(result)
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}
