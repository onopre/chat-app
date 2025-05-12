import {
  useGraffitiDiscover,
  useGraffitiSession,
} from "@graffiti-garden/wrapper-vue";
import { useFriends } from "./utils.js";
import { profileSchema } from "./schemas.js";

export async function Friends() {
  return {
    props: ["username"],
    data() {
      return {
        copied: false,
        friendActor: "",
        profileSchema: profileSchema,
      };
    },
    setup() {
      return useFriends();
    },

    methods: {
      copyActor() {
        navigator.clipboard.writeText(this.username);
        this.copied = true;
        setTimeout(() => (this.copied = false), 500);
      },
      getUnique(otherProfiles) {
        //console.log("otherProfiles", otherProfiles);
        //console.log(this.accepted);
        const sortedProfiles = [...otherProfiles].sort(
          (a, b) => b.lastModified - a.lastModified
        );
        const seen = new Set();
        const uniqueProfiles = [];
        for (const profile of sortedProfiles) {
          if (
            profile.value.name &&
            !seen.has(profile.value.describes)
            //&&
            //!this.accepted.includes(profile.value.describes) &&
            //!this.sentRequests.includes(profile.value.describes) &&
            //!this.friendRequests.includes(profile.value.describes)
          ) {
            //console.log(profile.value.describes);
            //console.log(this.accepted);
            //console.log("Adding profile", profile.value.name);
            seen.add(profile.value.describes);
            uniqueProfiles.push(profile);
          }
        }
        //console.log("uniqueProfiles", uniqueProfiles);
        return uniqueProfiles;
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
