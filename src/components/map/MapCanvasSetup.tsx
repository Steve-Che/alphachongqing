"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/** 避免 WebGL canvas 抢占键盘焦点，减少与浏览器扩展的 keydown 冲突 */
export function MapCanvasSetup() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const el = gl.domElement;
    el.tabIndex = -1;
    el.style.outline = "none";

    const releaseFocus = () => {
      requestAnimationFrame(() => {
        if (document.activeElement === el) el.blur();
      });
    };

    el.addEventListener("pointerdown", releaseFocus);
    return () => el.removeEventListener("pointerdown", releaseFocus);
  }, [gl]);

  return null;
}
