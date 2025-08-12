export const updateLastSeen = async (req, res) => {
    const { fileId, type } = req.body

    try {
        const message = await updateLastSeenFn(fileId, type)
        return res.status(201).json({ message: message })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const getLastseen = async (req, res) => {
    const { userId } = req.query;

    try {
        const message = await getLastOpenedFiles(userId)
        return res.status(200).json({ message: message })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}