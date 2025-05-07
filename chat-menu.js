import { defineAsyncComponent } from "vue";
import { Chat } from "./chat.js";
import { groupChatSchema } from "./schemas.js";
import { renameSchema } from "./schemas.js";

export async function ChatMenu() {
  return {
    props: ["currentChatChannel"],
    data() {
      return {
        currentChatName: "",
        inviteeActor: "",
        showRenameForm: false,
        showInviteForm: false,
        showParticipantList: false,
        channels: ["designftw"],
        groupChatSchema: groupChatSchema,
        renameSchema: renameSchema,
      };
    },
    methods: {
      async renameGroup(session) {
        if (!this.renameText || !this.currentChatChannel) return;

        await this.$graffiti.put(
          {
            value: {
              name: this.renameText,
              describes: this.currentChatChannel,
            },
            channels: [this.currentChatChannel],
          },
          session
        );

        await this.$graffiti.put(
          {
            value: {
              name: this.renameText,
              describes: this.currentChatChannel,
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
        if (!participants || !this.currentChatChannel) return;

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
                channel: this.currentChatChannel,
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
                channel: this.currentChatChannel,
                participants: participants,
              },
            },
            channels: [this.currentChatChannel],
            allowed: participants,
          },
          session
        );
        this.showInviteForm = false;
        this.inviteeActor = "";
      },

      async leaveChat(session, participants) {
        if (!participants || !this.currentChatChannel) return;

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
                channel: this.currentChatChannel,
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
                channel: this.currentChatChannel,
                participants: participants,
              },
            },
            channels: [this.currentChatChannel],
            allowed: participants,
          },
          session
        );
        this.showInviteForm = false;
        this.inviteeActor = "";
      },

      async deleteChat(session) {
        if (!this.currentChatChannel) return;

        await this.$graffiti.delete(session);
      },
    },

    template: await fetch("./chat-menu.html").then((r) => r.text()),
  };
}
