import { defineAsyncComponent } from "vue";
import { useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { ChatList } from "./chat-list.js";
import { Message } from "./message.js";
import { ChatMenu } from "./chat-menu.js";

const renameSchema = {
  properties: {
    name: { type: "string" },
    describes: { type: "string" },
  },
};

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

const messageSchema = {
  properties: {
    value: {
      required: ["content", "published"],
      properties: {
        content: { type: "string" },
        published: { type: "number" },
      },
    },
  },
};

export async function Chat() {
  return {
    props: ["channel"],
    components: {
      ChatList: defineAsyncComponent(ChatList),
      Message: defineAsyncComponent(Message),
      ChatMenu: defineAsyncComponent(ChatMenu),
    },
    data() {
      return {
        myMessage: "",
        sending: false,
        showRenameForm: false,
        renameSchema: renameSchema,
        groupChatSchema: groupChatSchema,
        messageSchema: messageSchema,
        showMenu: false,
      };
    },

    methods: {
      async sendMessage(session) {
        if (!this.myMessage || !this.channel) return;
        this.sending = true;
        //await new Promise((resolve) => setTimeout(resolve, 1000));

        await this.$graffiti.put(
          {
            activity: "Create",
            value: {
              content: this.myMessage,
              published: Date.now(),
              editing: false,
              editContent: "",
            },
            channels: [this.channel],
          },
          session
        );

        this.sending = false;
        this.myMessage = "";

        // Refocus the input field after sending the message
        await this.$nextTick();
        this.$refs.messageInput.focus();
      },

      async deleteMessage(message) {
        await this.$graffiti.delete(message, this.$graffitiSession.value);
      },

      startEditing(message) {
        message.value.editing = true;
        message.value.editContent = message.value.content;
      },

      async updateMessage(message, session) {
        await this.$graffiti.patch(
          {
            value: [
              {
                op: "replace",
                path: "/content",
                value: message.value.editContent,
              },
            ],
          },
          message,
          session
        );
        message.value.editing = false;
        message.value.editContent = "";
      },
    },
    template: await fetch("./chat.html").then((r) => r.text()),
  };
}
