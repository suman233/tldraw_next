import {
    DefaultColorStyle,
    Editor,
    TLEditorComponents,
    Tldraw,
    toDomPrecision,
    useTransform,
  } from "@tldraw/tldraw";
  import React, { useRef, useState } from "react";
  import dayjs from "dayjs";
  import {
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
  } from "@mui/material";
  import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
  import { db, storage } from "@/firebase";
  import { v4 as uuidv4 } from "uuid";
  import { addDoc, collection, serverTimestamp } from "firebase/firestore";
  import { useRouter } from "next/router";
  // import {TLDrawColor} from '@/config/';
  type keyType = "inferDarkMode" | "hideUi";
  
  const components: TLEditorComponents = {
    Brush: function MyBrush({ brush }) {
      const rSvg = useRef<SVGSVGElement>(null);
  
      useTransform(rSvg, brush.x, brush.y);
  
      const w = toDomPrecision(Math.max(1, brush.w));
      const h = toDomPrecision(Math.max(1, brush.h));
  
      return (
        <svg ref={rSvg} className="tl-overlays__item">
          <rect
            className="tl-brush"
            stroke="red"
            fill="none"
            width={w}
            height={h}
          />
        </svg>
      );
    },
    Scribble: ({ scribble, opacity, color }) => {
      return (
        <svg className="tl-overlays__item">
          <polyline
            points={scribble.points.map((p) => `${p.x},${p.y}`).join(" ")}
            stroke={color ?? "black"}
            opacity={opacity ?? "1"}
            fill="none"
          />
        </svg>
      );
    },
    SnapIndicator: null,
    LoadingScreen: () => {
      return <div>Loading</div>;
    },
  };
  
  const Edit = ({ allDrawings }: any) => {
    const router =useRouter()
    const [config, setConfig] = useState({
      inferDarkMode: false,
      hideUi: false,
      snapshot: undefined,
    });
    const [editor, setEditor] = useState<Editor | null>(null);
    const [savedSnapshopts, setSavedSnapShot] = useState<any>([]);
  
    const handleConfigChange = (key: keyType) => {
      setConfig({
        ...config,
        [key]: !config[key],
      });
    };
  
    const handleStorage = async () => {
      const snapshot = editor?.store.getSnapshot();
      setSavedSnapShot([
        ...savedSnapshopts,
        {
          id: dayjs().toISOString(),
          data: snapshot,
        },
      ]);
    };
    // const handleColorChange = (color: string) => {
    //   editor?.setCurrentTool("draw");
    //   // StyleProp.defineEnum("tldraw:color", {
    //   //   defaultValue: color.hex,
    //   //   values: [color.hex]
    //   // });
    //   editor?.setStyleForNextShapes(DefaultColorStyle, color, {
    //     squashing: true,
    //   });
    // };
  
    const handleSaveSnapshot = async () => {
      const snapshot = editor?.store.getSnapshot();
      // if (editor !== null) alert("Please draw something");
        setSavedSnapShot([
          ...savedSnapshopts,
          {
            id: dayjs().toISOString(),
            data: snapshot,
          },
        ]);
  
        try {
          const imageRef = storageRef(storage, `images/${uuidv4()}`);
          await uploadBytes(imageRef, savedSnapshopts);
  
          const imageUrl = await getDownloadURL(imageRef);
  
          await addDoc(collection(db, "drawDatabase"), {
            imageUrl,
            createdAt: serverTimestamp(),
          });
  
          alert("drawing created successfully");
        } catch (error) {
          console.error("Error creating drawing:", error);
          alert("Failed to create drawings");
        }
      
    };
  
    return (
      <div>
        <div
          style={{
            position: "fixed",
            inset: 0,
            height: "80%",
            width: "100%",
            marginTop: "80px",
          }}
        >
          <Grid container>
            <Grid item md={2}>
              <Stack p={1} direction="column" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => handleConfigChange("inferDarkMode")}
                >
                  <span>Toggle Darkmode</span>
                </Button>
  
                <Button
                  variant="outlined"
                  onClick={() => handleConfigChange("hideUi")}
                >
                  <span>Show hide ui</span>
                </Button>
  
                <Button variant="outlined" onClick={() => handleSaveSnapshot()}>
                  <span>Save snapshots</span>
                </Button>
              </Stack>
            </Grid>
            <Grid item md={8} height="80vh">
              <Tldraw
                hideUi={config.hideUi}
                inferDarkMode={config.inferDarkMode}
                components={components}
                onMount={(e) => setEditor(e)}
                // onUiEvent={(e) => console.log(e, "ui events")}
              />
            </Grid>
            <Grid item md={2}>
              <Box>
                <Paper
                  sx={{
                    padding: "10px 20px",
                  }}
                >
                  <Typography color="black">
                    <b>Saved snapshots</b>
                  </Typography>
                  <Divider />
                  <Stack p={1}>
                    <Stack
                      direction="column"
                      justifyContent="start"
                      spacing={1}
                      flexWrap="wrap"
                      alignItems="start"
                    >
                      {savedSnapshopts?.map((snaps: any, index: number) => (
                        <Chip
                          label={`Project ${index + 1}`}
                          // dayjs(snaps.id).format("DD/MM/YYYY HH:mm:ss")
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setConfig({
                              ...config,
                              snapshot: snaps.data,
                            });
                            // router.push(`${router.pathname}/edit?snapshot=${snaps.id}`);
                            router.push(`/edit`);
                            editor?.store?.loadSnapshot(snaps?.data);
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  };
  
  export default Edit;  