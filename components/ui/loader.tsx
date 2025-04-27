import React from "react";
import Image from "next/image";
import GIF from "@/public/loading.gif";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <Image src={GIF.src} alt="Loading Indicator" width={50} height={50} />
    </div>
  );
};

export default Loader;
