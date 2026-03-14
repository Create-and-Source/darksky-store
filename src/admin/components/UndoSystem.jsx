// ══════════════════════════════════════════
// UNDO SYSTEM — Global undo stack for admin actions
// ══════════════════════════════════════════

const UNDO_KEY = 'ds_undo_stack';
const TRASH_KEY = 'ds_trash';
const MAX_UNDO = 50;

function getStack() {
  try { return JSON.parse(localStorage.getItem(UNDO_KEY) || '[]'); } catch { return []; }
}

function setStack(stack) {
  localStorage.setItem(UNDO_KEY, JSON.stringify(stack));
}

// Push an undoable action
// action: { type: string, description: string, undo: { key: string, value: any }, redo: { key: string, value: any } }
export function pushUndo(action) {
  const stack = getStack();
  stack.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...action,
  });
  if (stack.length > MAX_UNDO) stack.length = MAX_UNDO;
  setStack(stack);
}

// Pop and execute the most recent undo
export function executeUndo() {
  const stack = getStack();
  if (stack.length === 0) return null;
  const action = stack.shift();
  setStack(stack);

  // Restore the previous state
  if (action.undo && action.undo.key && action.undo.value !== undefined) {
    localStorage.setItem(action.undo.key, JSON.stringify(action.undo.value));
  }

  return action;
}

// Get the most recent undoable action description
export function peekUndo() {
  const stack = getStack();
  return stack.length > 0 ? stack[0] : null;
}

// ── TRASH ──
export function getTrash() {
  try { return JSON.parse(localStorage.getItem(TRASH_KEY) || '[]'); } catch { return []; }
}

export function moveToTrash(type, item) {
  const trash = getTrash();
  trash.unshift({
    id: Date.now(),
    type,
    item,
    deletedAt: new Date().toISOString(),
  });
  localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
}

export function restoreFromTrash(trashId) {
  const trash = getTrash();
  const idx = trash.findIndex(t => t.id === trashId);
  if (idx === -1) return null;
  const [entry] = trash.splice(idx, 1);
  localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
  return entry;
}

export function emptyTrash() {
  localStorage.setItem(TRASH_KEY, '[]');
}

// ── Undoable wrapper for store operations ──
// Captures the state of a localStorage key before and after an operation
export function undoable(description, storageKey, operation) {
  const before = localStorage.getItem(storageKey);
  const beforeVal = before ? JSON.parse(before) : null;

  const result = operation();

  const after = localStorage.getItem(storageKey);
  const afterVal = after ? JSON.parse(after) : null;

  pushUndo({
    description,
    undo: { key: storageKey, value: beforeVal },
    redo: { key: storageKey, value: afterVal },
  });

  return result;
}
