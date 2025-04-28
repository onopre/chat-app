import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

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

createApp({
  data() {
    return {
      myMessage: "",
      sending: false,
      channels: ["designftw"],
      creatingChat: false,
      showCreateForm: false,
      chatName: "",
      selectedChannel: null,
      renameText: "",
      currentChatName: "",
      showRenameForm: false,
      showRightSidebar: false,
      allowedActors: "",
      renameSchema: renameSchema,
      groupChatSchema: groupChatSchema,
      showParticipantList: false,
      inviteeActor: "",
      showInviteForm: false,
    };
  },

  methods: {
    async sendMessage(session) {
      if (!this.myMessage || !this.selectedChannel) return;

      this.sending = true;

      await this.$graffiti.put(
        {
          value: {
            content: this.myMessage,
            published: Date.now(),
            editing: false,
            editContent: "",
          },
          channels: [this.selectedChannel],
        },
        session
      );

      this.sending = false;
      this.myMessage = "";

      // Refocus the input field after sending the message
      await this.$nextTick();
      this.$refs.messageInput.focus();
    },

    async createChat(session) {
      if (!this.chatName) return;

      this.creatingChat = true;
      const channel = crypto.randomUUID();
      const participants = this.allowedActors
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
      if (!participants.includes(this.$graffitiSession.value.actor)) {
        participants.push(this.$graffitiSession.value.actor);
      }

      await this.$graffiti.put(
        {
          value: {
            activity: "Create",
            object: {
              type: "Group Chat",
              name: this.chatName,
              channel: channel,
              participants: participants,
            },
          },
          channels: this.channels,
          allowed: participants,
        },
        session
      );

      await this.$graffiti.put(
        {
          value: {
            activity: "Create",
            object: {
              type: "Group Chat",
              name: this.chatName,
              channel: channel,
              participants: participants,
            },
          },
          channels: [channel],
          allowed: participants,
        },
        session
      );

      this.currentChatName = this.chatName;
      this.creatingChat = false;
      this.chatName = "";
      this.selectedChannel = channel;
      this.allowedActors = "";
      this.showCreateForm = false;
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

    async renameGroup(session) {
      if (!this.renameText || !this.selectedChannel) return;

      await this.$graffiti.put(
        {
          value: {
            name: this.renameText,
            describes: this.selectedChannel,
          },
          channels: [this.selectedChannel],
        },
        session
      );

      await this.$graffiti.put(
        {
          value: {
            name: this.renameText,
            describes: this.selectedChannel,
          },
          channels: this.channels,
        },
        session
      );

      this.currentChatName = this.renameText;
      this.renameText = "";
      this.showRenameForm = false;
    },
    async inviteUser(session, participants) {
      if (!participants || !this.selectedChannel) return;

      if (!participants.includes(this.inviteeActor)) {
        participants.push(this.inviteeActor);
      }
      await this.$graffiti.put(
        {
          value: {
            activity: "Add",
            object: {
              type: "Group Chat",
              name: this.currentChatName,
              channel: this.selectedChannel,
              participants: participants,
            },
          },
          channels: this.channels,
          allowed: participants,
        },
        session
      );

      await this.$graffiti.put(
        {
          value: {
            activity: "Add",
            object: {
              type: "Group Chat",
              name: this.currentChatName,
              channel: this.selectedChannel,
              participants: participants,
            },
          },
          channels: [this.selectedChannel],
          allowed: participants,
        },
        session
      );
      this.showInviteForm = false;
      this.inviteeActor = "";
    },

    async leaveChat(session, participants) {
      if (!participants || !this.selectedChannel) return;

      participants = participants.filter(
        (p) => p !== this.$graffitiSession.value.actor
      );
      await this.$graffiti.put(
        {
          value: {
            activity: "Add",
            object: {
              type: "Group Chat",
              name: this.currentChatName,
              channel: this.selectedChannel,
              participants: participants,
            },
          },
          channels: this.channels,
          allowed: participants,
        },
        session
      );

      await this.$graffiti.put(
        {
          value: {
            activity: "Add",
            object: {
              type: "Group Chat",
              name: this.currentChatName,
              channel: this.selectedChannel,
              participants: participants,
            },
          },
          channels: [this.selectedChannel],
          allowed: participants,
        },
        session
      );
      this.showInviteForm = false;
      this.inviteeActor = "";
    },
  },
})
  .use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
    //graffiti: new GraffitiRemote(),
  })
  .mount("#app");
