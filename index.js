import { createApp, defineAsyncComponent } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

import { ChatList } from "./chat-list.js";
import { Chat } from "./chat.js";
import { CreateChat } from "./create-chat.js";
import { Profile } from "./profile.js";
import { profileSchema } from "./schemas.js";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // Add your routes here
    { path: "/", component: ChatList },
    { path: "/chat/:channel", component: Chat, props: true },
    { path: "/profile", component: Profile, props: true },
    { path: "/create-chat", component: CreateChat },
  ],
});

createApp({
  components: {
    ChatList: defineAsyncComponent(ChatList),
    Profile: defineAsyncComponent(Profile),
    Chat: defineAsyncComponent(Chat),
    CreateChat: defineAsyncComponent(CreateChat),
  },
  computed: {
    actor() {
      return this.$graffitiSession.value.actor;
    },
  },
  methods: {
    async createAccount() {
      const profileObjectsGenerator = this.$graffiti.discover(
        [this.actor],
        profileSchema
      );
      const profileObjects = [];
      for await (const { object } of profileObjectsGenerator) {
        profileObjects.push(object);
      }
      //console.log("profileObjects", profileObjects);

      const actorProfiles = profileObjects?.filter(
        (p) => p.value.describes === this.actor
      );
      console.log("actorProfiles", actorProfiles);
      if (actorProfiles?.length > 0) {
        console.log("profile already exists");
        return;
      }

      console.log("Creating account");
      const value = {
        activity: "Create",
        type: "Profile",
        name: this.actor,
        pronouns: "",
        bio: "",
        icon: "/user.svg",
        describes: this.actor,
        published: Date.now(),
        generator: "https://onopre.github.io/chat-app/",
      };
      //const channels = [this.actor, "designftw-2025-studio2"];
      const channels = [this.actor];

      await this.$graffiti.put(
        {
          value: value,
          channels: channels,
        },
        this.$graffitiSession.value
      );
    },
  },
})
  .use(router)
  .use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
    //graffiti: new GraffitiRemote(),
  })
  .mount("#app");
