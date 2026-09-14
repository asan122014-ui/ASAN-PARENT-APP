// src/components/SplashScreen.jsx

import { motion } from "framer-motion";
import splashScreen from "../assets/splashscreen.png";

function SplashScreen() {
  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        h-screen
        w-screen
        items-center
        justify-center
        overflow-hidden
        bg-white
      "
    >
      <motion.img
        src={splashScreen}
        alt="Asanrides"
        className="
          h-full
          w-full
          object-cover
        "
        initial={{
          opacity: 0,
          scale: 1.02,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
        draggable={false}
      />
    </div>
  );
}

export default SplashScreen;