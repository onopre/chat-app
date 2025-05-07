import {
  groupChatSchema,
  renameSchema,
  participantsSchema,
} from "./schemas.js";
import { getParticipantList } from "./utils.js";

export async function ChatList() {
  return {
    props: ["currentChatChannel"],
    data() {
      return {
        groupChatSchema: groupChatSchema,
        renameSchema: renameSchema,
        participantsSchema: participantsSchema,
        channels: ["designftw"],
      };
    },
    methods: {
      getParticipantList,
    },

    template: await fetch("./chat-list.html").then((r) => r.text()),
  };
}

//v-for="object of groupChatObjects.sort((a, b) => b.lastModified - a.lastModified).filter(c => getParticipantList(c, participantObjects).includes($graffitiSession.value.actor))"
