import { lockFilesFn, unlockFiles, unlockFolderFn } from "../services/lock.service.js"

export const lockFile = async (req, res) => {
    const { password, fileId } = req.body

    try {
        const message = await lockFilesFn(password, fileId)
        return res.status(201).json({ message: message })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const unlockFile = async (req, res) => {
    const { fileId } = req.body

    try {
        const message = await unlockFiles(fileId)
        return res.status(201).json({ message: message })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const lockFolder = async (req, res) => {
    const { password, folderId } = req.body

    try {
        const message = await lockFilesFn(password, folderId)
        return res.status(201).json({ message: message })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const unlockFolder = async (req, res) => {
    const { folderId } = req.body

    try {
        const message = await unlockFolderFn(folderId)
        return res.status(201).json({ message: message })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}