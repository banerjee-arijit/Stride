const DB_NAME = "stride-offline";
const DB_VERSION = 1;
const TASKS_STORE = "tasks";
const PROFILES_STORE = "profiles";
const QUEUE_STORE = "syncQueue";

const openDatabase = () =>
  new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(TASKS_STORE)) {
        db.createObjectStore(TASKS_STORE, { keyPath: "userId" });
      }

      if (!db.objectStoreNames.contains(PROFILES_STORE)) {
        db.createObjectStore(PROFILES_STORE, { keyPath: "userId" });
      }

      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runStore = async (storeName, mode, action) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export const getCachedTasks = async (userId) => {
  if (!userId) return [];
  const record = await runStore(TASKS_STORE, "readonly", (store) => store.get(userId)).catch(() => null);
  return record?.tasks || [];
};

export const cacheTasks = async (userId, tasks) => {
  if (!userId) return;
  await runStore(TASKS_STORE, "readwrite", (store) =>
    store.put({ userId, tasks, updatedAt: new Date().toISOString() })
  ).catch(() => {});
};

export const getCachedProfile = async (userId) => {
  if (!userId) return null;
  const record = await runStore(PROFILES_STORE, "readonly", (store) => store.get(userId)).catch(() => null);
  return record?.profile || null;
};

export const cacheProfile = async (userId, profile) => {
  if (!userId || !profile) return;
  await runStore(PROFILES_STORE, "readwrite", (store) =>
    store.put({ userId, profile, updatedAt: new Date().toISOString() })
  ).catch(() => {});
};

export const enqueueAction = async (userId, action) => {
  if (!userId) return null;

  const queuedAction = {
    ...action,
    userId,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString()
  };

  await runStore(QUEUE_STORE, "readwrite", (store) => store.put(queuedAction)).catch(() => {});
  return queuedAction;
};

export const getQueuedActions = async (userId) => {
  if (!userId) return [];

  const actions = await runStore(QUEUE_STORE, "readonly", (store) => store.getAll()).catch(() => []);
  return actions
    .filter((action) => action.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const removeQueuedAction = async (id) => {
  if (!id) return;
  await runStore(QUEUE_STORE, "readwrite", (store) => store.delete(id)).catch(() => {});
};

export const filterTasks = (tasks, params = {}) => {
  const today = new Date().toLocaleDateString("en-CA");
  const search = params.search?.toLowerCase();

  return tasks
    .filter((task) => {
      if (params.date && task.taskDate !== params.date) return false;
      if (params.view === "today" && task.taskDate !== today) return false;
      if (params.view === "upcoming" && (task.taskDate <= today || task.completed)) return false;
      if (params.view === "completed" && !task.completed) return false;
      if (search && !task.title?.toLowerCase().includes(search)) return false;
      return true;
    })
    .sort((a, b) =>
      `${a.taskDate}${a.startTime || ""}`.localeCompare(`${b.taskDate}${b.startTime || ""}`)
    );
};
