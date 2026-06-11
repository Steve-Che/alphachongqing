"use client";

import { releaseResidenceAction } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";

export function ReleaseResidenceButton() {
  return (
    <form
      action={releaseResidenceAction}
      className="mt-4"
      onSubmit={(e) => {
        if (
          !confirm(
            "确定要释放当前地盘吗？\n\n释放后：店铺将被删除（含留言与房间内容），公寓将退租。\n\n若只想换址，请使用「搬家」功能，内容可保留。",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        释放当前地盘
      </Button>
    </form>
  );
}
