import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";

// vue-router set the position in the history state when navigating, but it doesn't provide a way to access it, so we have to do it ourselves
const getPosition = () => ((history.state as Record<string, unknown> | null)?.position as number) ?? 0;

export const useRouterHistoryStore = defineStore("routing-history", () => {
  const router = useRouter();
  const snapshots = ref<number[]>([]);

  const takeSnapshot = () => {
    snapshots.value.push(getPosition());
  };
  const restoreSnapshot = () => {
    const snapshotPosition = snapshots.value.pop();
    if (snapshotPosition === undefined) {
      return;
    }
    const stepsToGoBack = getPosition() - snapshotPosition;
    if (stepsToGoBack > 0) {
      router.go(-stepsToGoBack);
    }
  };

  return {
    restoreSnapshot,
    takeSnapshot,
  };
});
