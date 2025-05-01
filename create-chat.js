import { defineAsyncComponent } from "vue";
import { ChatList } from "./chat-list.js";
import { useFriends } from "./utils.js";

export async function CreateChat() {
  return {
    props: [],
    components: {
      ChatList: defineAsyncComponent(ChatList),
    },
    data() {
      return {
        creatingChat: false,
        chatName: "",
        participants: [],
        participantQuery: "",
        channels: ["designftw"],
        selectedChannel: null,
        currentChatName: "",
      };
    },
    setup() {
      const { accepted } = useFriends();
      return {
        friends: accepted,
      };
    },
    computed: {
      filteredFriends() {
        const q = this.participantQuery.toLowerCase();
        return this.friends.filter(
          (f) => f.toLowerCase().includes(q) && !this.participants.includes(f)
        );
      },
    },
    methods: {
      async createChat(session) {
        if (!this.chatName || !this.participants) return;
        this.creatingChat = true;

        const channel = crypto.randomUUID();
        //const participants = this.participants
        //  .split(",")
        //  .map((a) => a.trim())
        //  .filter((a) => a.length > 0);
        //if (!participants.includes(this.$graffitiSession.value.actor)) {
        //  participants.push(this.$graffitiSession.value.actor);
        //}
        const participants = [...this.participants];
        if (!participants.includes(this.$graffitiSession.value.actor)) {
          participants.push(this.$graffitiSession.value.actor);
        }
        const channels = [...this.channels, channel];

        const url = await this.$graffiti.put(
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
            channels: channels,
            allowed: participants,
          },
          session
        );
        console.log(url);
        this.creatingChat = false;
        this.chatName = "";
        this.selectedChannel = channel;
        this.participants = "";
      },
      addFriend() {
        const name = this.participantQuery.trim();
        if (
          name &&
          this.friends.includes(name) &&
          !this.participants.includes(name)
        ) {
          this.participants.push(name);
        }
        this.participantQuery = "";
      },
    },
    template: await fetch("./create-chat.html").then((r) => r.text()),
  };
}
