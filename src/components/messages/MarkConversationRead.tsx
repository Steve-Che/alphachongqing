"use client";

import { useEffect } from "react";
import { markConversationRead } from "@/app/actions/messages";

export function MarkConversationRead({
  conversationId,
}: {
  conversationId: string;
}) {
  useEffect(() => {
    markConversationRead(conversationId).catch(() => {
      /* ignore */
    });
  }, [conversationId]);

  return null;
}
