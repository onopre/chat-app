import { defineAsyncComponent } from "vue";
import { Chat } from "./chat.js";

const groupChatSchema = {
  properties: {
    value: {
      required: ["object"],
      properties: {
        object: {
          required: ["name", "channel", "participants"],
          properties: {
            name: { type: "string" },
            channel: { type: "string" },
            participants: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  },
};

const renameSchema = {
  properties: {
    name: { type: "string" },
    describes: { type: "string" },
  },
};

export async function ChatList() {
  return {
    props: ["currentChatChannel"],
    data() {
      return {
        selectedChat: null,
        groupChatSchema: groupChatSchema,
        renameSchema: renameSchema,
        channels: ["designftw"],
        currentChatName: "",
      };
    },

    template: await fetch("./chat-list.html").then((r) => r.text()),
  };
}
