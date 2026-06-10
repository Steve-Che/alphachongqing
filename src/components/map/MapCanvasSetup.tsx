"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/** 避免 WebGL canvas 抢占键盘焦点，减少与浏览器扩展的 keydown 冲突 */
export function MapCanvasSetup() {
  const domElement = useThree((s) => s.gl.domElement);

  useEffect(() => {
    const el = domElement;
    // WebGL canvas DOM 属性需在挂载后设置，避免抢占键盘焦点
    el.setAttribute("tabindex", "-1");
    el.style.setProperty("outline", "none");

    const releaseFocus = () => {
      requestAnimationFrame(() => {
        if (document.activeElement === el) el.blur();
      });
    };

    el.addEventListener("pointerdown", releaseFocus);
    return () => el.removeEventListener("pointerdown", releaseFocus);
  }, [domElement]);

  return null;
}
