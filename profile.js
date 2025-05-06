import { defineAsyncComponent } from "vue";
import { useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { Friends } from "./friends.js";
import { profileSchema } from "./schemas.js";

export async function Profile() {
  return {
    props: ["username"],
    components: { Friends: defineAsyncComponent(Friends) },
    data() {
      return {
        profileEditable: null,
        profileObject: null,
        copied: false,
        profileSchema: profileSchema,
        editingProfile: false,
        isLoading: true,
        initialLoad: true,
      };
    },
    beforeRouteLeave(to, from, next) {
      if (this.editingProfile) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        );
        if (!confirmLeave) return next(false);
        this.editingProfile = false;
      }
      next();
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
      //console.log("profileObjects", profileObjects);
      return { profileObjects };
    },

    methods: {
      getLatestProfile(profiles) {
        //console.log("getLatestProfile", profiles);
        const latestProfile = profiles.sort(
          (a, b) => b.value.published - a.value.published
        )[0];

        //console.log("latestProfile", latestProfile.value);
        this.profileObject = latestProfile;
        this.profileEditable = {
          name: latestProfile.value.name,
          pronouns: latestProfile.value.pronouns,
          bio: latestProfile.value.bio,
          icon: latestProfile.value.icon,
        };
        //console.log("profileEditable", this.profileEditable);
        return latestProfile;
      },
      copyActor() {
        navigator.clipboard.writeText(this.$graffitiSession.value.actor);
        this.copied = true;
        setTimeout(() => (this.copied = false), 500);
      },
      async updateProfile(latestProfile, session) {
        if (!this.profileEditable.name) return;
        console.log("updating profile");
        console.log("latestProfile", latestProfile);
        console.log("profileEditable", this.profileEditable);

        const channels = [this.actor, "designftw-2025-studio2"];
        const value = {
          activity: "Update",
          type: "Profile",
          name: this.profileEditable.name,
          pronouns: this.profileEditable.pronouns,
          bio: this.profileEditable.bio,
          describes: this.actor,
          published: Date.now(),
          generator: "https://onopre.github.io/chat-app/",
        };
        //console.log("value", value);
        await this.$graffiti.put(
          {
            value: value,
            channels: channels,
          },
          session
        );
        this.editingProfile = false;
      },
    },
    template: await fetch("./profile.html").then((r) => r.text()),
  };
}
