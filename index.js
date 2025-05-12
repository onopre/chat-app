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

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // Add your routes here
    { path: "/", component: ChatList },
    { path: "/chat/:channel", component: Chat, props: true, name: "chat" },
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
  data() {
    return {
      profileEditable: null,
    };
  },
  methods: {
    prepareNewAccount(username) {
      const value = {
        activity: "Create",
        type: "Profile",
        name: username,
        pronouns: "",
        bio: "",
        icon: "./user.svg",
        describes: username,
        published: Date.now(),
        generator: "https://onopre.github.io/chat-app/",
      };
      const channels = [username, "designftw-2025-studio2"];
      //const channels = [username];
      this.profileEditable = {
        name: value.name,
        pronouns: value.pronouns,
        bio: value.bio,
        icon: value.icon,
      };
      return {
        value: value,
        channels: channels,
      };
    },
    async createProfile(username, session) {
      //discover existing profiles
      const profileObjectsIterator = this.$graffiti.discover(
        [username, "designftw-2025-studio2"],
        profileSchema
      );
      for await (const { object } of profileObjectsIterator) {
        if (object.describes === username) {
          console.log("Profile already exists");
          return;
        }
      }

      const { value, channels } = this.prepareNewAccount(username);
      await this.$graffiti.put(
        {
          value: value,
          channels: channels,
        },
        session
      );
    },
    async login() {
      //console.log("login");
      await this.$graffiti.login();
      await this.createProfile(
        this.$graffitiSession.value.actor,
        this.$graffitiSession
      );
    },
  },
})
  .use(router)
  .use(GraffitiPlugin, {
    //graffiti: new GraffitiLocal(),
    graffiti: new GraffitiRemote(),
  })
  .mount("#app");
