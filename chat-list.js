import { groupChatSchema } from "./schemas.js";
import { renameSchema } from "./schemas.js";

export async function ChatList() {
  return {
    props: ["currentChatChannel"],
    data() {
      return {
        groupChatSchema: groupChatSchema,
        renameSchema: renameSchema,
        channels: ["designftw"],
      };
    },

    template: await fetch("./chat-list.html").then((r) => r.text()),
  };
}
