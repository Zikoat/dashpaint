import React from "react";
import loadingAnimation from "../../public/dashpaint/animations/loadingAnimation.gif";
import Image from "next/image";

export function LoadingPage() {
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                }}
            >
                <Image
                    src={loadingAnimation}
                    alt="loading..."
                    width={40}
                    style={{
                        imageRendering: "pixelated",
                        height: "3rem",
                    }} />
            </div>
        </>
    );
}
