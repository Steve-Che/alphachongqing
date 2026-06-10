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
            "确定要释放当前地盘吗？店铺、留言与房间内容将被删除，此操作不可撤销。",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        释放当前地盘（店铺或公寓）
      </Button>
    </form>
  );
}
