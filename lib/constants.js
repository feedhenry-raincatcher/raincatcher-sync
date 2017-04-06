module.exports = {
  TOPIC_PREFIX: "wfm",
  SYNC_TOPIC_PREFIX: "wfm:sync",
  ERROR_PREFIX: "error",
  DONE_PREFIX: "done",
  TOPICS: {
    CREATE: "create",
    UPDATE: "update",
    LIST: "list",
    REMOVE: "remove",
    READ: "read",
    START: "start",
    STOP: "stop",
    FORCE_SYNC: "force_sync"
  },
  SYNC_TOPICS:{
    REMOTE_UPDATE_APPLIED: "remote_update_applied",
    REMOTE_UPDATE_FAILED: "remote_update_failed"
  }
};