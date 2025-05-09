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

export function getParticipantList(originalObject, participantObjects) {
  //console.log("getParticipantList");
  //console.log("originalObject", originalObject);
  //console.log("participantObjects", participantObjects);
  if (!originalObject) return [];
  participantObjects.sort((a, b) => {
    return a.value.timestamp - b.value.timestamp;
  });
  const participants = [...originalObject.value.object.participants];
  for (let i = 0; i < participantObjects.length; i++) {
    const participant = participantObjects[i];
    if (participants.includes(participant.value.actor)) {
      if (participant.value.activity === "Leave") {
        participants.splice(participants.indexOf(participant.value.actor), 1);
      }
    } else {
      if (participant.value.activity === "Add") {
        participants.push(participant.value.actor);
      }
    }
  }
  return participants;
}
