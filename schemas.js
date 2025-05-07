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

export const groupChatSchema = {
  properties: {
    value: {
      required: ["object", "activity"],
      properties: {
        activity: { const: "Create" },
        object: {
          required: ["type", "name", "channel", "participants"],
          properties: {
            type: { const: "Group Chat" },
            name: { type: "string", minLength: 1 },
            channel: { type: "string" },
            participants: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export const renameSchema = {
  properties: {
    value: {
      required: ["name", "describes"],
      properties: {
        name: { type: "string" },
        describes: { type: "string" },
      },
    },
  },
};

export const messageSchema = {
  properties: {
    value: {
      required: ["content", "published"],
      properties: {
        content: { type: "string" },
        published: { type: "number" },
      },
    },
  },
};
