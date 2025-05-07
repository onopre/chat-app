import { defineAsyncComponent } from "vue";
import { Chat } from "./chat.js";
import { groupChatSchema } from "./schemas.js";
import { renameSchema } from "./schemas.js";
import { participantsSchema } from "./schemas.js";
import { getParticipantList } from "./utils.js";

export async function ChatMenu() {
  return {
    props: ["currentChatChannel"],
    data() {
      return {
        renameText: "",
        inviteeActor: "",
        showRenameForm: false,
        showInviteForm: false,
        showParticipantList: false,
        channels: ["designftw"],
        groupChatSchema: groupChatSchema,
        renameSchema: renameSchema,
        participantsSchema: participantsSchema,
      };
    },
    computed: {
      actor() {
        return this.$graffitiSession.value.actor;
      },
    },
    methods: {
      getParticipantList,
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

        this.renameText = "";
        this.showRenameForm = false;
      },
      async inviteUser(session, inviteeActor) {
        if (!inviteeActor || !this.currentChatChannel) return;
        await this.$graffiti.put(
          {
            value: {
              activity: "Add",
              actor: inviteeActor,
              chatChannel: this.currentChatChannel,
              timestamp: Date.now(),
            },
            channels: [this.currentChatChannel],
          },
          session
        );
        this.showInviteForm = false;
        this.inviteeActor = "";
      },

      async leaveChat(session) {
        if (!this.currentChatChannel) return;
        await this.$graffiti.put(
          {
            value: {
              activity: "Leave",
              actor: this.actor,
              chatChannel: this.currentChatChannel,
              timestamp: Date.now(),
            },
            channels: [this.currentChatChannel],
          },
          session
        );
        this.showInviteForm = false;
      },

      async deleteChat(session) {
        if (!this.currentChatChannel) return;

        await this.$graffiti.delete(session);
      },
    },

    template: await fetch("./chat-menu.html").then((r) => r.text()),
  };
}
