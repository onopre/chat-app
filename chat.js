import { defineAsyncComponent } from "vue";
import { useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { ChatList } from "./chat-list.js";
import { Message } from "./message.js";
import { ChatMenu } from "./chat-menu.js";
import { groupChatSchema } from "./schemas.js";
import { renameSchema } from "./schemas.js";
import { messageSchema } from "./schemas.js";

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
        const now = new Date();
        await this.$graffiti.put(
          {
            activity: "Create",
            value: {
              content: this.myMessage,
              //published: Date.now(),
              published: new Date(
                now.getFullYear(),
                1, // February (month is 0-indexed)
                17,
                10,
                now.getMinutes(),
                now.getSeconds(),
                now.getMilliseconds()
              ).getTime(),
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
    },
    template: await fetch("./chat.html").then((r) => r.text()),
  };
}
