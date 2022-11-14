import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import loadingAnimation from "../public/dashpaint/animations/loadingAnimation.gif";
import Image from "next/image";
import DashPaintPage from "../src/components/DashPaintPage";

export default function IndexPage() {
  return <DashPaintPage></DashPaintPage>;
}

