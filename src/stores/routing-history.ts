import { defineStore } from "pinia";
import { ref } from "vue";

export const useRouterHistoryStore = defineStore("routing-history", () => {
  const snapshots = ref<number[]>([]);
  const takeSnapshot = () => {
    snapshots.value.push(history.length);
  };
  const restoreSnapshot = () => {
    const snapshotIndex = snapshots.value.pop();
    if (snapshotIndex === undefined) {
      return;
    }
    const stepsToGoBack = history.length - snapshotIndex;
    if (stepsToGoBack > 0) {
      history.go(-stepsToGoBack);
    }
  };

  return {
    restoreSnapshot,
    takeSnapshot,
  };
});
