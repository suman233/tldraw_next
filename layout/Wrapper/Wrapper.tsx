'use client';
import React from "react";
import Header from "../Header/Header";
import { Box } from "@mui/material";
import Footer from "../Footer/Footer";
import { useUser } from "@/pages/login";
import { useRouter } from "next/router";

interface wrapperprops {
  children: JSX.Element | JSX.Element[];
}
const Wrapper = (props: wrapperprops) => {
  const { children } = props;
  const router=useRouter()

  const user = useUser();
  if (user === false) return <>loading</>;
  if (!user) {
    router.push("/login");
    
  } else {
    return (
      <>
        <Header />
        <Box height={"auto"} className="body_content">
          {children}
        </Box>
        {/* <Footer /> */}
      </>
    );
  }
};

export default Wrapper;
