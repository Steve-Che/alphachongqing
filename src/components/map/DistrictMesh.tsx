"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { DistrictGeo } from "@/lib/chongqing/geo";
import { SketchEdges, ToonFaceMaterial } from "./sketchup-materials";

const PLATE_Y = 0.2;
const EXTRUDE_DEPTH = 0.35;

type DistrictMeshProps = {
  district: DistrictGeo;
  hovered?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
};

function buildShape(boundary: DistrictGeo["boundary"]) {
  const shape = new THREE.Shape();
  boundary.forEach((p, i) => {
    if (i === 0) shape.moveTo(p.x, p.z);
    else shape.lineTo(p.x, p.z);
  });
  shape.closePath();
  return shape;
}

export function DistrictMesh({
  district,
  hovered = false,
  highlighted = false,
  dimmed = false,
}: DistrictMeshProps) {
  const shape = useMemo(() => buildShape(district.boundary), [district.boundary]);
  const active = hovered || highlighted;
  const color = dimmed ? "#b8b0a4" : district.color;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, PLATE_Y, 0]}
        renderOrder={2}
        raycast={() => null}
      >
        <extrudeGeometry args={[shape, { depth: EXTRUDE_DEPTH, bevelEnabled: false }]} />
        <ToonFaceMaterial
          color={color}
          emissive={active ? "#3a3020" : "#000000"}
          emissiveIntensity={active ? 0.25 : dimmed ? 0 : 0.05}
        />
        <SketchEdges />
      </mesh>
    </group>
  );
}
