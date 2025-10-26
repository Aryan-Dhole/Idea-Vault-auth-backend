import express from "express";
import Idea from "../models/Idea.js";
import { protect } from "../middleware/authMiddleware.js";

const router1 = express.Router()

//Create Idea
router1.post("/", protect, async (req, res) => {
    try {
        const { title, description } = req.body;
        const newIdea = new Idea({ user: req.user.id, title, description });
        await newIdea.save();
        res.status(201).json(newIdea);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
})


//Get user Idea
router1.get("/", protect, async (req, res) => {
    try {
        const ideas = await Idea.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(ideas);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});


// Update idea
router1.put("/:id", protect, async (req, res) => {
    try {
        const { title, description } = req.body;
        const idea = await Idea.findById(req.params.id);

        if (!idea) return res.status(404).json({ error: "Idea not found" });
        if (idea.user.toString() !== req.user.id)
            return res.status(403).json({ error: "Not authorized" });

        idea.title = title || idea.title;
        idea.description = description || idea.description;

        const updatedIdea = await idea.save();
        res.status(200).json(updatedIdea);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

//Delete Idea
router1.delete("/:id", protect, async (req, res) => {
    console.log("DELETE hit:", req.params.id);
    console.log("User from token:", req.user.id);

    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            console.log("No idea found");
            return res.status(404).json({ error: "Idea not found" });
        }

        if (idea.user.toString() !== req.user.id) {
            console.log("Not authorized:", idea.user.toString(), req.user.id);
            return res.status(403).json({ error: "Not authorized" });
        }

        await Idea.findByIdAndDelete(req.params.id);
        console.log("Deleted successfully");
        res.status(200).json({ message: "Idea deleted successfully" });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


export default router1
