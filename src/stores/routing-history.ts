import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRouterHistoryStore = defineStore('routing-history', () => {
  const backHistory = ref<string[]>([])
  const parentHistory = ref<string[]>([])
  const addBackHistory = (path: string) => {
    backHistory.value.push(path)
  }
  const addParentHistory = (path: string) => {
    parentHistory.value.push(path)
  }
  const removeBackHistory = () => {
    return backHistory.value.pop()
  }
  const removeParentHistory = () => {
    return parentHistory.value.pop()
  }
  const clearBackHistory = () => {
    backHistory.value = []
  }
  const clearParentHistory = () => {
    parentHistory.value = []
  }
  const peekBackHistory = () => {
    return backHistory.value[backHistory.value.length - 1]
  }
  const peekParentHistory = () => {
    return parentHistory.value[parentHistory.value.length - 1]
  }

  return {
    backHistory,
    parentHistory,
    addBackHistory,
    addParentHistory,
    removeBackHistory,
    removeParentHistory,
    clearBackHistory,
    clearParentHistory,
    peekBackHistory,
    peekParentHistory
  }
})
