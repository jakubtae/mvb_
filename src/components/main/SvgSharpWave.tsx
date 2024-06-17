"use client";
import React from "react";

interface SvgComponentProps {
  rectFill: string;
  pathFill: string;
}

const SvgSharpWave: React.FC<SvgComponentProps> = ({ rectFill, pathFill }) => {
  return (
    <svg
      id="visual"
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
    >
      <rect x="0" y="0" width="1920" height="1080" fill={rectFill}></rect>
      <path
        d="M1604 1080L1268 926L1680 771L1375 617L1523 463L1400 309L1248 154L1568 0L1920 0L1920 154L1920 309L1920 463L1920 617L1920 771L1920 926L1920 1080Z"
        fill={pathFill}
        strokeLinecap="square"
        strokeLinejoin="bevel"
      ></path>
    </svg>
  );
};

export default SvgSharpWave;
