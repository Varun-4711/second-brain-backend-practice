import express,{Request,Response} from "express";
import jwt from "jsonwebtoken";
import {z} from "zod";
import { User } from "./db";
import middlewareAuth from "./middleware";
import { Tag } from "./db";
import { Content } from "./db";

const router = express.Router();
const SECRET_KEY:string= process.env.SECRET_KEY as string;

// Zod schema for input validation
const signupSchema = z.object({
  username: z.string().min(3).max(10),
  password: z
    .string()
    .min(8)
    .max(20)
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[!@#$%^&*(),.?\":{}|<>]/, "Must include at least one special character"),
});

//signup end point
router.post("/signup", async (req:any, res:any) => {
    try {
      // Validating the request body
      const parsedData = signupSchema.parse(req.body);
  
      const { username, password } = parsedData;
  
      // Checking if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(403).send("User already exists with this username");
      }
  
      // Save the user to the database
      const newUser = new User({ username, password });
      await newUser.save();
  
      res.status(200).send("Signed up");
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Input validation error
        return res.status(411).json({ error: err.errors });
      }
  
      console.error(err);
      res.status(500).send("Server error");
    }
  });

//signin end point
router.post("/signin", async (req:any, res:any) => {
    try {
      const { username, password } = req.body;
  
      // Finding the user by username
      const user = await User.findOne({ username });
      if (!user || user.password !== password) {
        return res.status(403).send("Wrong username or password");
      }
  
      // Generating the JWT token
      const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY);
  
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  });

//Creating a new content
router.post("/content", middlewareAuth, async (req:any, res:any) => {
  try {
    const { type, link, title, tags } = req.body;

    // Validation
    if (!type || !link || !title || !Array.isArray(tags)) {
      return res.status(400).send("Missing or invalid input fields");
    }

    // Validating the content type
    const contentTypes = ["image", "video", "article", "audio"];
    if (!contentTypes.includes(type)) {
      return res.status(400).send("Invalid content type");
    }

    // Handling tags
    const tagIds = [];
    for (const tagTitle of tags) {
      let tag = await Tag.findOne({ title: tagTitle });
      if (!tag) {
        tag = new Tag({ title: tagTitle });
        await tag.save();
      }
      tagIds.push(tag._id);
    }

    // Creating content
    const content = new Content({
      type,
      link,
      title,
      tags: tagIds,
      userId: req.id,
    });
    await content.save();

    res.status(201).send({ message: "Content created successfully", content });
  } catch (err) {
    console.error("Error in /api/v1/content:", err);
    res.status(500).send("Internal server error");
  }
});

//Getting the content
router.get("/content", middlewareAuth, async (req: Request, res: Response) => {
  try {
    // Fetch content for the authenticated user
    //@ts-ignore
    const userId = req.id; // Set by the middlewareAuth
    const contentList = await Content.find({ userId }).populate("tags");

    // Format response
    const formattedContent = contentList.map((content) => ({
      id: content._id,
      type: content.type,
      link: content.link,
      title: content.title,
      tags: content.tags.map((tag: any) => tag.title), // Extract tag titles
    }));

    res.status(200).json({ content: formattedContent });
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).send("Internal server error");
  }
});

//Deleting the complete content based on its id
router.delete("/content", middlewareAuth, async (req: any, res: any) => {
  try {
    const { contentId } = req.body;

    if (!contentId) {
      return res.status(400).send("Content ID is required");
    }

    // Finding the content by ID
    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).send("Content not found");
    }

    // Checking the ownership
    //@ts-ignore
    if (content.userId.toString() !== req.id) {
      return res.status(403).send("Trying to delete a document you don’t own");
    }

    // Delete the document
    await Content.findByIdAndDelete(contentId);

    res.status(200).send("Delete succeeded");
  } catch (err) {
    console.error("Error deleting content:", err);
    res.status(500).send("Internal server error");
  }
});

// Creating a shareable link for the second brain
router.post("/brain/share", middlewareAuth, async (req: any, res: any) => {
  try {
    const { share } = req.body;

    if (typeof share !== "boolean") {
      return res.status(400).send("Invalid input: 'share' must be a boolean");
    }

    if (share) {
      // Generating a shareable link (mocked as a static link for simplicity now)
      const link = `https://secondbrain.example.com/share/${req.id}`;
      return res.status(200).json({ link });
    } else {
      return res.status(400).send("Sharing is disabled");
    }
  } catch (err) {
    console.error("Error creating shareable link:", err);
    res.status(500).send("Internal server error");
  }
});

// Fetch another user's shared brain content
router.get("/brain/:shareLink", async (req: any, res: any) => {
  try {
    const { shareLink } = req.params;

    if (!shareLink) {
      return res.status(400).send("Share link is required");
    }

    // Extracting user ID from the share link (mocking logic)
    const userId = shareLink.split("/").pop(); // Assuming userId is the last part of the link

    if (!userId) {
      return res.status(404).send("Invalid share link");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("Invalid share link or user not found");
    }

    // Fetching content for the user
    const contentList = await Content.find({ userId }).populate("tags");

    // Formatting the response
    const formattedContent = contentList.map((content) => ({
      id: content._id,
      type: content.type,
      link: content.link,
      title: content.title,
      tags: content.tags.map((tag: any) => tag.title),
    }));

    res.status(200).json({ username: user.username, content: formattedContent });
  } catch (err) {
    console.error("Error fetching shared brain content:", err);
    res.status(500).send("Internal server error");
  }
});


export default router;