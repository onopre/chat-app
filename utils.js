import {
  useGraffitiDiscover,
  useGraffitiSession,
} from "@graffiti-garden/wrapper-vue";
import { computed } from "vue";

export function useFriends() {
  const session = useGraffitiSession();
  const { objects: friendObjects } = useGraffitiDiscover(
    () => [session.value.actor],
    {
      properties: {
        value: {
          required: ["activity", "target"],
          properties: {
            activity: { const: "friend" },
            target: { type: "string" },
          },
        },
      },
    }
  );

  const myRequests = computed(
    () =>
      new Set(
        friendObjects.value
          .filter((f) => f.actor === session.value.actor)
          .map((f) => f.value.target)
      )
  );

  const theirRequests = computed(
    () =>
      new Set(
        friendObjects.value
          .filter((f) => f.value.target === session.value.actor)
          .map((f) => f.actor)
      )
  );
  const friendRequests = computed(() =>
    [...theirRequests.value].filter((x) => !myRequests.value.has(x))
  );
  const sentRequests = computed(() =>
    [...myRequests.value].filter((x) => !theirRequests.value.has(x))
  );

  const accepted = computed(() =>
    [...myRequests.value].filter((x) => theirRequests.value.has(x))
  );

  return {
    accepted,
    friendRequests,
    sentRequests,
    friendObjects,
  };
}
