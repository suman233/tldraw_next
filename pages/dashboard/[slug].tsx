import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  Box,
  Button,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "green",
          color: "white",
          "&:hover": {
            backgroundColor: "darkgreen",
          },
        },
      },
    },
  },
});

interface DrawingPost {
  imageUrl: string;
  title: string;
  content: string;
  createdAt: number;
  id: string;
}
interface Comment {
  text: string;
  createdAt: number;
  id: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [drawings, setDrawings] = useState<DrawingPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");

  useEffect(() => {
    const fetchDrawings = async () => {
      if (typeof slug === "string") {
        const drawDoc = doc(db, "drawdb", slug);
        const docSnap = await getDoc(drawDoc);
        console.log(docSnap?.id, "docSnap test");
        if (docSnap.exists()) {
          const data = docSnap.data() as DrawingPost;

          setDrawings({
            ...data,
            createdAt: docSnap.data().createdAt.toMillis(),
            id: docSnap.id,
          });
        }
      }
    };

    fetchDrawings();
  }, [slug]);

  useEffect(() => {
    if (drawings) {
      const commentsQuery = query(
        collection(db, "comments"),
        orderBy("createdAt", "desc"),
        where("postId", "==", slug)
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const commentsData: Comment[] = [];
        snapshot.forEach((doc) => {
          console.log(doc, "docc test");
          commentsData.push({ ...(doc.data() as Comment), id: doc.id });
        });
        setComments(commentsData);
      });

      return () => unsubscribe();
    }
  }, [slug]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      return;
    }

    await addDoc(collection(db, "comments"), {
      postId: slug,
      text: commentText,
      createdAt: new Date().getTime(),
    });

    setCommentText("");
  };

  if (!drawings) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      component="form"
      gap={1}
      display="flex"
      flexDirection="column"
      justifyContent={"space-evenly"}
      sx={{ width: "80%", margin: " 50px auto", paddingTop: "50px" }}
    >
      <img src={drawings.imageUrl} alt="" style={{ maxWidth: "100%" }} />
      <Typography variant="h1">{drawings.title}</Typography>
      <Typography>
        Created at: {new Date(drawings.createdAt).toLocaleString()}
      </Typography>
      <Box mt={4}>
        <Typography variant="h4">Comments</Typography>
        {comments.map((comment, index) => (
          <Box key={index} mb={2}>
            <Typography>{comment.text}</Typography>
          </Box>
        ))}
        <Box mt={2} gap={1}>
          <TextField
            label="Add a comment"
            variant="outlined"
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button variant="contained" onClick={handleCommentSubmit}>
            Add Comment
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
