import { defineAsyncComponent } from "vue";
import { useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { Friends } from "./friends.js";

export async function Profile() {
  return {
    props: ["username"],
    components: { Friends: defineAsyncComponent(Friends) },
    data() {
      return {
        profile: {
          name: this.username,
          pronouns: "",
          bio: "",
        },
        editingField: {
          name: false,
          pronouns: false,
          bio: false,
        },
        schema: {
          properties: {
            value: {
              required: ["describes"],
              properties: {
                describes: { type: "string" },
              },
            },
          },
        },
      };
    },
    computed: {
      actor() {
        return this.$graffitiSession.value?.actor;
      },
    },
    setup(props) {
      const { objects: profileObjects } = useGraffitiDiscover(
        () => [props.username],
        {
          properties: {
            value: {
              required: ["describes"],
              properties: {
                describes: { type: "string" },
              },
            },
          },
        }
      );
      return { profileObjects };
    },

    methods: {
      loadProfile() {
        const latest = this.profileObjects
          ?.filter((p) => p.value.describes === this.username)
          ?.sort((a, b) => b.published - a.published)[0];
        if (latest) {
          this.profile = { ...this.profile, ...latest.value };
        }
      },

      async toggleEdit(field) {
        if (this.editingField[field]) {
          // Save on second click
          await this.$graffiti.put(
            {
              value: {
                ...this.profile,
                describes: this.actor,
                published: Date.now(),
              },
              channels: [this.actor],
            },
            this.$graffitiSession.value
          );
        }
        this.editingField[field] = !this.editingField[field];
      },
    },
    template: await fetch("./profile.html").then((r) => r.text()),
  };
}
