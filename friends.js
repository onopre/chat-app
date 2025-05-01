import {
  useGraffitiDiscover,
  useGraffitiSession,
} from "@graffiti-garden/wrapper-vue";
import { useFriends } from "./utils.js";

export async function Friends() {
  return {
    props: ["username"],
    data() {
      return {
        copied: false,
        friendActor: "",
      };
    },
    setup() {
      return useFriends();
    },

    methods: {
      copyActor() {
        navigator.clipboard.writeText(this.$graffitiSession.value.actor);
        this.copied = true;
        setTimeout(() => (this.copied = false), 500);
      },
      addFriend(friendActor, session) {
        if (!friendActor) return;
        this.$graffiti.put(
          {
            value: {
              activity: "friend",
              target: friendActor,
            },
            channels: [session.actor, friendActor],
          },
          session
        );
        this.friendActor = "";
      },
    },

    template: await fetch("./friends.html").then((r) => r.text()),
  };
}
