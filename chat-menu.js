import { defineAsyncComponent } from "vue";
import { Chat } from "./chat.js";
import {
  groupChatSchema,
  renameSchema,
  participantsSchema,
  messageSchema,
} from "./schemas.js";
import { getParticipantList } from "./utils.js";
import { router } from "./index.js";

function createTimestamp(dateStr, hourStr, minuteStr, amPmStr) {
  if (!dateStr || !hourStr || !minuteStr || !amPmStr) return null;

  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (amPmStr === "PM" && hour !== 12) {
    hour += 12;
  } else if (amPmStr === "AM" && hour === 12) {
    hour = 0;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}
function waitUntilVisible(element, callback) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        callback();
      }
    },
    { threshold: 1.0 }
  );
  observer.observe(element);
}
export async function ChatMenu() {
  return {
    props: ["currentChatChannel", "groupChatObjects"],
    data() {
      const today = new Date().toISOString().split("T")[0];
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
        searching: false,

        fromDate: "2021-01-01",
        fromHour: "00",
        fromMinute: "00",
        fromAmPm: "AM",
        toDate: today,
        toHour: "11",
        toMinute: "59",
        toAmPm: "PM",
        goTo: "earliest", // "earliest" or "latest"
        keyword: "",
        similarWords: false,
        waitForSearch: false,
        searchMessage: "",
        messageFadingOut: false,
      };
    },
    computed: {
      actor() {
        return this.$graffitiSession.value.actor;
      },
    },
    methods: {
      getParticipantList,
      async search() {
        this.waitForSearch = true;
        const fromTimestamp = createTimestamp(
          this.fromDate,
          this.fromHour,
          this.fromMinute,
          this.fromAmPm
        );
        const toTimestamp = createTimestamp(
          this.toDate,
          this.toHour,
          this.toMinute,
          this.toAmPm
        );
        const messageObjectsIterator = await this.$graffiti.discover(
          [this.currentChatChannel],
          messageSchema
        );
        const newMessageObjects = [];
        for await (const { object } of messageObjectsIterator) {
          if (
            fromTimestamp <= object.value.published &&
            object.value.published <= toTimestamp
          ) {
            if (!this.keyword) {
              newMessageObjects.push(object);
            } else {
              if (object.value.content.toLowerCase().includes(this.keyword)) {
                newMessageObjects.push(object);
              }
            }
          }
        }
        const messageObjects = newMessageObjects;
        if (this.goTo === "earliest") {
          messageObjects.sort((a, b) => a.value.published - b.value.published);
        } else {
          messageObjects.sort((a, b) => b.value.published - a.value.published);
        }
        if (messageObjects.length === 0) {
          this.searchMessage = "No messages found in this time range.";
          this.messageFadingOut = false;
          // Let Vue render with .fade-in
          this.$nextTick(() => {
            setTimeout(() => {
              this.messageFadingOut = true;
            }, 2000);

            setTimeout(() => {
              this.searchMessage = "";
              this.messageFadingOut = false;
            }, 3000);
          });

          this.waitForSearch = false;
          return;
        }
        this.searchMessage = "";
        const targetMsg = messageObjects[0];
        const el = document.getElementById("message-" + targetMsg.url);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          //el.classList.add("highlighted");
          waitUntilVisible(el, () => {
            el.classList.add("highlighted");
            setTimeout(() => {
              el.classList.remove("highlighted");
            }, 500);
          });
        }

        //console.log("searching");
        //console.log("fromTimestamp", fromTimestamp);
        //console.log("toTimestamp", toTimestamp);
        //console.log("goTo", this.goTo);

        //console.log("keyword", this.keyword);
        //console.log("similarWords", this.similarWords);
        this.waitForSearch = false;
      },
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
        //router.push({ path: "/" });
      },

      async deleteChat(session) {
        if (!this.currentChatChannel) return;

        await this.$graffiti.delete(session);
      },
    },

    template: await fetch("./chat-menu.html").then((r) => r.text()),
  };
}
