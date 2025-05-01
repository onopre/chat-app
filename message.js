import { defineAsyncComponent } from "vue";
import { MessageActions } from "./message-actions.js";

export async function Message() {
  return {
    props: ["object"],
    components: {
      MessageActions: defineAsyncComponent(MessageActions),
    },
    data() {
      return {};
    },
    methods: {
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

    template: await fetch("./message.html").then((r) => r.text()),
  };
}
