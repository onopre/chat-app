import { createApp, defineAsyncComponent } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

import { ChatList } from "./chat-list.js";
import { Chat } from "./chat.js";
import { CreateChat } from "./create-chat.js";
import { Profile } from "./profile.js";

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
})
  .use(router)
  .use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
    //graffiti: new GraffitiRemote(),
  })
  .mount("#app");
