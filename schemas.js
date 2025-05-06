export const profileSchema = {
  properties: {
    value: {
      required: ["type", "describes", "published", "generator", "name", "icon"],
      properties: {
        type: { const: "Profile" },
        name: { type: "string" },
        pronouns: { type: "string" },
        bio: { type: "string" },
        icon: { type: "string" },
        describes: { type: "string" },
        published: { type: "number" },
        generator: { type: "string" },
      },
    },
  },
};
